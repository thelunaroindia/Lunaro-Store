// TypeScript may not have type declarations for 'server-only' (side-effect import).
// @ts-ignore: Module has no type declarations
import 'server-only';
import {
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_COLLECTIONS,
  GET_COLLECTION_BY_HANDLE,
  GET_ARTICLES,
  GET_ARTICLE_BY_HANDLE,
  CREATE_CART,
  GET_CART,
  CART_LINES_ADD,
  CART_LINES_UPDATE,
  CART_LINES_REMOVE,
  CART_DISCOUNT_UPDATE,
} from './queries';
import type { Cart, Collection, Product, ProductCardData, TransmissionArticle, TransmissionSummary } from './types';

// ── Configuration ─────────────────────────────────────────────────────
// This file is the ONLY place that talks to Shopify. It runs exclusively
// on the server (see the `server-only` import above) — the Storefront
// token never reaches the browser bundle.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

export class ShopifyNotConfiguredError extends Error {
  constructor() {
    super(
      'Shopify is not configured yet. Set SHOPIFY_STORE_DOMAIN and ' +
        'SHOPIFY_STOREFRONT_ACCESS_TOKEN in your environment. See docs/SHOPIFY_SETUP.md.'
    );
    this.name = 'ShopifyNotConfiguredError';
  }
}

