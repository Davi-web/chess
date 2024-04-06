import getCurrentUser from '@/accessors/prsimaAccessors';
import ClientOpponent from './ClientOpponent';
import { redirect } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { OpponentType } from '@/enums';
import Header from '@/components/Header';

export default async function Page({
  params,
}: {
  params: { opponent: OpponentType };
}) {
  const { opponent } = params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <Header userImg={user.image!} userId={user.id} />

      <ClientOpponent user={user} opponent={opponent} />
    </div>
  );
}
