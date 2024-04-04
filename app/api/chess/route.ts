import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function POST(req: Request) {
  const body = await req.json();
  const {
    moves,
    msgs,
    result,
    playerIds,
    draw,
  }: {
    moves: string[];
    msgs: string[];
    result: string;
    playerIds: string[];
    draw: boolean;
  } = body;
  console.log(' creating new game', moves, result, msgs, playerIds, draw);

  if (!moves || !msgs || !result || !playerIds) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (draw) {
    return NextResponse.json(
      { error: 'We dont F with Draws' },
      { status: 400 }
    );
  }
  //initialize winner and loser based on the substring of the result
  //contains the color of the winner
  const winnerId = result.includes('white') ? playerIds[0] : playerIds[1];
  const loserId = result.includes('white') ? playerIds[1] : playerIds[0];
  const winner = await prisma.user.findUnique({
    where: {
      id: winnerId,
    },
  });
  const loser = await prisma.user.findUnique({
    where: {
      id: loserId,
    },
  });
  if (!winner || !loser || !winner.rating || !loser.rating || !winner.name) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  //replace 'white' or 'black' with winner.name
  result.replace('white', winner.name).replace('black', winner.name);

  console.log('winner', winnerId, 'loser', loserId);

  const game = await prisma.game.create({
    data: {
      moves,
      msgs,
      result,
      draw,
      winnerId,
      loserId,
    },
  });
  // We must now update the elo ratings of players

  const winnerExpected = 1 / (1 + 10 ** ((loser.rating - winner.rating) / 400));
  const loserExpected = 1 / (1 + 10 ** ((winner.rating - loser.rating) / 400));
  const winnerNewRating = winner.rating + 32 * (1 - winnerExpected);
  const loserNewRating = loser.rating + 32 * (0 - loserExpected);
  //make updates to user based on userId and result
  const updatedWinner = await prisma.user.update({
    where: {
      id: winnerId,
    },
    data: {
      gamesWon: {
        increment: 1,
      },
      gamesPlayed: {
        increment: 1,
      },
      Wins: {
        connect: {
          id: game.id,
        },
      },
      rating: winnerNewRating,
    },
  });

  const updatedLoser = await prisma.user.update({
    where: {
      id: loserId,
    },
    data: {
      gamesLost: {
        increment: 1,
      },
      gamesPlayed: {
        increment: 1,
      },

      Losses: {
        connect: {
          id: game.id,
        },
      },
      rating: loserNewRating,
    },
  });

  // check if user won or lost the game
  return NextResponse.json({ game, updatedWinner, updatedLoser });
}
