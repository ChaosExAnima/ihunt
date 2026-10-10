FROM node:26-slim AS base

ENV NODE_ENV=production YARN_VERSION=4.18.1

RUN apt update && apt install --yes dumb-init openssl
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

WORKDIR /app

FROM base AS builder

COPY .yarnrc.yml package.json yarn.lock tsconfig.json .
COPY server ./server
COPY client ./client
COPY admin ./admin

RUN yarn install --immutable
RUN yarn run build

FROM base AS runner

COPY --from=builder /app/server/server.js .
COPY yarn.lock package.json .yarnrc.yml .

RUN yarn workspaces focus --production server

EXPOSE 4000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "server.js"]
