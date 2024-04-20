import PlayButton from '@/components/buttons/PlayButton';
import { OpponentType } from '@/enums';
import { options } from './api/auth/[...nextauth]/options';
import getCurrentUser, { getSession } from '../accessors/prismaAccessors';
import Header from '@/components/Header';
import { navigate } from '@/accessors/actions';
import { redirect } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import Link from 'next/link';

export interface Player {
  id: string;
  socketId: string;
  username: string;
  rating: number;
  imageUrl: string;
}
export default async function Home() {
  const session = await getSession();
  const user = await getCurrentUser();
  console.log(session);
  console.log(user);
  if (!user) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="h-screen w-screen bg-secondary">
      <Header userId={user.id} userImg={user.image || '/default-avatar.webp'} />
      <div className="grid grid-cols-1 space-x-3 items-center">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Play with me</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href={'/play'}>
              <Button>Play </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
