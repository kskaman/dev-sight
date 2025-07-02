import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],           // or ["query","error"] in dev
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;  // share the instance across HMR boundaries
}