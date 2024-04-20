import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prismadb';

export async function getSession() {
  const session = await getServerSession(options);
  return session;
}

export default async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session?.user?.email) return null;
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
    if (!user) return null;
    return user;
    // return {
    //   ...user,
    //   createdAt: user.createdAt.toISOString(),
    //   updatedAt: user.updatedAt.toISOString(),
    //   emailVerified: user.emailVerified?.toISOString() || null,
    // };
  } catch (e) {
    return null;
  }
}

export function getUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export function getGamesByPlayerId(id: string) {
  return prisma.game.findMany({
    where: {
      OR: [
        {
          winnerId: id,
        },
        {
          loserId: id,
        },
      ],
    },
  });
}
export function getGameById(gameId: string) {
  return prisma.game.findUnique({
    where: {
      id: gameId,
    },
  });
}

export function getAllGames() {
  return prisma.game.findMany();
}
