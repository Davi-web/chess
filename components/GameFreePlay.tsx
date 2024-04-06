'use client';
import React from 'react';
import { Chessboard } from 'react-chessboard';
interface GameFreePlayProps {
  fen: string;
}
const GameFreePlay: React.FC<GameFreePlayProps> = ({ fen }) => {
  return (
    <div className="w-96 h-96 flex">
      <Chessboard position={fen} />
    </div>
  );
};

export default GameFreePlay;
