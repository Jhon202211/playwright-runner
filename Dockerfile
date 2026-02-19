# Imagen oficial Playwright con dependencias Linux (evita errores Chromium en Railway)
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
