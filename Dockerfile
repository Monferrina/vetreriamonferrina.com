FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS test-unit
COPY . .
CMD ["npx", "vitest", "run"]

FROM deps AS test-e2e
RUN npx playwright install --with-deps chromium
COPY . .
RUN npm run build
CMD ["sh", "-c", "npm run preview & npx playwright test --project=chromium"]

FROM deps AS build
COPY . .
RUN npm run build
