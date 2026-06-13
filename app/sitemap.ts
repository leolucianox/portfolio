import type { MetadataRoute } from 'next';

const SITE_URL = 'https://leoluciano.com.br';

// Gera /sitemap.xml automaticamente (App Router). O site é single-page, então
// há apenas a rota raiz. Ao criar novas rotas, adicione-as a esta lista.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
