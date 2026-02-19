import { PrismaClient } from '@prisma/client';

// Initialize Prisma with log configuration
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

// Robust database connection with retries
export async function connectDB() {
    let retries = 5;
    while (retries > 0) {
        try {
            await prisma.$connect();
            console.log('✅ Database connected successfully');
            return;
        } catch (error: any) {
            console.error(`❌ Database connection failed (retries left: ${retries}):`, error.message);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
        }
    }
    console.error('❌ Could not connect to database after 5 attempts');
}

connectDB();

export default prisma;
