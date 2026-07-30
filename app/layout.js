import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { BRAND, CONTACT } from '@/lib/content/site';
import Providers from '@/components/layout/Providers';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://azwah.example.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.legal} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.legal}`,
  },
  description: BRAND.description,
  keywords: [
    'perfume', 'fragrance', 'eau de parfum', 'oud', 'attar',
    'luxury fragrance Pakistan', 'Azwah', 'Sadiqabad perfume',
  ],
  authors: [{ name: BRAND.owner }],
  creator: BRAND.legal,
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_URL,
    siteName: BRAND.legal,
    title: `${BRAND.legal} — ${BRAND.tagline}`,
    description: BRAND.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.legal} — ${BRAND.tagline}`,
    description: BRAND.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: '/' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080A' },
    { media: '(prefers-color-scheme: light)', color: '#F4F1EC' },
  ],
  colorScheme: 'dark light',
};

/**
 * Replays the stored theme before first paint. Without this the page renders
 * in Noir for a frame before switching to Ivoire, which reads as a flash.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('azwah_theme');document.documentElement.setAttribute('data-theme',t==='ivoire'?'ivoire':'noir');}catch(e){document.documentElement.setAttribute('data-theme','noir');}})();`;

/* Organisation + storefront structured data */
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: BRAND.legal,
  description: BRAND.description,
  url: SITE_URL,
  telephone: '+923101272021',
  email: CONTACT.email,
  founder: { '@type': 'Person', name: BRAND.owner },
  foundingDate: BRAND.founded,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT.address.line1,
    addressLocality: BRAND.city,
    addressRegion: 'Punjab',
    addressCountry: 'PK',
  },
  currenciesAccepted: 'PKR',
  paymentAccepted: 'Cash on Delivery',
  sameAs: CONTACT.socials.map((s) => s.href),
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="noir"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
      </head>
      <body className="font-body">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
