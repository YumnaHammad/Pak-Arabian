const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://azwah.example.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private, transactional or personalised — nothing a crawler should index.
        disallow: ['/admin', '/admin/', '/api/', '/account', '/checkout', '/order/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
