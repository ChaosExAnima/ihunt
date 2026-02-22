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

ARG VITE_SERVER_HOSTS

RUN yarn build

FROM base AS runner
WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./server/
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

EXPOSE 3333

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "server/server.js"]
