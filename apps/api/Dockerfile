FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/runtime-model/package.json ./packages/runtime-model/
COPY packages/gadget-engine/package.json ./packages/gadget-engine/
COPY packages/chain-engine/package.json ./packages/chain-engine/
COPY packages/evidence/package.json ./packages/evidence/
COPY apps/api/package.json ./apps/api/

RUN npm ci

COPY packages/shared/src/ ./packages/shared/src/
COPY packages/runtime-model/src/ ./packages/runtime-model/src/
COPY packages/gadget-engine/src/ ./packages/gadget-engine/src/
COPY packages/chain-engine/src/ ./packages/chain-engine/src/
COPY packages/evidence/src/ ./packages/evidence/src/
COPY apps/api/src/ ./apps/api/src/

EXPOSE 4001
CMD ["npx", "tsx", "apps/api/src/index.ts"]
