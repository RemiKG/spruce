/* Bundle the Vercel serverless entry into api/index.js via esbuild's JS API.
   Using the API (not `node ./node_modules/esbuild/bin/esbuild`) keeps this
   cross-platform: on Linux that bin path is the native ELF binary, so running it
   through `node` throws "Invalid or unexpected token". A single function serves
   every /api/* path via the vercel.json rewrite (a bracketed [...path].js file
   only matches ONE extra segment on the platform, which 404'd nested routes
   like /api/share/:token). */
import { build } from 'esbuild';

await build({
  entryPoints: ['server/serverless-entry.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  target: 'node20',
  outfile: 'api/index.js',
  logLevel: 'info',
});
