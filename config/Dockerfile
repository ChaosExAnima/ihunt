FROM node:24-slim AS base

ENV NODE_ENV=production YARN_VERSION=4.12.0

RUN apt update && apt install dumb-init

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

FROM base AS builder
WORKDIR /app

COPY . .
COPY yarn.lock package.json .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

RUN yarn run build:prisma && yarn run build:scripts && yarn run build:server

FROM base AS runner
WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/server.js .
COPY --from=builder --chown=nodejs:nodejs /app/scripts/dist ./scripts/
COPY yarn.lock package.json .yarnrc.yml .

RUN yarn workspaces focus --production

USER nodejs

EXPOSE 3333

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "server.js"]
