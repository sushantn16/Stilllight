// Runs after `astro build`. For the Cloudflare build, writes the files that must sit at the root of
// the Worker's assets directory (site/), outside the /photos/ folder Astro builds into.
import { writeFile } from 'node:fs/promises';

if (process.env.GITHUB_ACTIONS === 'true') process.exit(0);

// photos.iamsushant.dev/ was the gallery's address for a day. Only the subdomain can request "/" from
// this Worker (the main domain sends just /photos* here), so this can't loop.
await writeFile('site/_redirects', '/  https://iamsushant.dev/photos/  301\n');

await writeFile(
  'site/_headers',
  `# Astro fingerprints these files, so a changed file gets a new name.
/photos/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`,
);
