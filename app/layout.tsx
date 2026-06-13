import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = 'https://leoluciano.com.br';
const SITE_TITLE = 'Leonardo Luciano — Desenvolvedor Front-end & Cloud Operations';
const SITE_DESCRIPTION =
  'Desenvolvedor front-end e profissional de Cloud Operations. Crio landing pages e sites rápidos, acessíveis e de alta conversão para negócios reais.';
// A imagem de preview (og:image / twitter:image) é gerada dinamicamente em
// app/opengraph-image.tsx e injetada automaticamente pelo Next.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: 'Portfólio de Leonardo Luciano',
  authors: [{ name: 'Leonardo Luciano', url: SITE_URL }],
  creator: 'Leonardo Luciano',
  keywords: [
    'Leonardo Luciano',
    'desenvolvedor front-end',
    'desenvolvimento web',
    'Cloud Operations',
    'landing pages',
    'Next.js',
    'React',
    'portfólio',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Leonardo Luciano',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
