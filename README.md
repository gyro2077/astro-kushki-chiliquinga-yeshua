# Aether-Fi Docs (Kushki x Rick & Morty)

Portal de documentacion interactiva que consume la API de Rick and Morty e integra Gemini para generar un resumen creativo por personaje. El objetivo es combinar rendimiento (SSG/SSR) con una experiencia DX premium.

## Stack y decisiones tecnicas

- **Astro 4 + React (islas)**: Astro permite SSG para el catalogo (rapido, SEO) y React solo para componentes con estado (buscador, IA, terminal). Esto reduce JS en el cliente.
- **SSR con adapter Node**: necesario para exponer un endpoint `/api/gemini` y proteger la API key de Gemini.
- **TailwindCSS**: permite aplicar el sistema de tokens del diseño de Stich de forma consistente.
- **Gemini + API Route**: el resumen de IA se genera en backend para evitar exponer llaves.

## Estrategia de rendimiento y escalabilidad

Para escalar a trafico masivo:

- **SSG del catalogo**: el grid principal se genera en build, evitando carga en cada request.
- **Islas parciales**: solo se hidratan los componentes interactivos, reduciendo bundle y FCP.
- **Cache y CDN**: servir HTML estatico y assets desde CDN; cachear la respuesta de Rick and Morty por TTL.
- **SSR selectivo**: endpoints de IA y datos dinamicos quedan en server; el resto es estatico.

## Requisitos

- Node.js 18+
- pnpm
- Una clave de Gemini API

## Configuracion local

1) Instala dependencias

```bash
pnpm install
```

2) Configura variables de entorno

```bash
cp .env.example .env
```

Agrega `GEMINI_API_KEY` en `.env`.

3) Inicia el entorno local

```bash
pnpm dev
```

## Endpoints

- `GET /` catalogo (SSG)
- `GET /character/[id]` detalle de personaje
- `POST /api/gemini` genera resumen con IA
- `GET /api/gemini-proxy?id=1` proxy con Gemini y JSON (Try it out)

## Entrega

Se puede desplegar en Netlify o Vercel y adjuntar el link junto al repositorio.
