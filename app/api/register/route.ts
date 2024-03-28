import bcrypt from 'bcrypt';
import prisma from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, name, password } = body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      hashedPassword,
      gamesDrawn: 0,
      gamesLost: 0,
      gamesWon: 0,
      gamesPlayed: 0,
      rating: 1200,
    },
  });
  return NextResponse.json(user);
}
