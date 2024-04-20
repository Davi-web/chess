import { getAllGames } from '@/accessors/prismaAccessors';
import React from 'react';

export default async function page() {
  const games = await getAllGames();
  return (
    <div>
      <h1>Games</h1>
    </div>
  );
}
