# Spruce — Vite React SPA + Fastify API in one container.
# Build: docker build -t spruce .
# Run:   docker run -p 3003:3003 -e PORT=3003 -e DASHSCOPE_API_KEY=... spruce
# The server reads PORT from the environment (default 3003 here) and listens on 0.0.0.0.

# ── Stage 1: build the client bundle ────────────────────────────────────────
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# vite build → dist/client (served by the Fastify server itself)
RUN npm run build

# ── Stage 2: lean runtime (prod deps + tsx, the TS runtime `npm start` uses) ─
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
 && npm install --no-save --omit=dev tsx@^4.19.2 \
 && npm cache clean --force
COPY server ./server
COPY shared ./shared
COPY catalog ./catalog
COPY tsconfig.json tsconfig.server.json ./
COPY --from=build /app/dist ./dist
# runtime sourcing logs land here (created on demand, but keep the dir present)
RUN mkdir -p data/logs

ENV PORT=3003
EXPOSE 3003
CMD ["npx", "tsx", "server/index.ts"]
