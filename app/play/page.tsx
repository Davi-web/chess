import PlayButton from '@/components/buttons/PlayButton';
import { OpponentType } from '@/enums';
import getCurrentUser from '@/accessors/getCurrentUser';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signIn, signOut } from 'next-auth/react';
const labels = {
  friends: 'Play with Friends',
  computer: 'Play with a Computer',
  online: 'Play Online',
};
const Page = async () => {
  const user = await getCurrentUser();
  //   if (!user) {
  //     redirect('/api/auth/signin');
  //   }
  console.log(user);

  return (
    <div className="h-screen">
      <h1 className="text-4xl font-bold text-center mt-14">Chess</h1>
      <div className="flex flex-col items-center space-y-2 h-full justify-center">
        <PlayButton
          opponentType={OpponentType.Friends}
          label={labels.friends}
        />
        <PlayButton
          opponentType={OpponentType.Computer}
          label={labels.computer}
        />
        <PlayButton opponentType={OpponentType.Online} label={labels.online} />
      </div>
    </div>
  );
};

export default Page;
