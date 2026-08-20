// Minimal typing for the Shopify Storefront GraphQL data this app touches.
// Intentionally not exhaustive — extend as new fields are queried.

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  tags: string[];
  productType: string;
  options: ProductOption[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  images: ShopifyImage[];
  variants: ProductVariant[];
  seo: { title: string | null; description: string | null };
};

export type ProductCardData = Pick<
  Product,
  'id' | 'handle' | 'title' | 'availableForSale' | 'priceRange' | 'images'
> & {
  tags: string[];

  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };

  // Present when fetched for the shop/collection grid so client-side
  // filter controls can narrow results before the page renders.
  filterOptions?: ProductOption[];

  filterVariants?: {
    availableForSale: boolean;
    selectedOptions: {
      name: string;
      value: string;
    }[];
  }[];
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: ProductCardData[];
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    product: { title: string; handle: string; images: { url: string; altText: string | null }[] };
    selectedOptions: { name: string; value: string }[];
    price: Money;
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: CartLine[];
  discountCodes: { code: string; applicable: boolean }[];
};

export type CartActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};
