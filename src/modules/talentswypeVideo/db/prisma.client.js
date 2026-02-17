let prisma;

if (process.env.JEST_WORKER_ID) {
  // Tests that do not hit DB can load modules without requiring Prisma runtime.
  prisma = {};
} else {
  const { PrismaClient } = await import('@prisma/client');

  if (!globalThis.__talentswypePrisma) {
    globalThis.__talentswypePrisma = new PrismaClient();
  }

  prisma = globalThis.__talentswypePrisma;
}

export default prisma;
