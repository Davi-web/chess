import prisma from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { roomId } = body;
  console.log('roomId', roomId);
  const room = await prisma.room.create({
    data: {
      id: roomId,
      messages: {
        create: {
          content: 'Welcome to the room!',
          senderId: 'system',
        },
      },
    },
  });
  return NextResponse.json(room);
}
