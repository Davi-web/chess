import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prismadb';
export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const { name, email, bio } = body;
  try {
    //check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (existingUser) {
      // if there is no hashed password, user is signed in with a third party provider
      if (!existingUser.hashedPassword) {
        if (name !== existingUser.name) {
          return NextResponse.json({
            error:
              'User is signed in with a third party provider. Cannot update name.',
            status: 400,
          });
        } else {
          // we can still update the bio
          existingUser.bio = bio;
          await prisma.user.update({
            where: {
              id: existingUser.id,
            },
            data: {
              bio: existingUser.bio,
            },
          });
          return NextResponse.json(existingUser);
        }
      }
      // if user is signed in with email and password
      if (name !== existingUser.name) {
        existingUser.name = name;
      }
      existingUser.bio = bio;
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          bio: existingUser.bio,
          name: existingUser.name,
        },
      });
      return NextResponse.json(existingUser);
    }
    return NextResponse.json({ error: 'User not found', status: 404 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, status: 500 });
  }
}
