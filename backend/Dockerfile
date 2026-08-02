FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Ao subir o container: aplica migrações, popula dados de teste (idempotente
# graças aos upserts) e inicia o servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]
