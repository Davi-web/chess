import getCurrentUser from '@/accessors/getCurrentUser';
import ClientOpponent from './ClientOpponent';
import { redirect } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { OpponentType } from '@/enums';

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

  console.log(user);
  return <ClientOpponent user={user} opponent={opponent} />;
}
