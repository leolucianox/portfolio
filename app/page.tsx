'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Check, ChevronDown, Clock, Layers, Mail } from 'lucide-react';
import FlowArt, { FlowSection } from '@/components/ui/story-scroll';

/* -------------------------------------------------------------------------- */
/*  Ícones de marca (SVG inline — evita dependência de brand-icons da lucide) */
/* -------------------------------------------------------------------------- */

type IconProps = { className?: string };

const WhatsAppIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.51l-.56-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.99-1.4.24-.69.24-1.28.17-1.4-.07-.13-.27-.2-.57-.35zM12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.42 1.27 4.86L2 22l5.27-1.38a9.96 9.96 0 0 0 4.77 1.22c5.52 0 10-4.48 10-10s-4.48-10-9.99-10zm0 18.18c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.13.82.84-3.05-.2-.31a8.16 8.16 0 0 1-1.25-4.36c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.21 8.2z" />
  </svg>
);

const GitHubIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedInIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  ProjectCard                                                               */
/*  Imagem estática (screenshot da homepage carregada) por padrão; no hover,  */
/*  revela o preview ao vivo (iframe) que faz um "scroll" lento e suave.      */
/* -------------------------------------------------------------------------- */

/** Largura de referência (desktop) usada para escalar o iframe sem distorcer. */
const BASE_WIDTH = 1280;
/** Altura do documento renderizado dentro do iframe (espaço para "rolar"). */
const FRAME_HEIGHT = 2200;

interface ProjectCardProps {
  title: string;
  subtitle?: string;
  href: string;
  /** Imagem de capa local (primeira tela do site). */
  image: string;
  /** Cor de destaque do fallback, harmonizada com a seção. */
  accent: string;
  /** Site já no ar, em uso por um cliente real — exibe o selo "No ar". */
  live?: boolean;
  /** Selo indicando que o projeto nasceu de um template multitema (ex.: "Five Themes"). */
  templateTag?: string;
}

function ProjectCard({ title, subtitle, href, image, accent, live, templateTag }: ProjectCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  // O <iframe> ao vivo só é montado em dispositivos com hover real (desktop).
  // No iOS/Android o preview NUNCA aparece (toque não tem hover) e vários
  // iframes carregando sites externos completos estouram a memória do Safari,
  // derrubando a aba ao chegar nas seções finais (crash observado no iPhone).
  // Sem hover → mostramos apenas a capa estática. Isso elimina o crash e
  // permite adicionar quantos sites quiser sem risco no mobile.
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Mede a largura real do card e calcula a escala do iframe.
  // ResizeObserver mantém o preview nítido e proporcional em qualquer breakpoint.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const update = () => setScale(el.clientWidth / BASE_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block focus:outline-none"
      aria-label={`Abrir ${title} em uma nova aba`}
    >
      {/* Palco do preview */}
      <div
        ref={stageRef}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/12 bg-white/[0.03] shadow-[0_16px_50px_-30px_rgba(0,0,0,0.9)] transition-[transform,border-color,box-shadow] duration-500 ease-out will-change-transform group-hover:-translate-y-1 group-hover:border-white/25 group-hover:shadow-[0_32px_80px_-40px_rgba(0,0,0,0.95)] group-focus-visible:border-white/40"
      >
        {/* Camada-base: gradiente de fallback (sites que bloqueiam embed/print). */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 0% 0%, ${accent}55 0%, transparent 55%), linear-gradient(135deg, ${accent} 0%, #050505 90%)`,
          }}
          aria-hidden
        />

        {/* Preview ao vivo (iframe escalado) — revelado e "rolado" no hover.   */}
        {/* Só em desktop com hover: no mobile não há hover e os iframes        */}
        {/* derrubam o Safari por excesso de memória (ver nota em ProjectCard). */}
        {canHover && (
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: BASE_WIDTH, height: FRAME_HEIGHT, transform: `scale(${scale})` }}
          >
            <iframe
              src={href}
              title={`Preview de ${title}`}
              loading="lazy"
              tabIndex={-1}
              aria-hidden
              scrolling="no"
              className="pointer-events-none h-full w-full border-0 transition-transform duration-[6000ms] ease-out [transform:translateY(0)] group-hover:[transform:translateY(-1200px)] motion-reduce:transition-none motion-reduce:group-hover:[transform:translateY(0)]"
            />
          </div>
        )}

        {/* Imagem de capa local (primeira tela do site) — sempre visível; some no hover. */}
        <Image
          src={image}
          alt={
            subtitle
              ? `Página inicial do site ${title} (${subtitle}), desenvolvido por Leonardo Luciano`
              : `Página inicial do site ${title}, desenvolvido por Leonardo Luciano`
          }
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top transition-opacity duration-500 ease-out group-hover:opacity-0"
        />

        {/* Selo "No ar" — site em produção, usado por um cliente real. Sempre */}
        {/* visível, no canto superior esquerdo (não conflita com o "Visitar"). */}
        {live && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/90 px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-white shadow-[0_6px_18px_-6px_rgba(16,185,129,0.8)] backdrop-blur-sm">
            <Check className="h-3 w-3" strokeWidth={3} />
            No ar
          </div>
        )}

        {/* Selo "Visitar" — entra com fade + slide no hover */}
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-wider text-black opacity-0 transition-all duration-500 ease-out [transform:translateY(-6px)] group-hover:opacity-100 group-hover:[transform:translateY(0)]">
          Visitar
          <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
        </div>

        {/* Selo de template — indica que o projeto saiu de um molde multitema. */}
        {templateTag && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 font-mono text-[0.55rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            <Layers className="h-3 w-3" strokeWidth={2.5} />
            {templateTag}
          </div>
        )}
      </div>

      {/* Legenda do card — desliza levemente e ganha realce no hover */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="transition-transform duration-500 ease-out group-hover:translate-x-1">
          <h3 className="font-display text-base font-semibold leading-tight text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-white/55">{subtitle}</p>}
        </div>
        <ArrowUpRight
          className="mt-0.5 h-4 w-4 shrink-0 text-white/40 transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          strokeWidth={2}
        />
      </div>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/*  ThemeShowcaseCard                                                          */
