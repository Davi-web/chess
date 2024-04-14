import PlayButton from '@/components/buttons/PlayButton';
import { OpponentType } from '@/enums';
import getCurrentUser from '@/accessors/prismaAccessors';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signIn, signOut } from 'next-auth/react';

const Page = async () => {
  //   const user = await getCurrentUser();
  //     if (!user) {
  //       redirect('/api/auth/signin');
  //     }
  //   console.log(user);

  return <div></div>;
};

export default Page;
