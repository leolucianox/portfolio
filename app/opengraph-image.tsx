import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Imagem de preview gerada dinamicamente (WhatsApp, LinkedIn, Twitter/X, etc.).
// O Next serve este arquivo em /opengraph-image e injeta as tags og:image /
// twitter:image automaticamente — não é preciso referenciá-lo no metadata.
export const alt = 'Leonardo Luciano — Desenvolvedor Front-end & Cloud Operations';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Carrega uma fonte do Google Fonts em runtime para usar no Satori (motor do
// ImageResponse). Se a rede falhar, caímos na fonte padrão sem quebrar o build.
async function loadGoogleFont(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`Falha ao localizar a fonte ${family}`);
  return (await fetch(src)).arrayBuffer();
}

export default async function OpengraphImage() {
  const title = 'Leonardo Luciano';
  const subtitle = 'Desenvolvedor Front-end & Cloud Operations';
  const kicker = 'Portfólio';

  // Retrato embutido como data URI (lido do filesystem, sem depender da rede).
  const portrait = await readFile(join(process.cwd(), 'public/images/leoprofile.jpg'));
  const portraitSrc = `data:image/jpeg;base64,${portrait.toString('base64')}`;

  // Fontes: tenta carregar Bricolage (display) p/ o nome e Plus Jakarta p/ o resto.
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 600 | 800; style: 'normal' }[] = [];
  try {
    const [display, sans] = await Promise.all([
      loadGoogleFont('Bricolage Grotesque', 800, title),
      loadGoogleFont('Plus Jakarta Sans', 600, subtitle + kicker),
    ]);
    fonts.push(
      { name: 'Display', data: display, weight: 800, style: 'normal' },
      { name: 'Sans', data: sans, weight: 600, style: 'normal' },
    );
  } catch {
    // Sem fontes customizadas: o Satori usa a fonte padrão embutida.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#050505',
          backgroundImage:
            'radial-gradient(120% 120% at 0% 0%, rgba(47,107,73,0.35) 0%, transparent 55%), radial-gradient(120% 120% at 100% 100%, rgba(44,74,133,0.30) 0%, transparent 55%)',
          padding: '88px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '660px' }}>
          <div
            style={{
              fontFamily: 'Sans',
              fontSize: 26,
              letterSpacing: 10,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              fontFamily: 'Display',
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1,
              color: '#ffffff',
              marginTop: 28,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: 'Sans',
              fontSize: 36,
              fontWeight: 600,
              lineHeight: 1.25,
              color: 'rgba(255,255,255,0.72)',
              marginTop: 32,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portraitSrc}
          width={320}
          height={320}
          alt=""
          style={{
            borderRadius: 36,
            objectFit: 'cover',
            border: '2px solid rgba(255,255,255,0.18)',
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: fonts.length
        ? fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style }))
        : undefined,
    },
  );
}
