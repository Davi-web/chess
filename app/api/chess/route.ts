import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function POST(req: Request) {
  const body = await req.json();
  const { roomId, moves, result, playerIds, draw } = body;
  //check if game already exists
  const existingGame = await prisma.game.findFirst({
    where: {
      roomId,
    },
  });
  if (existingGame) {
    await prisma.game.update({
      where: {
        id: existingGame.id,
      },
      data: {
        moves,
        result,
        playerIds,
        draw,
      },
    });
    return NextResponse.json(existingGame);
  }

  const game = await prisma.game.create({
    data: {
      roomId,
      moves,
      result,
      playerIds,
      draw,
    },
  });
  return NextResponse.json(game);
}
