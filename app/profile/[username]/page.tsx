import getCurrentUser, {
  getUserById,
  getGamesByPlayerId,
} from '@/accessors/prismaAccessors';
import { Card, CardContent } from '@/components/ui';
import DisplayGames from '@/components/DisplayGames';

import Header from '@/components/Header';

export default async function Page({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const profileUser = await getUserById(username);
  const user = await getCurrentUser();
  let gamesByProfile = await getGamesByPlayerId(username);

  if (!user || !profileUser) {
    //redirect to error page
    console.log('user not found');
    // redirect('/404');
    return;
  }

  console.log(user);
  return (
    <div className="bg-secondary w-screen h-screen">
      <Header userImg={user.image!} userId={user.id} />
      <div className="flex flex-col sm:flex-row justify-between sm:space-x-4">
        <Card id="profile" className="w-full sm:w-1/3">
          <CardContent>
            <h1>User Profile</h1>
            <p>{profileUser.name}</p>
            <p>{profileUser.email}</p>
            <p>{profileUser.bio}</p>
          </CardContent>
        </Card>
        <Card className="w-full sm:w-2/3">
          <CardContent>
            <DisplayGames
              games={gamesByProfile}
              userId={profileUser.id}
              username={profileUser.name}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
