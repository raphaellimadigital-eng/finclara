import { PrismaClient } from "@prisma/client";

// Evita criar múltiplas instâncias do Prisma Client em desenvolvimento
// (o Next.js recarrega os módulos a cada mudança de código)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
