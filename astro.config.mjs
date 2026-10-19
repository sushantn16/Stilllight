// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// One codebase, two builds:
// - Cloudflare (default): served at iamsushant.dev/photos/. The base is /photos/, and the output goes to
//   site/photos/ so the files sit at the same path inside the Worker's assets directory (site/).
// - GitHub Pages (GITHUB_ACTIONS=true): the old sushantn16.github.io/Stilllight/ address, which now only
//   redirects to the new one.
const onGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'Stilllight';

export default defineConfig({
  output: 'static',
  site: 'https://iamsushant.dev',
  base: onGitHubPages ? `/${repo}/` : '/photos/',
  outDir: onGitHubPages ? './dist' : './site/photos',
  // The same faces as iamsushant.dev, self-hosted with metric-matched fallbacks.
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Instrument Serif',
        cssVariable: '--font-instrument',
        weights: [400],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['Georgia', 'serif'],
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Geist',
        cssVariable: '--font-geist',
        weights: ['100 900'],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['system-ui', 'sans-serif'],
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Geist Mono',
        cssVariable: '--font-geist-mono',
        weights: ['100 900'],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['ui-monospace', 'monospace'],
      },
    ],
  },
});
