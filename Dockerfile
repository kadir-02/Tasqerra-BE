FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Prisma (important if you're using it)
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/src/server.js"]