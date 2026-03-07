FROM node:24-slim AS base

ENV NODE_ENV=production YARN_VERSION=4.12.0

RUN apt update && apt install --yes dumb-init openssl
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

WORKDIR /app

FROM base AS builder

COPY .yarnrc.yml global.d.ts package.json yarn.lock prisma.config.ts tsconfig.json vite.config.ts .
COPY prisma ./prisma
COPY public ./public
COPY scripts ./scripts
COPY server ./server
COPY src ./src

RUN yarn install --immutable
RUN yarn run build

FROM base AS runner

COPY --from=builder /app/server.js .
COPY --from=builder /app/dist ./dist
COPY public /app/public
COPY yarn.lock package.json .yarnrc.yml .

RUN yarn workspaces focus --production

EXPOSE 4000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "server.js"]
