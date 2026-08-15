FROM node:22-alpine3.19 as base

RUN apk add --no-cache tini openssl
WORKDIR /app
COPY package*.json ./

FROM base as dev

ENV NODE_ENV=development
RUN  npm Ci 
COPY . .
RUN npx prisma generate
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD ["npm","run","start:dev"]

FROM base AS builder
ENV NODE_ENV=development
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine3.19 as prod
RUN apk add --no-cache tini openssl
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]


CMD [ "node","dist/main.js"]