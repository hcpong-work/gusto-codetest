FROM node:16.16.0 as base

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY start.sh ./
COPY .env.production ./.env

RUN npm install

COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./tsconfig.json
COPY swagger.json ./swagger.json

RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD []