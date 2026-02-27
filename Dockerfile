FROM node:22-slim AS base
WORKDIR /app
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS test-unit
COPY . .
USER appuser
CMD ["npx", "vitest", "run"]

FROM deps AS test-e2e
RUN npx playwright install --with-deps chromium
COPY . .
RUN npm run build
USER appuser
CMD ["npx", "playwright", "test", "--project=chromium"]

FROM deps AS build
COPY . .
RUN npm run build
USER appuser
