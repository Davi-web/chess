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
  const oneThird = timeTotal / 3;
  const twoThirds = (timeTotal / 3) * 2;
  const p1TimeRemainingPercentage = (p1TimeRemaining / timeTotal) * 100;
  const p2TimeRemainingPercentage = (p2TimeRemaining / timeTotal) * 100;
  const p1ConditionalText =
    p1TimeRemaining === timeTotal
      ? 'black'
      : p1TimeRemaining > twoThirds
      ? 'text-green-500'
      : p1TimeRemaining > oneThird
      ? 'text-yellow-500'
      : 'text-red-500';
  const p2ConditionalText =
    p2TimeRemaining === timeTotal
      ? 'black'
      : p2TimeRemaining > twoThirds
      ? 'text-green-500'
      : p2TimeRemaining > oneThird
      ? 'text-yellow-500'
      : 'text-red-500';

  const p1ConditionalProgress =
    p1TimeRemaining === timeTotal
      ? 'black'
      : p1TimeRemaining > twoThirds
      ? 'bg-green-500'
      : p1TimeRemaining > oneThird
      ? 'bg-yellow-500'
      : 'bg-red-500';
  const p2ConditionalProgress =
    p2TimeRemaining === timeTotal
      ? 'black'
      : p2TimeRemaining > twoThirds
      ? 'bg-green-500'
      : p2TimeRemaining > oneThird
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div className="flex w-full h-full gap-4">
      <div id="p1-timer" className="flex flex-col ">
        {p1.username} Timer:{' '}
        <span className={`text-lg font-bold ${p1ConditionalText}`}>
          {p1TimeRemaining} seconds
        </span>
        <Progress
          value={p1TimeRemainingPercentage}
          fill={p1ConditionalProgress}
        />
      </div>
      <div id="p2-timer" className="flex flex-col ">
        {p2.username} Timer:{' '}
        <span className={`text-lg font-bold ${p2ConditionalText}`}>
          {p2TimeRemaining} seconds
        </span>
        <Progress
          value={p2TimeRemainingPercentage}
          fill={p2ConditionalProgress}
        />
      </div>
    </div>
  );
};

export default PlayerTurnTimer;
