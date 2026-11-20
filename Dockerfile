# Stage 1: Build React Frontend (Vite)
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build NestJS Backend
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build && npm prune --omit=dev

# Stage 3: Unified Low-Cost Production Runtime (Frontend + API in 1 Container)
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy compiled frontend static assets
COPY --from=client-builder /app/client/dist ./client/dist

# Copy compiled backend and production node_modules
WORKDIR /app/server
COPY --from=server-builder /app/server/package*.json ./
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/dist ./dist

EXPOSE 8080
CMD ["node", "dist/main.js"]
