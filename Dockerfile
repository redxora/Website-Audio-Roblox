 
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev=false
 
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
 
FROM node:22-alpine AS runner
WORKDIR /app
 
RUN apk add --no-cache python3 py3-pip ffmpeg su-exec \
  && pip install --no-cache-dir --break-system-packages yt-dlp

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
 
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/bot ./bot
COPY --from=builder --chown=node:node /app/plans.config.json ./plans.config.json
 
RUN mkdir -p /tmp/cilaaa && chown -R node:node /tmp/cilaaa

USER node
EXPOSE 3000
 
CMD ["sh", "-c", "node server.js"]
