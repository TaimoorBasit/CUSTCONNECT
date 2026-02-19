import { PrismaClient } from '@prisma/client';

// Initialize Prisma with log configuration
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
