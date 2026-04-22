# ---- Stage 1: Dependências ----
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Instala todas as dependências (incluindo dev, necessário para prisma generate)
RUN npm ci

# Gera o Prisma Client para Linux (Alpine)
COPY prisma ./prisma/
RUN npx prisma generate


# ---- Stage 2: Runtime ----
FROM node:20-alpine AS runner

WORKDIR /app

# Copia package.json para instalar apenas prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o Prisma Client gerado para Linux (sobrescreve o gerado localmente para Windows)
COPY --from=deps /app/src/generated ./src/generated
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copia o restante do código
COPY prisma ./prisma/
COPY src ./src/
COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]