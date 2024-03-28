'use client';

import { useState, useEffect, FC } from 'react';
import socket from '@/app/socket';
import { Progress } from '@/components/ui/progress';
import { Player } from '@/app/page';
interface PlayerTurnTimerProps {
  p1: Player;
  p2: Player;
  p1TimeRemaining: number;
  p2TimeRemaining: number;
  timeTotal: number;
}

const PlayerTurnTimer: FC<PlayerTurnTimerProps> = ({
  p1,
  p2,
  p1TimeRemaining,
  p2TimeRemaining,
  timeTotal,
}) => {
  //time remaining is in seconds, we need to get the percentage of time remaining to display in the progress bar
  const p1TimeRemainingPercentage = (p1TimeRemaining / timeTotal) * 100;
  const p2TimeRemainingPercentage = (p2TimeRemaining / timeTotal) * 100;
  return (
    <div className="flex flex-col">
      Time Remaining for {p1.username}: {p1TimeRemaining} seconds
      <Progress value={p1TimeRemainingPercentage} color={'red'} />
      Time Remaining for {p2.username}: {p2TimeRemaining} seconds
      <Progress value={p2TimeRemainingPercentage} color={'red'} />
    </div>
  );
};

export default PlayerTurnTimer;