function endpoint() {
  if (!DOMAIN || !TOKEN) throw new ShopifyNotConfiguredError();
  return `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts?: { cache?: RequestCache; revalidate?: number; tags?: string[] }
): Promise<T> {
  const res = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN as string,
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    // Product/collection reads are cached and revalidated; cart operations
    // pass cache: 'no-store' explicitly below.
    next: opts?.revalidate !== undefined ? { revalidate: opts.revalidate, tags: opts.tags } : undefined,
    cache: opts?.cache,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Shopify Storefront API error (${res.status}): ${body}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(`Shopify Storefront API error: ${json.errors.map((e) => e.message).join(', ')}`);
  }
  if (!json.data) throw new Error('Shopify Storefront API returned no data.');

  return json.data;
}

// ── Normalisers ───────────────────────────────────────────────────────
// Storefront API returns { nodes: [...] } / { url, altText } shapes that
// map closely to our internal types already — kept thin on purpose.

function normaliseProduct(p: any): Product {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    availableForSale: p.availableForSale,
    tags: p.tags ?? [],
    productType: p.productType,
    options: p.options ?? [],
    priceRange: p.priceRange,
    images: p.images?.nodes ?? [],
    variants: p.variants?.nodes ?? [],
    seo: p.seo ?? { title: null, description: null },
  };
}

function normaliseProductCard(p: any): ProductCardData {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    availableForSale: p.availableForSale,
    tags: p.tags ?? [],
    priceRange: p.priceRange,
    images: p.images?.nodes ?? [],
    filterOptions: p.options ?? [],
    filterVariants: (p.variants?.nodes ?? []).map((v: any) => ({
      availableForSale: v.availableForSale,
      selectedOptions: v.selectedOptions ?? [],
    })),
  };
}

function normaliseCart(c: any): Cart {
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    cost: c.cost,
    discountCodes: c.discountCodes ?? [],
    lines: (c.lines?.nodes ?? []).map((line: any) => ({
      id: line.id,
      quantity: line.quantity,
      cost: line.cost,
      merchandise: {
        id: line.merchandise.id,
        title: line.merchandise.title,
        price: line.merchandise.price,
        selectedOptions: line.merchandise.selectedOptions ?? [],
        product: {
          title: line.merchandise.product.title,
          handle: line.merchandise.product.handle,
          images: line.merchandise.product.images?.nodes ?? [],
        },
      },
    })),
  };
}

// ── Catalogue reads (cached, ISR-revalidated) ─────────────────────────

export async function getProducts(params?: {
  first?: number;
  sortKey?: 'BEST_SELLING' | 'CREATED_AT' | 'PRICE' | 'TITLE' | 'RELEVANCE';
  reverse?: boolean;
  query?: string;
}): Promise<ProductCardData[]> {
  const data = await shopifyFetch<{ products: { nodes: any[] } }>(
    GET_PRODUCTS,
    {
      first: params?.first ?? 24,
      sortKey: params?.sortKey ?? 'CREATED_AT',
      reverse: params?.reverse ?? true,
      query: params?.query,
    },
    { revalidate: 60, tags: ['products'] }
  );
  return data.products.nodes.map(normaliseProductCard);
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: any | null }>(
    GET_PRODUCT_BY_HANDLE,
    { handle },
    { revalidate: 60, tags: [`product:${handle}`] }
  );
  return data.product ? normaliseProduct(data.product) : null;
}

export async function getCollections(first = 12): Promise<Omit<Collection, 'products'>[]> {
  const data = await shopifyFetch<{ collections: { nodes: any[] } }>(
    GET_COLLECTIONS,
    { first },
    { revalidate: 300, tags: ['collections'] }
  );
  return data.collections.nodes.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    image: c.image ?? null,
  }));
}

export async function getCollectionByHandle(
  handle: string,
  params?: { first?: number; after?: string; sortKey?: string; reverse?: boolean }
): Promise<Collection | null> {
  const data = await shopifyFetch<{ collection: any | null }>(
    GET_COLLECTION_BY_HANDLE,
    {
      handle,
      first: params?.first ?? 24,
      after: params?.after ?? null,
      sortKey: params?.sortKey ?? 'COLLECTION_DEFAULT',
      reverse: params?.reverse ?? false,
    },
    { revalidate: 60, tags: [`collection:${handle}`] }
  );
  if (!data.collection) return null;
  return {
    id: data.collection.id,
    handle: data.collection.handle,
    title: data.collection.title,
    description: data.collection.description,
    image: data.collection.image ?? null,
    products: (data.collection.products.nodes ?? []).map(normaliseProductCard),
  };
}

// ── Transmissions (Shopify Blog) ───────────────────────────────────────
// Transmissions is modelled as a standard Shopify blog with the handle
// below, so the owner manages posts entirely from Shopify Admin →
// Online Store → Blog posts. See docs/OWNER_ADMIN_GUIDE.md.
const TRANSMISSIONS_BLOG_HANDLE = 'transmissions';

export async function getTransmissions(first = 12): Promise<TransmissionSummary[]> {
  const data = await shopifyFetch<{ blog: { articles: { nodes: any[] } } | null }>(
    GET_ARTICLES,
    { blogHandle: TRANSMISSIONS_BLOG_HANDLE, first },
    { revalidate: 300, tags: ['transmissions'] }
  );
  return (data.blog?.articles.nodes ?? []).map((a) => ({
    id: a.id,
    handle: a.handle,
    title: a.title,
    excerpt: a.excerpt,
    publishedAt: a.publishedAt,
    image: a.image ?? null,
  }));
}

export async function getTransmissionByHandle(handle: string): Promise<TransmissionArticle | null> {
  const data = await shopifyFetch<{ blog: { articleByHandle: any | null } | null }>(
    GET_ARTICLE_BY_HANDLE,
    { blogHandle: TRANSMISSIONS_BLOG_HANDLE, articleHandle: handle },
    { revalidate: 300, tags: [`transmission:${handle}`] }
  );
  const a = data.blog?.articleByHandle;
  if (!a) return null;
  return {
    id: a.id,
    handle: a.handle,
    title: a.title,
    contentHtml: a.contentHtml,
    publishedAt: a.publishedAt,
    image: a.image ?? null,
    seo: a.seo ?? { title: null, description: null },
  };
}

// ── Cart writes (never cached) ─────────────────────────────────────────

export async function createCart(lines?: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: any; userErrors: any[] } }>(
    CREATE_CART,
    { lines },
    { cache: 'no-store' }
  );
  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '));
  }
  return normaliseCart(data.cartCreate.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: any | null }>(GET_CART, { cartId }, { cache: 'no-store' });
  return data.cart ? normaliseCart(data.cart) : null;
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: any; userErrors: any[] } }>(
    CART_LINES_ADD,
    { cartId, lines },
    { cache: 'no-store' }
  );
  if (data.cartLinesAdd.userErrors.length) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(', '));
  }
  return normaliseCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: any; userErrors: any[] } }>(
    CART_LINES_UPDATE,
    { cartId, lines },
    { cache: 'no-store' }
  );
  if (data.cartLinesUpdate.userErrors.length) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join(', '));
  }
  return normaliseCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: any; userErrors: any[] } }>(
    CART_LINES_REMOVE,
    { cartId, lineIds },
    { cache: 'no-store' }
  );
  if (data.cartLinesRemove.userErrors.length) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(', '));
  }
  return normaliseCart(data.cartLinesRemove.cart);
}

export async function applyDiscountCode(cartId: string, code: string): Promise<Cart> {
  const data = await shopifyFetch<{ cartDiscountCodesUpdate: { cart: any; userErrors: any[] } }>(
    CART_DISCOUNT_UPDATE,
    { cartId, discountCodes: [code] },
    { cache: 'no-store' }
  );
  if (data.cartDiscountCodesUpdate.userErrors.length) {
    throw new Error(data.cartDiscountCodesUpdate.userErrors.map((e) => e.message).join(', '));
  }
  return normaliseCart(data.cartDiscountCodesUpdate.cart);
}

export function isShopifyConfigured(): boolean {
  return Boolean(DOMAIN && TOKEN);
}
