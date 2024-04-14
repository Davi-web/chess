import getCurrentUser, {
  getUserById,
  getGamesByPlayerId,
  getGameById,
} from '@/accessors/prismaAccessors';
import { Card, CardContent } from '@/components/ui';
import GameFreePlay from '@/components/GameFreePlay';

import Header from '@/components/Header';
import { Chessboard } from 'react-chessboard';
export default async function Page({ params }: { params: { gameId: string } }) {
  const { gameId } = params;
  const game = await getGameById(gameId);
  const user = await getCurrentUser();

  if (!game || !user) {
    //redirect to error page
    console.log('Game Not found');
    // redirect('/404');
    return;
  }

  console.log(game);
  return (
    <div>
      <Header userImg={user.image || ''} userId={user.id} />
      <GameFreePlay fen={game.moves[game.moves.length - 1]} />
    </div>
  );
}
