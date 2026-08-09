import type { Metadata } from 'next';
import { Bodoni_Moda, Space_Grotesk } from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import Script from 'next/script';
import './globals.css';
import { site, seoDefaults } from '@/lib/config';
import { getOrCreateCart } from '@/actions/cart';
import { CartUIProvider } from '@/context/CartUIContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

// Display face — a Didone serif in the Bodoni tradition, the same register
// used by fashion editorial mastheads. Used only for headlines, never body copy.
const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

// Interface face — a geometric grotesk with a faint technical edge,
// legible at small sizes for commerce (prices, labels, forms).
const sans = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: seoDefaults.defaultTitle, template: seoDefaults.titleTemplate },
  description: seoDefaults.description,
  openGraph: {
    title: seoDefaults.defaultTitle,
    description: seoDefaults.description,
    url: site.url,
    siteName: site.name,
    locale: site.locale,
    type: 'website',
    images: [{ url: seoDefaults.ogImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoDefaults.defaultTitle,
    description: seoDefaults.description,
  },
  icons: { icon: '/favicon.ico' },
  robots: { index: true, follow: true },
};

// Fastr / Shiprocket Checkout "seller domain" — not yet supplied by Fastr,
// so this is intentionally blank rather than a guessed value. Get the exact
// value from Fastr and set NEXT_PUBLIC_FASTR_SELLER_DOMAIN before launch.
const fastrSellerDomain = process.env.NEXT_PUBLIC_FASTR_SELLER_DOMAIN ?? '';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cart = await getOrCreateCart();
  // Computed server-side (never as a NEXT_PUBLIC_ var) so the Account nav
  // link only ever appears when Shopify Customer Accounts is actually
  // configured — no client/server mismatch, no placeholder link to nowhere.
  const customerAccountsEnabled = Boolean(process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL);

  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fastrr-boost-ui.pickrr.com/assets/styles/shopify.css" />
      </head>
      <body>
        <MotionConfig reducedMotion="user">
        <CartUIProvider initialCart={cart}>
          <WishlistProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-lunar focus:px-4 focus:py-2 focus:text-obsidian"
            >
              Skip to content
            </a>
            <Header customerAccountsEnabled={customerAccountsEnabled} />
            <main id="main-content">{children}</main>
            <Footer />
            <CartDrawer />
            <input type="hidden" value={fastrSellerDomain} id="sellerDomain" />
          </WishlistProvider>
        </CartUIProvider>
        </MotionConfig>
        <Script
          src="https://fastrr-boost-ui.pickrr.com/assets/js/channels/shopify.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
