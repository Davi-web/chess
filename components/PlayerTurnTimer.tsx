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
      ? 'text-black'
      : p1TimeRemaining > twoThirds
      ? 'text-green-400'
      : p1TimeRemaining > oneThird
      ? 'text-yellow-400'
      : 'text-red-400';
  const p2ConditionalText =
    p2TimeRemaining === timeTotal
      ? 'text-black'
      : p2TimeRemaining > twoThirds
      ? 'text-green-400'
      : p2TimeRemaining > oneThird
      ? 'text-yellow-400'
      : 'text-red-400';

  const p1ConditionalProgress =
    p1TimeRemaining === timeTotal
      ? 'bg-primary'
      : p1TimeRemaining > twoThirds
      ? 'bg-green-400'
      : p1TimeRemaining > oneThird
      ? 'bg-yellow-400'
      : 'bg-red-400';
  const p2ConditionalProgress =
    p2TimeRemaining === timeTotal
      ? 'bg-primary'
      : p2TimeRemaining > twoThirds
      ? 'bg-green-400'
      : p2TimeRemaining > oneThird
      ? 'bg-yellow-400'
      : 'bg-red-400';
  console.log(p1ConditionalProgress, p2ConditionalProgress);
  return (
    <div className="flex w-full h-full gap-4">
      <div id="p1-timer" className="flex flex-col ">
        {p1.username} Timer:{' '}
        <span
          className={`text-lg font-bold transition-colors duration-300 ${p1ConditionalText}`}
        >
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
