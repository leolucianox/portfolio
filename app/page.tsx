'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Check, ChevronDown, Mail } from 'lucide-react';
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
  /** Favorito do desenvolvedor — exibe o selo "Dev's Pick" com estrela. */
  pick?: boolean;
}

function ProjectCard({ title, subtitle, href, image, accent, live, pick }: ProjectCardProps) {
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

        {/* Selo "Favorito" — favorito do desenvolvedor, com estrela (canto inferior esquerdo). */}
        {pick && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-300/45 bg-black/55 px-2.5 py-1 font-mono text-[0.55rem] font-semibold uppercase tracking-wider text-amber-100 backdrop-blur-sm">
            <span aria-hidden className="text-[0.72rem] leading-none">⭐</span>
            Favorito
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
/*  Para adicionar/editar um projeto, mexa nos arrays abaixo — cada item tem  */
/*  title, subtitle, href e image (caminho em /images/...).                   */
/* -------------------------------------------------------------------------- */

const commercialProjects = [
  { title: 'Recanto da Paz', subtitle: 'Hotelaria · Chácara', href: 'https://recanto-da-paz.vercel.app/', image: '/images/chacararecantodapaz.png', live: true },
  { title: 'Terapia Ocupacional', subtitle: 'Saúde · Bem-estar', href: 'https://adapteseterapiaocupacional.com.br/', image: '/images/terapiaocupacional.png', live: true },
  { title: 'Azul Marina', subtitle: 'Imobiliário · Beira-mar', href: 'https://azulmarina.vercel.app/', image: '/images/azulmarina.png', pick: true },
  // Oculto temporariamente a pedido — reativar quando quiser exibir de novo.
  // { title: 'MARÉ Ateliê', subtitle: 'Moda · Slow fashion', href: 'https://mare-atelie.vercel.app/', image: '/images/mare.png' },
];

// Tatuagem & arte autoral — estúdios com portfólio + agendamento, o traço em primeiro plano.
const tattooProjects = [
  { title: 'Kane Voss', subtitle: 'Tatuagem · Estúdio', href: 'https://kanevoss.vercel.app/', image: '/images/kanevoss.png' },
  { title: 'Larissa Wand', subtitle: 'Tatuagem · Fotografia', href: 'https://projetolk.vercel.app/', image: '/images/larissawand.png', pick: true },
];

const gastronomyProjects = [
  { title: 'Pizzaria Dello', subtitle: 'Pizzaria · Forno a lenha', href: 'https://pizzariadello.vercel.app/', image: '/images/pizzariadello.png' },
  { title: 'Altura Torrefação', subtitle: 'Cafeteria · Torrefação', href: 'https://alturacafes.vercel.app/', image: '/images/altura.png' },
  { title: 'Fogo Brando', subtitle: 'Receitas · Passo a passo', href: 'https://fogobrando.vercel.app/', image: '/images/fogobrando.png', pick: true },
  // Oculto temporariamente a pedido — reativar quando quiser exibir de novo.
  // { title: 'Crazy Cow', subtitle: 'Lanchonete · Burgers', href: 'https://crazycow.vercel.app/', image: '/images/crazycow.png' },
];

const studioProjects = [
  { title: 'Nora Selva', subtitle: 'Fotografia · Editorial', href: 'https://noraselva.vercel.app/', image: '/images/noraselva.png', pick: true },
  { title: 'Pedro Tezzo', subtitle: 'Fotografia', href: 'https://estudiotezzo.vercel.app/', image: '/images/tezzo.png' },
  { title: 'Théo Vasconcelos', subtitle: 'Fotografia', href: 'https://estudiovasconcelos.vercel.app/', image: '/images/vasconcelos.png', pick: true },
  { title: 'Théo Marchetti', subtitle: 'Fotografia', href: 'https://estudiomarquetti.vercel.app/', image: '/images/marchetti.png' },
  // Oculto temporariamente a pedido — reativar quando o cliente liberar.
  // { title: 'Mara Valente', subtitle: 'Fotografia · Casamentos', href: 'https://maravalente.vercel.app/', image: '/images/maravalente.png' },
];

// Gaming & streamers — hubs que reúnem todo o conteúdo de um criador num só lugar.
const gamingProjects = [
  { title: 'TcK10', subtitle: 'Streamer · Valorant', href: 'https://tck10-demo.vercel.app/', image: '/images/tck10.png' },
];

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

        {/* Seção 02 — Soluções Comerciais (Verde — grama das encostas) */}
        <FlowSection aria-label="Soluções Comerciais" style={{ backgroundColor: '#2D3318', color: '#fff' }}>
          <SectionHead
            label="Negócios & Landing Pages"
            kicker="Comercial"
            title="Soluções Comerciais"
            description="Sites de conversão para negócios reais — de reservas a vendas, pensados para velocidade, clareza e confiança."
          />
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {commercialProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#4E5E27" />
            ))}
          </div>
        </FlowSection>

        {/* Seção 03 — Fotografia & Estúdios (Azul — camisa) */}
        <FlowSection aria-label="Fotografia e Estúdios" style={{ backgroundColor: '#16335E', color: '#fff' }}>
          <SectionHead
            label="Estúdios Criativos"
            kicker="Visual"
            title="Fotografia & Estúdios"
            description="Vitrines digitais para fotógrafos e estúdios criativos, onde a imagem é a protagonista e a navegação some para dar espaço à obra."
          />
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {studioProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#2E5C92" />
            ))}
          </div>
        </FlowSection>

        {/* Seção 04 — Tatuagem & Arte (Marrom — ruínas/terra) */}
        <FlowSection aria-label="Tatuagem & Arte" style={{ backgroundColor: '#382B1A', color: '#fff' }}>
          <SectionHead
            label="Tatuagem & Arte Autoral"
            kicker="Pele"
            title="Tatuagem & Arte"
            description="Estúdios de tatuagem e arte autoral: o portfólio do artista e o agendamento no mesmo lugar, com o traço sempre em primeiro plano."
          />
          {/* Mesmo grid das outras seções (4 col no desktop) p/ manter o tamanho de card. */}
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {tattooProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#7A5B33" />
            ))}
          </div>
        </FlowSection>

        {/* Seção 05 — Gastronomia (Verde — grama das encostas) */}
        <FlowSection aria-label="Gastronomia" style={{ backgroundColor: '#2D3318', color: '#fff' }}>
          <SectionHead
            label="Gastronomia & Cafés"
            kicker="Sabor"
            title="Gastronomia"
            description="Cardápios que dão água na boca e receitas interativas para cozinhar passo a passo — pizza de forno a lenha, café especial e muito mais, do apetite à mesa."
          />
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {gastronomyProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#4E5E27" />
            ))}
          </div>
        </FlowSection>

        {/* Seção 06 — Gaming & Streamers (Azul — camisa) */}
        <FlowSection aria-label="Gaming e Streamers" style={{ backgroundColor: '#16335E', color: '#fff' }}>
          <SectionHead
            label="Gaming & Comunidade"
            kicker="Streamers"
            title="Gaming & Streamers"
            description="Hubs que reúnem todo o conteúdo de um criador — Twitch, YouTube e mais — num só lugar, prontos para assistir sem sair da página."
            divider="border-white/20"
          />
          {/* Mesmo grid das outras seções (4 col no desktop) p/ manter o tamanho de card. */}
          <div className="mt-[clamp(2rem,4vw,3rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.2vw,2rem)] lg:grid-cols-4">
            {gamingProjects.map((p) => (
              <ProjectCard key={p.href} {...p} accent="#2E5C92" />
            ))}
          </div>
        </FlowSection>

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
