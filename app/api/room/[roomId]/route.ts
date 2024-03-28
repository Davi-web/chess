import prisma from '@/lib/prismadb';
import { NextResponse } from 'next/server';
interface IRoomGetParams {
  roomId: string;
}

export async function GET({ params }: { params: IRoomGetParams }) {
  const { roomId } = params;
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });
  return NextResponse.json(room);
}
