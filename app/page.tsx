import PlayButton from '@/components/buttons/PlayButton';
import { OpponentType } from '@/enums';
import { options } from './api/auth/[...nextauth]/options';
import getCurrentUser, { getSession } from '../accessors/prismaAccessors';

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

  return (
    <div className="h-screen">
      <h1 className="text-4xl font-bold text-center">Chess</h1>
      <div className="flex flex-col items-center space-y-2">
        <PlayButton
          opponentType={OpponentType.Friends}
          label="Play with Friends"
        />
        <PlayButton
          opponentType={OpponentType.Computer}
          label="Play with a Computer"
        />

        <PlayButton opponentType={OpponentType.Online} label="Play Online" />
      </div>
    </div>
  );
}