/*  Destaque para templates "multitema": um mesmo site que troca de identidade */
/*  por completo (cores, tipografia, clima). Capa estática por padrão; no hover */
/*  (desktop) toca um vídeo curto mostrando a troca de temas ao vivo. No mobile */
/*  fica só a capa — mesma lógica anti-crash do ProjectCard (toque não tem      */
/*  hover e mídia pesada derruba o Safari).                                     */
/* -------------------------------------------------------------------------- */

interface ThemeShowcaseProps {
  title: string;
  /** Linha-fina acima do título (ex.: "Um template, cinco identidades"). */
  tagline: string;
  description: string;
  href: string;
  /** Capa estática (primeira tela do site). */
  image: string;
  /** Vídeo curto da troca de temas — tocado no hover (desktop). */
  video: string;
  /** Temas disponíveis dentro do template — viram chips abaixo do texto. */
  themes: string[];
  /** Cor de destaque do fallback, harmonizada com a seção. */
  accent: string;
  /** Card ainda não publicado: desfocado, desabilitado, com selo "Em breve". */
  comingSoon?: boolean;
}

function ThemeShowcaseCard({ title, tagline, description, href, image, video, themes, accent, comingSoon }: ThemeShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const playPreview = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };
  const stopPreview = () => {
    videoRef.current?.pause();
  };

  // Conteúdo interno compartilhado entre o card ativo (<a>) e o "Em breve" (<div>).
  const inner = (
    <>
      {/* Palco do preview — capa por padrão; vídeo da troca de temas no hover.   */}
      {/* max-h em vh garante que dois cards + cabeçalho caibam em ~100vh,         */}
      {/* mantendo a seção do mesmo tamanho das outras (troca de página no scroll). */}
      <div className="relative aspect-[16/10] max-h-[34vh] w-full overflow-hidden rounded-xl border border-white/12 bg-white/[0.03]">
        {/* Camada-base: gradiente de fallback */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 0% 0%, ${accent}55 0%, transparent 55%), linear-gradient(135deg, ${accent} 0%, #050505 90%)`,
          }}
          aria-hidden
        />

        {/* Vídeo da troca de temas — só em desktop com hover e card ativo */}
        {canHover && !comingSoon && (
          <video
            ref={videoRef}
            src={video}
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          />
        )}

        {/* Capa local — sempre visível; some no hover revelando o vídeo.        */}
        {/* No "Em breve" fica desfocada e escurecida (preview indisponível).     */}
        <Image
          src={image}
          alt={`Página inicial do template ${title} (temas: ${themes.join(', ')}), desenvolvido por Leonardo Luciano`}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className={
            comingSoon
              ? 'scale-105 object-cover object-top blur-[3px] brightness-[0.55] saturate-[0.7]'
              : 'object-cover object-top transition-opacity duration-500 ease-out group-hover:opacity-0'
          }
        />

        {comingSoon ? (
          /* Selo "Em breve" — espelha o "No ar", em âmbar */
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-500/90 px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-white shadow-[0_6px_18px_-6px_rgba(245,158,11,0.8)] backdrop-blur-sm">
            <Clock className="h-3 w-3" strokeWidth={3} />
            Em breve
          </div>
        ) : (
          <>
            {/* Selo multitema — quantos temas o template oferece */}
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {themes.length} temas
            </div>

            {/* Selo "Visitar" — entra com fade + slide no hover */}
            <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-wider text-black opacity-0 transition-all duration-500 ease-out [transform:translateY(-6px)] group-hover:opacity-100 group-hover:[transform:translateY(0)]">
              Visitar
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
            </div>
          </>
        )}
      </div>

      {/* Texto + chips de tema (esmaecidos no "Em breve") */}
      <div
        className={
          comingSoon
            ? 'mt-[clamp(0.85rem,1.4vw,1.15rem)] opacity-50'
            : 'mt-[clamp(0.85rem,1.4vw,1.15rem)] transition-transform duration-500 ease-out group-hover:translate-x-1'
        }
      >
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/50">{tagline}</p>
        <h3 className="mt-1.5 flex items-center gap-2 font-display text-lg font-semibold leading-tight text-white">
          {title}
          {!comingSoon && (
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-white/40 transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
              strokeWidth={2}
            />
          )}
        </h3>
        <p className="mt-2 line-clamp-2 max-w-[46ch] text-sm leading-relaxed text-white/60">{description}</p>
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {themes.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-white/70"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  // "Em breve": card desabilitado (não navega, sem hover/foco), apenas informativo.
  if (comingSoon) {
    return (
      <div
        aria-label={`${title} — em breve`}
        className="block cursor-default rounded-2xl border border-white/10 bg-white/[0.02] p-[clamp(1rem,1.8vw,1.5rem)] shadow-[0_16px_50px_-30px_rgba(0,0,0,0.9)]"
      >
        {inner}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={playPreview}
      onMouseLeave={stopPreview}
      className="group block rounded-2xl border border-white/12 bg-white/[0.03] p-[clamp(1rem,1.8vw,1.5rem)] shadow-[0_16px_50px_-30px_rgba(0,0,0,0.9)] transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_32px_80px_-40px_rgba(0,0,0,0.95)] focus:outline-none focus-visible:border-white/40"
      aria-label={`Abrir ${title} em uma nova aba`}
    >
      {inner}
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/*  Botão "próxima seção" — garante navegação mesmo se o scroll travar         */
/*  (útil principalmente no mobile). Avança ~1 viewport; no fim, volta ao topo.*/
/* -------------------------------------------------------------------------- */

function ScrollNav() {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const reachedEnd =
        window.scrollY + window.innerHeight >= document.body.scrollHeight - 80;
      setAtBottom(reachedEnd);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const vh = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - vh;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let target: number;
    if (isDesktop && !reduced) {
      // Desktop com pin: cada seção ocupa exatamente uma viewport. Saltamos para
      // o próximo múltiplo inteiro de innerHeight — a próxima seção fica 100% na
      // tela, não importa a posição em que o botão foi clicado.
      const currentPage = Math.floor(window.scrollY / vh + 0.0001);
      target = (currentPage + 1) * vh;
    } else {
      // Mobile / reduced-motion: sem pin, as seções ficam empilhadas em scroll
      // nativo e com alturas variáveis (barra de endereço, conteúdo maior que a
      // tela). Multiplicar por innerHeight cairia em pontos aleatórios, então
      // saltamos para o TOPO real da próxima seção.
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-flow-section]'),
      );
      const tops = sections.map((el) =>
        Math.round(el.getBoundingClientRect().top + window.scrollY),
      );
      const next = tops.find((t) => t > window.scrollY + 4);
      target = next ?? maxScroll;
    }

    window.scrollTo({ top: Math.min(target, maxScroll), behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={atBottom ? 'Voltar ao topo' : 'Ir para a próxima seção'}
      className="fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-300 ease-out hover:scale-110 hover:border-white/50 hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:bottom-7 sm:right-7"
    >
      <ChevronDown
        className={`h-5 w-5 transition-transform duration-500 ${atBottom ? 'rotate-180' : 'animate-bounce'}`}
        strokeWidth={2.2}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cabeçalho de seção reutilizável                                           */
/* -------------------------------------------------------------------------- */

interface SectionHeadProps {
  label: string;
  kicker: string;
  title: string;
  description?: string;
  divider?: string;
}

function SectionHead({ label, kicker, title, description, divider = 'border-white/15' }: SectionHeadProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/60 sm:text-[0.7rem] sm:tracking-[0.25em]">
        <span className="truncate">{label}</span>
        <span className="hidden shrink-0 sm:inline">{kicker}</span>
      </div>
      <hr className={`my-[1.6vw] border-t ${divider}`} />
      <h2 className="font-display text-[clamp(1.75rem,5.5vw,4rem)] font-bold leading-[0.95] tracking-tight text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-[44ch] text-[clamp(0.9rem,1.3vw,1.05rem)] leading-relaxed text-white/65">
          {description}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dados                                                                     */
/* -------------------------------------------------------------------------- */

// Templates "multitema": um mesmo molde que troca de identidade por completo.
// Cada item tem capa + vídeo da troca de temas (em /images/<pasta>/).
// Para adicionar outro no mesmo molde, basta incluir mais um objeto aqui.
const themeShowcases = [
  {
    title: 'Cinq Thèmes',
    tagline: 'Um template · cinco identidades',
    description:
      'Um portfólio criativo reimaginado em cinco identidades. Um seletor troca cores, tipografia e clima — a mesma estrutura assume outro universo, sem trocar de página.',
    href: 'https://cinqthemes.vercel.app/',
    image: '/images/cinqthemes/capa-5-temas.png',
    video: '/images/cinqthemes/switcher-demo.mp4',
    themes: ['Preto', 'Terra', 'Azul', 'Noir', 'Pulse'],
  },
  // Versão gastronômica do mesmo molde.
  {
    title: 'Cinco Temas',
    tagline: 'Um template · cinco identidades',
    description:
      'Um restaurante reimaginado em cinco casas — da pizzaria de forno a lenha ao sushi. Um seletor troca cores, tipografia e clima e o mesmo site vira outro negócio, sem trocar de página.',
    href: 'https://cincotemas.vercel.app/',
    image: '/images/cincotemas/capa-5-temas.png',
    video: '/images/cincotemas/switcher-demo.mp4',
    themes: ['Pizzaria Dello', 'Toma', 'Verde', 'Crazy Cow', 'Sakana'],
  },
  // Terceiro lugar: desativado por hora — card desfocado com selo "Em breve".
  {
    title: 'Five Themes',
    tagline: 'Um template · cinco identidades',
    description:
      'A base de um estúdio criativo reimaginada em cinco universos. Um seletor troca cores, tipografia e clima — e o mesmo site vira outro negócio, sem trocar de página.',
    href: 'https://fivethemes.vercel.app/',
    image: '/images/fivethemes/capa-5-temas.png',
    video: '/images/fivethemes/switcher-demo.mp4',
    themes: ['Fotografia', 'Chef', 'Arquitetura', 'DJ', 'Ateliê'],
    comingSoon: true,
  },
];

const commercialProjects = [
  { title: 'Recanto da Paz', subtitle: 'Hotelaria · Chácara', href: 'https://recanto-da-paz.vercel.app/', image: '/images/chacararecantodapaz.png', live: true },
  { title: 'Terapia Ocupacional', subtitle: 'Saúde · Bem-estar', href: 'https://adapteseterapiaocupacional.com.br/', image: '/images/terapiaocupacional.png', live: true },
  { title: 'Azul Marina', subtitle: 'Imobiliário · Beira-mar', href: 'https://azulmarina.vercel.app/', image: '/images/azulmarina.png', templateTag: 'Template Cinq Thèmes' },
  // Oculto temporariamente a pedido — reativar quando quiser exibir de novo.
  // { title: 'MARÉ Ateliê', subtitle: 'Moda · Slow fashion', href: 'https://mare-atelie.vercel.app/', image: '/images/mare.png' },
];

const gastronomyProjects = [
  { title: 'Pizzaria Dello', subtitle: 'Pizzaria · Forno a lenha', href: 'https://pizzariadello.vercel.app/', image: '/images/pizzariadello.png', templateTag: 'Template Cinco Temas' },
  { title: 'Altura', subtitle: 'Cafeteria · Torrefação', href: 'https://alturacafes.vercel.app/', image: '/images/altura.png' },
  // Oculto temporariamente a pedido — reativar quando quiser exibir de novo.
  // { title: 'Crazy Cow', subtitle: 'Lanchonete · Burgers', href: 'https://crazycow.vercel.app/', image: '/images/crazycow.png' },
];

const studioProjects = [
  // Nome genérico + tag de template oculta temporariamente — reativar o templateTag quando liberar.
  { title: 'Tatuagem & Fotografia Autoral', subtitle: 'Tatuagem · Fotografia', href: 'https://projetolk.vercel.app/', image: '/images/larissawand.png' },
  { title: 'Estúdio Tezzo', subtitle: 'Fotografia', href: 'https://estudiotezzo.vercel.app/', image: '/images/tezzo.png' },
  { title: 'Estúdio Vasconcelos', subtitle: 'Fotografia', href: 'https://estudiovasconcelos.vercel.app/', image: '/images/vasconcelos.png' },
  { title: 'Estúdio Marquetti', subtitle: 'Fotografia', href: 'https://estudiomarquetti.vercel.app/', image: '/images/marchetti.png' },
  // Oculto temporariamente a pedido — reativar quando o cliente liberar.
  // { title: 'Mara Valente', subtitle: 'Fotografia · Casamentos', href: 'https://maravalente.vercel.app/', image: '/images/maravalente.png' },
];

// Seção Games oculta temporariamente a pedido — reativar quando quiser exibir de novo.
// const gamingProjects = [
//   { title: 'Teemo LoL', subtitle: 'League of Legends', href: 'https://teemo-lol.vercel.app/', image: '/images/teemo.png' },
//   { title: 'Valorant Agents', subtitle: 'Valorant · Roster', href: 'https://valorant-agents-list.vercel.app/', image: '/images/valorant.png' },
// ];

const contacts = [
  {
    name: 'WhatsApp',
    description: '+55 12 98250-5894',
    href: 'https://wa.me/5512982505894',
    Icon: WhatsAppIcon,
    gradient: 'from-green-500 to-emerald-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    name: 'E-mail',
    description: 'leolucianox@outlook.com',
    href: 'mailto:leolucianox@outlook.com',
    Icon: Mail,
    gradient: 'from-rose-500 to-orange-400',
    shadowColor: 'rgba(244, 63, 94, 0.5)',
  },
  {
    name: 'GitHub',
    description: 'github.com/leolucianox',
    href: 'https://github.com/leolucianox/',
    Icon: GitHubIcon,
    gradient: 'from-gray-600 to-gray-400',
    shadowColor: 'rgba(107, 114, 128, 0.5)',
  },
  {
    name: 'LinkedIn',
    description: 'in/leolvciano',
    href: 'https://www.linkedin.com/in/leolvciano/',
    Icon: LinkedInIcon,
    gradient: 'from-blue-600 to-blue-400',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
  },
];

/* -------------------------------------------------------------------------- */
/*  Página                                                                    */
/* -------------------------------------------------------------------------- */

export default function Home() {
  return (
    <>
      <ScrollNav />
      <FlowArt aria-label="Portfólio de Leonardo Luciano">

        {/* Seção 01 — Hero (Preto) */}
        <FlowSection aria-label="Apresentação" style={{ backgroundColor: '#000000', color: '#fff' }}>
          <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/60">
            <span>Leonardo Luciano</span>
            <span className="hidden sm:inline">Portfólio Digital</span>
          </div>
          <hr className="my-[1.6vw] border-t border-white/15" />

          <div className="grid flex-1 items-center gap-[clamp(2rem,4vw,3rem)] lg:grid-cols-2">
            {/* Retrato — quadrado, centralizado na metade esquerda */}
            <div className="order-2 flex flex-col items-center gap-6 lg:order-1">
              <div className="relative aspect-square w-[clamp(13rem,28vw,22rem)] overflow-hidden rounded-[1.5rem] border border-white/15 shadow-[0_30px_90px_-50px_rgba(255,255,255,0.25)]">
                <Image
                  src="/images/leoprofile.jpg"
                  alt="Retrato de Leonardo Luciano"
                  fill
                  priority
                  sizes="(max-width: 1024px) 60vw, 28vw"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>
              {/* Mobile: dica de scroll abaixo da foto */}
              <div className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/40 lg:hidden">
                <span className="h-px w-10 bg-white/30" />
                Role para explorar
              </div>
            </div>

            {/* Identidade + intro */}
            <div className="order-1 flex flex-col justify-center lg:order-2">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                Portfólio
              </p>
              <h1 className="font-display text-[clamp(2.25rem,6vw,5.5rem)] font-extrabold leading-[0.9] tracking-tight text-white">
                Leonardo
                <br />
                Luciano
              </h1>
              <p className="mt-6 max-w-[52ch] text-[clamp(0.95rem,1.5vw,1.15rem)] leading-relaxed text-white/70">
                Sou um profissional de Cloud Operations com forte base em infraestrutura e um olhar
                atento para o desenvolvimento front-end. Transformo lógica complexa em experiências
                web fluidas e performáticas. Abaixo, você confere alguns dos projetos em que estive
                trabalhando.
              </p>
              {/* Desktop: dica de scroll abaixo do texto */}
              <div className="mt-7 hidden items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/40 lg:flex">
                <span className="h-px w-10 bg-white/30" />
                Role para explorar
              </div>
            </div>
          </div>
        </FlowSection>

        {/* Seção 02 — Templates Multitema (Azul — camisa) */}
        <FlowSection aria-label="Templates Multitema" style={{ backgroundColor: '#1C3A5E', color: '#fff' }}>
          <SectionHead
            label="Um molde · Várias identidades"
            kicker="Camaleão"
            title="Templates Multitema"
            description="Um único template que veste vários negócios: um seletor troca cores, tipografia e clima e o mesmo site vira outro. Passe o mouse e veja a troca de temas acontecer ao vivo."
          />
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-1 gap-[clamp(1.5rem,2.5vw,2rem)] lg:grid-cols-3">
            {themeShowcases.map((p, i) => (
              <ThemeShowcaseCard key={i} {...p} accent="#2E5C92" />
            ))}
          </div>
        </FlowSection>

        {/* Seção 03 — Soluções Comerciais (Verde — encostas) */}
        <FlowSection aria-label="Soluções Comerciais" style={{ backgroundColor: '#273A22', color: '#fff' }}>
          <SectionHead
            label="Negócios & Landing Pages"
            kicker="Comercial"
            title="Soluções Comerciais"
            description="Sites de conversão para negócios reais — de reservas a vendas, pensados para velocidade, clareza e confiança."
          />
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {commercialProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#2F6B49" />
            ))}
          </div>
        </FlowSection>

        {/* Seção 04 — Gastronomia (Marrom — ruínas/terra) */}
        <FlowSection aria-label="Gastronomia" style={{ backgroundColor: '#3A271B', color: '#fff' }}>
          <SectionHead
            label="Gastronomia & Cafés"
            kicker="Sabor"
            title="Gastronomia"
            description="Cardápios que dão água na boca — hambúrgueres, pizza de forno a lenha e café especial. Sites que despertam o apetite e levam o cliente até a mesa."
          />
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {gastronomyProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#8A4B2A" />
            ))}
          </div>
        </FlowSection>

        {/* Seção 05 — Portfólios e Estúdios (Azul — camisa) */}
        <FlowSection aria-label="Portfólios e Estúdios" style={{ backgroundColor: '#1C3A5E', color: '#fff' }}>
          <SectionHead
            label="Estúdios Criativos"
            kicker="Visual"
            title="Portfólios e Estúdios"
            description="Vitrines digitais para fotógrafos e estúdios criativos, onde a imagem é a protagonista e a navegação some para dar espaço à obra."
          />
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {studioProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#2C4A85" />
            ))}
          </div>
        </FlowSection>

        {/* Seção 06 — Gaming Projects — oculta temporariamente a pedido (reativar quando quiser exibir de novo)
        <FlowSection aria-label="Gaming Projects" style={{ backgroundColor: '#273A22', color: '#fff' }}>
          <SectionHead
            label="Gaming & Comunidade"
            kicker="Paixões"
            title="Gaming Projects"
            description="Unindo desenvolvimento web com meus jogos favoritos."
            divider="border-white/20"
          />
          Mesmo grid das outras seções (4 col no desktop) p/ manter o tamanho de card
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {gamingProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#3E5A33" />
            ))}
          </div>
        </FlowSection>
        */}

        {/* Seção 07 — Contato (Preto) */}
        <FlowSection aria-label="Contato" style={{ backgroundColor: '#000000', color: '#fff' }}>
          <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/60">
            <span>Contato</span>
            <span className="hidden sm:inline">Vamos conversar</span>
          </div>
          <hr className="my-[1.6vw] border-t border-white/15" />

          <div className="grid flex-1 content-center gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-2 lg:items-center">
            {/* Chamada */}
            <div>
              <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-white">
                Vamos criar
                <br />
                algo juntos.
              </h2>
              <p className="mt-5 max-w-[42ch] text-[clamp(0.9rem,1.4vw,1.1rem)] leading-relaxed text-white/65">
                Aberto a projetos, colaborações e oportunidades. Escolha o canal que preferir — a
                resposta costuma ser rápida.
              </p>
            </div>

            {/* Cards de contato (estilo Get In Touch) */}
            <div className="grid grid-cols-1 gap-[clamp(0.85rem,1.6vw,1.25rem)] sm:grid-cols-2">
              {contacts.map(({ name, description, href, Icon, gradient, shadowColor }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block"
                  aria-label={`${name}: ${description}`}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.03] hover:border-slate-600/60">
                    {/* Brilho radial no hover */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: `radial-gradient(circle at 50% 50%, ${shadowColor}, transparent 70%)`, filter: 'blur(40px)' }}
                      aria-hidden
                    />
                    <div className="relative z-10">
                      {/* Ícone com gradiente — gira/escala no hover */}
                      <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base font-semibold text-white">{name}</h3>
                      <p className="mt-0.5 truncate text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                        {description}
                      </p>
                      <div className="mt-3 flex items-center text-gray-500 transition-colors duration-300 group-hover:text-white">
                        <span className="font-mono text-[0.65rem] uppercase tracking-wider">Conectar</span>
                        <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
                      </div>
                    </div>
                    {/* Shimmer */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" aria-hidden />
                  </div>
                </a>
              ))}
            </div>
          </div>

          <hr className="my-[2vw] border-t border-white/15" />
          <footer className="flex flex-col gap-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Leonardo Luciano</span>
            <span>Portfólio Digital</span>
          </footer>
        </FlowSection>

      </FlowArt>
    </>
  );
}
