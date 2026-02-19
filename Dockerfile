# Imagen debe coincidir con la versión de @playwright/test en package.json
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
