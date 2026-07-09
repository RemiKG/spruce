/* Bundle the Vercel serverless entry into api/[...path].js via esbuild's JS API.
   Using the API (not `node ./node_modules/esbuild/bin/esbuild`) keeps this
   cross-platform: on Linux that bin path is the native ELF binary, so running it
   through `node` throws "Invalid or unexpected token". The API has no shell
   quoting or binary-vs-shim pitfalls, and handles the bracketed outfile name. */
import { build } from 'esbuild';

await build({
  entryPoints: ['server/serverless-entry.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  target: 'node20',
  outfile: 'api/[...path].js',
  logLevel: 'info',
});
