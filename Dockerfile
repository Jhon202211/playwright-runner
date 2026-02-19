# Imagen oficial Playwright (versión 1.50 = Chromium incluido)
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
