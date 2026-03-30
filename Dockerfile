FROM node:20 as node_with_pnpm
COPY package.json ./
RUN corepack enable && corepack prepare --activate
WORKDIR /app

FROM node_with_pnpm as composer
ENV NODE_ENV=production
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json ./
COPY .husky ./.husky
RUN pnpm install --prefer-offline --frozen-lockfile
ADD . ./
RUN pnpm build

FROM node_with_pnpm as runner
ENV NODE_ENV=production

COPY --from=composer /app/node_modules ./node_modules
COPY --from=composer /app/.next ./.next
COPY --from=composer /app/public ./public
COPY --from=composer /app/package.json ./package.json
COPY --from=composer /app/next.config.js ./

EXPOSE 3000
CMD ["pnpm", "start"]
