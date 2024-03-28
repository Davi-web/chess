import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}
// Singleton pattern so that we don't create multiple instances of `PrismaClient` in our application
const client = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = client;

export default client;
