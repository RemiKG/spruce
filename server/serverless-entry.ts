/* Spruce — serverless function source (Vercel). Bundled at build time by esbuild
   into api/index.js (a single self-contained ESM file; node_modules stay
   external and resolve at runtime), so there are no extensionless-ESM resolution
   problems. It wraps the same Fastify app used on a Node host and feeds each
   /api/* request to it. The SPA is served as static output by the platform
   (see vercel.json); this function is serveStatic:false and API-only. */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from './app';

let appReady: Promise<Awaited<ReturnType<typeof buildApp>>> | null = null;

function getApp() {
  if (!appReady) {
    appReady = buildApp({ serveStatic: false }).then(async (app) => {
      await app.ready();
      return app;
    });
  }
  return appReady;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  // Feed the raw request into Fastify and keep the function alive until the
  // response has fully flushed (otherwise the platform may tear the invocation
  // down before Fastify writes the body).
  await new Promise<void>((resolve) => {
    res.once('close', () => resolve());
    res.once('finish', () => resolve());
    app.server.emit('request', req, res);
  });
}
