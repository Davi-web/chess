'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui';
import { signOut } from 'next-auth/react';
import { navigate } from '@/accessors/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
interface HeaderProps {
  userImg: string;
  userId: string;
}

const Header: React.FC<HeaderProps> = ({ userImg, userId }) => {
  const router = useRouter();
  console.log(userImg);
  return (
    <div
      id="header"
      className="w-screen flex flex-row justify-end p-2 space-x-4"
    >
      <div>
        <h1 className="text-4xl font-bold text-center">Chess</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="overflow-hidden outline-none hover:scale-110 transition-transform duration-300 rounded-full"
          >
            <Image
              src={userImg}
              alt="Profile"
              width={40}
              height={40}
              className="overflow-hidden founded-full w-full h-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/profile/${userId}`)}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(
                'https://github.com/Davi-web/chess-frontend/issues/new'
              )
            }
          >
            Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              signOut({ callbackUrl: '/' });
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;
