# ---- Stage 1: Dependências ----
    FROM node:20-alpine AS deps

    WORKDIR /app
    
    COPY package*.json ./
    COPY prisma ./prisma/
    
    # Instala todas as dependências (incluindo dev, necessário para prisma generate)
    RUN npm ci
    
    # Gera o Prisma Client para Linux (Alpine)
    RUN npx prisma generate
    
    
    # ---- Stage 2: Runtime ----
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    # Copia package.json
    COPY package*.json ./
    
    # Copia o schema do Prisma ANTES do npm ci
    # (necessário para o script postinstall não falhar)
    COPY prisma ./prisma/
    
    # Instala apenas prod deps
    RUN npm ci --omit=dev
    
    # Sobrescreve o Prisma Client com o gerado para Linux no Stage 1
    COPY --from=deps /app/src/generated ./src/generated
    COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
    
    # Copia o restante do código
    COPY src ./src/
    COPY server.js ./
    
    EXPOSE 3001
    
    CMD ["node", "server.js"]