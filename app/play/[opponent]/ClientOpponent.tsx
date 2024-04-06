'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { BoardOrientation } from 'react-chessboard/dist/chessboard/types';
import { Player } from '@/app/page';
import Game from '@/app/Game';
import InitGame from '@/app/InitGame';
import socket from '../../socket';
import { Button } from '@/components/ui/button';
import { signIn, signOut } from 'next-auth/react';
import { User } from '@prisma/client';
import { OpponentType } from '@/enums';
import { getUserById } from '@/accessors/prsimaAccessors';
interface ClientOpponentProps {
  user: User;
  opponent: OpponentType;
}

export default function ClientOpponent({
  user,
  opponent,
}: ClientOpponentProps) {
  const [username, setUsername] = useState(user.name);
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);

  const [room, setRoom] = useState('');
  const [orientation, setOrientation] = useState<BoardOrientation>('white');
  const [players, setPlayers] = useState<Player[]>([]);

  // resets the states responsible for initializing a game
  const cleanup = useCallback(() => {
    setRoom('');
    setOrientation('white');
    setPlayers([]);
  }, []);
  useEffect(() => {
    if (user) {
      socket.emit('user', user);
      console.log('emitted username', user);
    }
  }, [user]);

  useEffect(() => {
    socket.on('opponentJoined', (roomData) => {
      console.log('roomData', roomData);

      setPlayers(roomData.players);
    });
  }, []);

  return (
    <div className="w-full h-full overflow-y-clip">
      {/* <Button
        onClick={() => {
          signIn();
        }}
      >
        Sign In
      </Button>
     */}

      {room ? (
        <Game
          room={room}
          orientation={orientation}
          username={username!}
          players={players}
          currUserId={user.id}
          // the cleanup function will be used by Game to reset the state when a game is over
          cleanup={cleanup}
          roomId={room}
        />
      ) : (
        <InitGame
          setRoom={setRoom}
          setOrientation={setOrientation}
          setPlayers={setPlayers}
        />
      )}
    </div>
  );
}
