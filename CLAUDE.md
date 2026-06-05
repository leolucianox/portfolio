# CLAUDE.md

Guia para trabalhar neste repositório. Leia antes de editar.

## O que é

Portfólio pessoal de **Leonardo Luciano** (Cloud Operations + Front-end). Single-page
com scroll animado: painéis em tela cheia que giram/encaixam conforme a rolagem.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** (config via `@theme` no CSS, sem `tailwind.config.js`)
- **GSAP** + **ScrollTrigger** (`@gsap/react`) para o scroll animado
- **lucide-react** para ícones

## Comandos

```bash
npm run dev     # desenvolvimento (http://localhost:3000)
npm run build   # build de produção (o que a Vercel roda)
npm start       # serve o build de produção
npm run lint    # ESLint (next lint)
```

> No Windows, encerre o `next dev` antes de rodar `next build` — os dois disputam a
> pasta `.next/` e o build falha com `EPERM ... .next\trace`. Se acontecer, pare o dev,
> apague `.next/` e rode o build de novo.

## Estrutura

```
app/
  layout.tsx     # fontes (next/font) + <html>/<body> + metadata (título da aba)
  page.tsx       # PÁGINA INTEIRA do portfólio (ver abaixo)
  globals.css    # @import tailwind, variáveis de fonte, utilitário .grain
components/ui/
  story-scroll.tsx  # FlowArt + FlowSection — motor de scroll GSAP
  utils.ts          # cn() (clsx + tailwind-merge)
public/images/      # leoprofile.jpg + capas dos sites (.png)
```

### `app/page.tsx` (onde fica quase tudo)

Componente client (`'use client'`). Contém, no mesmo arquivo:

- **`Home`** — monta as 5 `FlowSection`: Hero, Soluções Comerciais (verde), Portfólios e
  Estúdios (azul), Gaming (cinza), Contato (preto).
- **`ProjectCard`** — card de projeto. Capa estática (`public/images/...`) por padrão; no
  hover revela um `<iframe>` ao vivo escalado que faz um "scroll" lento da página. A escala
  do iframe é medida com `ResizeObserver` (constante `BASE_WIDTH = 1280`).
- **`SectionHead`** — cabeçalho padrão das seções (label + kicker + título + descrição).
- **`ScrollNav`** — botão flutuante que avança ~1 viewport (garante navegação no mobile).
- **`contacts`** — WhatsApp, E-mail, GitHub, LinkedIn (cards estilo "Get In Touch").

Dados dos projetos ficam em arrays no topo do arquivo (`commercialProjects`,
`studioProjects`, `gamingProjects`). Para adicionar/editar um projeto, mexa nesses arrays —
cada item tem `title`, `subtitle`, `href` e `image` (caminho em `/images/...`).

### `components/ui/story-scroll.tsx` — NÃO altere a lógica de animação

`FlowArt` registra o ScrollTrigger e, para cada `FlowSection`, faz pin + rotação
(`rotation: 30 -> 0`, `transformOrigin: bottom left`). Respeita `prefers-reduced-motion`.
Edite **conteúdo** dentro das `FlowSection` em `page.tsx`, não o motor de scroll aqui.

## Convenções de design

- Tema escuro. Texto branco (`text-white`) com opacidades para hierarquia.
- Fontes: **Bricolage Grotesque** (display, `font-display`), **Plus Jakarta Sans** (corpo),
  **JetBrains Mono** (labels técnicos, `font-mono`).
- Tipografia fluida com `clamp(...)`. Hairlines `border-white/15`.
- Cores de fundo das seções vão inline via `style={{ backgroundColor: '#...' }}` na
  `FlowSection` (placeholders ajustáveis: verde `#1F3D2D`, azul `#1A2B4C`).
- Responsivo mobile-first: 1 coluna no mobile, `sm:grid-cols-2`, `lg:grid-cols-3`.

## Deploy (Vercel)

- Build de produção precisa passar **sem erros de ESLint/TypeScript** (a Vercel falha o
  deploy se `next build` falhar). Rode `npm run build` localmente antes de subir.
- A versão do Next em `package.json` está **fixada** (sem `^`) para a Vercel instalar
  exatamente a versão testada e evitar erro de versão. `package-lock.json` é commitado e
  deve ser mantido em sincronia.
- As capas dos sites são imagens locais em `public/images/` (sem dependência externa).
