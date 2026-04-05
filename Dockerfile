# ---------- Stage 1: Build the React client ----------
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---------- Stage 2: Production server ----------
FROM node:20-alpine
WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./

# Serve the built client as static files
COPY --from=client-build /app/client/build ./public

ENV NODE_ENV=production
EXPOSE 5000

USER node
CMD ["node", "server.js"]
