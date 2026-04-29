import { PrismaClient } from '../generated/prisma/index.js';

// Singleton: uma única instância compartilhada por toda a aplicação.
// Múltiplas instâncias de PrismaClient abrem múltiplos pools e esgotam
// as conexões disponíveis no MongoDB muito mais rápido.
//
// O pool é controlado pela DATABASE_URL via maxPoolSize/minPoolSize.
// Para 500 usuários simultâneos, use maxPoolSize=100 na DATABASE_URL.

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // Em dev, reaproveita a instância entre hot-reloads para não estourar conexões.
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

export default prisma;
