FROM node:24.0.0 AS build


WORKDIR /tmp/buildApp

COPY ./package*.json ./

RUN npm install
COPY . .
RUN npm run build

FROM node:24.0.0-alpine3.21 AS production

RUN apk add dumb-init

ENV NODE_ENV=production
ENV SERVER_PORT=3000


WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci --only=production

COPY --chown=node:node --from=build /tmp/buildApp/dist .
COPY --chown=node:node ./config ./config


USER node
EXPOSE 3000
CMD ["dumb-init", "node", "--max_old_space_size=512", "./index.js"]
