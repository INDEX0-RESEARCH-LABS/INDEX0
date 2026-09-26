FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    SANDBOX_MANAGER_PORT=4001

RUN apk add --no-cache curl

# Copy built artifacts (assumes `pnpm build` was run before `docker compose up`)
COPY package.json ./
COPY dist/ ./dist/

# Install only production deps from package.json
RUN npm install --omit=dev --ignore-scripts 2>/dev/null || true

EXPOSE 4001

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

CMD ["node", "dist/index.js"]
