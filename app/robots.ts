import type { MetadataRoute } from 'next';

const SITE_URL = 'https://leoluciano.com.br';

// Gera /robots.txt automaticamente (App Router). Libera todo o site para os
// buscadores e aponta para o sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
