# syntax = docker/dockerfile:1

ARG NODE_VERSION=18.18.0

FROM node:${NODE_VERSION}-slim as base

ARG PORT=3000

ENV NODE_ENV=production

WORKDIR /src

# Build
FROM base as build

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --production=false

COPY . .

RUN pnpm run build
RUN pnpm prune

# Run
FROM base

EXPOSE $PORT

COPY --from=build /src/.output /src/.output
# If your application relies on unbundled dependencies
# COPY --from=build /src/node_modules /src/node_modules

CMD [ "node", ".output/server/index.mjs" ]
