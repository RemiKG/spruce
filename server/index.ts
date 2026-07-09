/* Spruce — the Node-host entry. Builds the API app (which also serves the built
   SPA) and listens. Deployable on any Node host (the design targets Alibaba Cloud
   ECS/SAS, Singapore). Serverless deploys use api/[...path].ts instead. */
import { buildApp } from './app';
import { ENV, activeProvider } from './env';
import { catalogSize } from './catalog';

const app = await buildApp({ serveStatic: true });
await app.listen({ port: ENV.PORT, host: '0.0.0.0' });
console.log(`[spruce] API on http://localhost:${ENV.PORT}  ·  engine: ${activeProvider()}  ·  catalog: ${catalogSize()} products`);
