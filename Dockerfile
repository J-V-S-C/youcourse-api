# dev
FROM node:20-alpine AS dev
WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

CMD ["sh", "-c" ,"pnpm prisma generate && pnpm run dev"]

# builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY . .

RUN pnpm build

# prod
FROM node:20-alpine AS prod
WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "pnpm db:deploy && node dist/main.js"]