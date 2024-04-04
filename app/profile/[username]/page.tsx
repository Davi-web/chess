import getCurrentUser, {
  getUserById,
  getGamesByPlayerId,
} from '@/accessors/getCurrentUser';
import { Card, CardContent } from '@/components/ui';

import Header from '@/components/Header';

export default async function Page({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const profileUser = await getUserById(username);
  const user = await getCurrentUser();
  const games = await getGamesByPlayerId(username);

  if (!user || !user.image) {
    //redirect to error page
    console.log('user not found');
    // redirect('/404');
    return;
  }
  console.log(user);

  console.log(user);
  return (
    <div>
      <Header userImg={user.image!} userId={user.id} />

      <h2>{user.email}</h2>
      <Card>
        <CardContent>
          hello
          <div>
            {games.map((game) => (
              <div key={game.id}>
                {game.moves}
                {game.msgs}

                <h3>{game.winnerId}</h3>
                <h3>{game.loserId}</h3>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
