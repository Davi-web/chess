import React from 'react';
import { Button } from '../ui/button';
import { CarIcon, Globe, Handshake, Monitor } from 'lucide-react';
import { OpponentType } from '@/enums';
import Link from 'next/link';

interface PlayButtonProps {
  opponentType: OpponentType;
  label: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({ opponentType, label }) => {
  let icon;
  switch (opponentType) {
    case OpponentType.Friends:
      icon = <Handshake className="w-8 h-8 mr-2" />;
      break;

    case OpponentType.Computer:
      icon = <Monitor className="w-8 h-8 mr-2" />;
      break;

    case OpponentType.Online:
      icon = <Globe className="w-8 h-8 mr-2" />;
      break;
    default:
      break;
  }
  return (
    <Link href={`/play/${opponentType}`}>
      <Button
        variant="secondary"
        size="lg"
        className="flex w-64 justify-start  bg-emerald-400 hover:bg-emerald-500 text-lime-800"
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
};

export default PlayButton;
