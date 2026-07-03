# whittle.tools

> Sharp little tools for developers.

A one-stop collection of fast, privacy-friendly developer utilities. Every tool
runs entirely in your browser — nothing you type is ever uploaded. Server-side
rendered for SEO, installable as a PWA, and deployed to Cloudflare Workers.

**Live:** https://whittle.tools

## Tools

| Tool                        | What it does                                                    |
| --------------------------- | -------------------------------------------------------------- |
| [Splitter](/tools/splitter) | Turn a list of text into a formatted array or delimited string |

More on the way — the architecture makes adding one a small, self-contained job
(see [Adding a tool](#adding-a-tool)).

## Tech stack

- **[React Router 7](https://reactrouter.com/)** (framework mode) with SSR
- **[React 19](https://react.dev/)** + **TypeScript**
- **[Vite 7](https://vite.dev/)** with the **[Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)** (Radix primitives)
- **[Cloudflare Workers](https://developers.cloudflare.com/workers/)** for hosting
- **[Vitest](https://vitest.dev/)** for unit tests

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io/).

```bash
pnpm install      # first run approves native builds (esbuild, sharp, workerd)
pnpm dev          # http://localhost:5173
```

## Scripts

| Script           | Description                                              |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Start the dev server with HMR                           |
| `pnpm build`     | Production build (client + SSR worker)                  |
| `pnpm preview`   | Build and preview locally                               |
| `pnpm test`      | Run the unit test suite                                 |
| `pnpm typecheck` | Generate types and run `tsc`                            |
| `pnpm icons`     | Regenerate the icon/OG image set from the vector source |
| `pnpm deploy`    | Build and deploy to Cloudflare Workers                  |

## Project structure

```
app/
  components/        Shared UI — site chrome, theme, shadcn primitives (ui/)
  lib/               site config, SEO helpers, theme, cn()
  routes/            home, tools directory, tools/:slug, sitemap, robots
  tools/             One folder per tool + the registry
    registry.ts      Register a tool here to make it routable + listed
    splitter/        meta, pure transform, component, tests
workers/app.ts       Cloudflare Workers request handler
public/              Static assets: manifest, service worker, icons
scripts/             Icon/OG image generation
```

## Adding a tool

1. Create `app/tools/<slug>/` with:
   - `meta.ts` — a `ToolMeta` (slug, name, tagline, description, keywords, icon).
   - `<slug>.tsx` — the React component. Keep transformations in a pure,
     testable module (see `splitter/transform.ts`).
   - `index.ts` — combine meta + component into a `Tool`.
2. Add the tool to the array in `app/tools/registry.ts`.

That's it. The tool automatically gets a `/tools/<slug>` page with SEO meta, a
listing on the home page and directory, and a sitemap entry.

## Deployment

Deployed to **Cloudflare Workers** (not Pages) via the Cloudflare Vite plugin.

```bash
pnpm deploy                          # deploy to production
pnpm dlx wrangler versions upload    # deploy a preview URL
```

## Privacy

Tools process your input locally in the browser. There is no backend that
receives your data.
