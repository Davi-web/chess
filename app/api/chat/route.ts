// import getCurrentUser from '@/app/actions/getCurrentUser';
// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prismadb';
// export async function POST(req: Request) {
//   const body = await req.json();
//   const { userId, roomId, message } = body;
//   const user = await getCurrentUser();
//   if (!user) {
//     return NextResponse.error();
//   }
//   const room = await prisma.room.findUnique({ where: { id: roomId } });
//   if (!room) {
//     return NextResponse.error();
//   }
//   const newMessage = await prisma.message.create({
//     data: {
//       content: message,
//       roomId,
//       senderId: userId,
//     },
//   });
//   //append the new message to the room
//   await prisma.room.update({
//     where: { id: roomId },
//     data: {
//       messages: {
//         connect: { id: newMessage.id },
//       },
//     },
//   });
//   return NextResponse.json(newMessage);
// }
