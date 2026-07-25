// All Shopify Storefront API GraphQL documents used by this app, kept in
// one place so the schema surface LUNARO depends on is easy to audit.

const MONEY_FIELDS = `
  amount
  currencyCode
`;

const IMAGE_FIELDS = `
  url
  altText
  width
  height
`;

const PRODUCT_CARD_FIELDS = `
  id
  handle
  title
  availableForSale
  tags
  priceRange {
    minVariantPrice { ${MONEY_FIELDS} }
    maxVariantPrice { ${MONEY_FIELDS} }
  }
  images(first: 2) {
    nodes { ${IMAGE_FIELDS} }
  }
  options { name values }
  variants(first: 50) {
    nodes { availableForSale selectedOptions { name value } }
  }
`;

export const PRODUCT_FULL_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  availableForSale
  tags
  productType
  seo { title description }
  options { name values }
  priceRange {
    minVariantPrice { ${MONEY_FIELDS} }
    maxVariantPrice { ${MONEY_FIELDS} }
  }
  images(first: 10) {
    nodes { ${IMAGE_FIELDS} }
  }
  variants(first: 50) {
    nodes {
      id
      title
      availableForSale
      price { ${MONEY_FIELDS} }
      compareAtPrice { ${MONEY_FIELDS} }
      selectedOptions { name value }
      image { ${IMAGE_FIELDS} }
    }
  }
`;

export const GET_PRODUCTS = `#graphql
  query GetProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
      pageInfo { hasNextPage endCursor }
      nodes { ${PRODUCT_CARD_FIELDS} }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE = `#graphql
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FULL_FIELDS}
    }
  }
`;

export const GET_COLLECTIONS = `#graphql
  query GetCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image { ${IMAGE_FIELDS} }
      }
    }
  }
`;

export const GET_COLLECTION_BY_HANDLE = `#graphql
  query GetCollection($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { ${IMAGE_FIELDS} }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        pageInfo { hasNextPage endCursor }
        nodes { ${PRODUCT_CARD_FIELDS} }
      }
    }
  }
`;

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { ${MONEY_FIELDS} }
    totalAmount { ${MONEY_FIELDS} }
    totalTaxAmount { ${MONEY_FIELDS} }
  }
  discountCodes { code applicable }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost { totalAmount { ${MONEY_FIELDS} } }
      merchandise {
        ... on ProductVariant {
          id
          title
          price { ${MONEY_FIELDS} }
          selectedOptions { name value }
          product {
            title
            handle
            images(first: 1) { nodes { url altText } }
          }
        }
      }
    }
  }
`;

export const GET_ARTICLES = `#graphql
  query GetArticles($blogHandle: String!, $first: Int!) {
    blog(handle: $blogHandle) {
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          handle
          title
          excerpt
          publishedAt
          image { ${IMAGE_FIELDS} }
        }
      }
    }
  }
`;

export const GET_ARTICLE_BY_HANDLE = `#graphql
  query GetArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        handle
        title
        contentHtml
        publishedAt
        image { ${IMAGE_FIELDS} }
        seo { title description }
      }
    }
  }
`;
export const CREATE_CART = `#graphql  
mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const GET_CART = `#graphql
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FIELDS}
    }
  }
`;

export const CART_LINES_ADD = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_DISCOUNT_UPDATE = `#graphql
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;
