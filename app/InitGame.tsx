'use client';
import { Button, Input } from '@/components/ui';
import { SetStateAction, useState } from 'react';
import CustomDialogModal from '@/components/modals/customDialogModal';
import socket from './socket';
import { BoardOrientation } from 'react-chessboard/dist/chessboard/types';
import useCustomDialogModal from '@/zustand/useCustomDialogModal';

interface InitGameProps {
  setRoom: (value: SetStateAction<string>) => void;
  setOrientation: (value: SetStateAction<BoardOrientation>) => void;
  setPlayers: (value: SetStateAction<any[]>) => void;
}

export default function InitGame({
  setRoom,
  setOrientation,
  setPlayers,
}: InitGameProps) {
  const modal = useCustomDialogModal();
  const [roomInput, setRoomInput] = useState(''); // input state
  const [roomError, setRoomError] = useState('');
  const handleContinueJoinGame = () => {
    // join a room
    if (!roomInput) return; // if given room input is valid, do nothing.
    socket.emit(
      'joinRoom',
      { roomId: roomInput },
      (r: {
        error: any;
        message: SetStateAction<string>;
        roomId: any;
        players: any;
      }) => {
        // r is the response from the server
        if (r.error) return setRoomError(r.message); // if an error is returned in the response set roomError to the error message and exit
        console.log('response:', r);
        setRoom(r?.roomId); // set room to the room ID
        setPlayers(r?.players); // set players array to the array of players in the room
        setOrientation('black'); // set orientation as black
        modal.onClose();
      }
    );
  };

  const startGame = () => {
    socket.emit('createRoom', (roomId: string) => {
      console.log(roomId);
      setRoom(roomId);
      setOrientation('white');
    });
  };

  return (
    <div className="flex flex-col space-y-2 justify-center items-center py-1 h-screen">
      <CustomDialogModal
        modal={modal}
        handleClose={modal.onClose}
        title="Select Room to Join"
        contentText="Enter a valid room ID to join the room"
        handleContinue={handleContinueJoinGame}
      >
        <Input
          autoFocus
          id="room"
          name="room"
          value={roomInput}
          required
          onChange={(e) => setRoomInput(e.target.value)}
          type="text"

          // error={Boolean(roomError)}
          // helperText={
          //   !roomError ? 'Enter a room ID' : `Invalid room ID: ${roomError}`
          // }
        />
      </CustomDialogModal>
      {/* Button for starting a game */}
      <Button onClick={startGame}>Start a game</Button>
      {/* Button for joining a game */}
      <Button
        onClick={() => {
          modal.onOpen();
          // setRoomDialogOpen(true);
        }}
      >
        Join a game
      </Button>
      <Button
        onClick={() => {
          socket.emit(
            'joinRandomRoom',
            (r: {
              error: boolean;
              message: string;
              roomId: string;
              players: any[];
            }) => {
              console.log(r);
              if (r.error) {
                setRoomError(r.message);
                return;
              }
              setRoom(r.roomId);
              setOrientation('black');
              setPlayers(r.players);
            }
          );
        }}
      >
        Join Random room
      </Button>
    </div>
  );
}
