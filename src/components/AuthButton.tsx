'use client';

import { signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';

export default function AuthButton({ userId }: { userId: string }) {

  if (userId) {
    return (
      <div className='flex flex-col gap-1 justify-center items-center'>
        <Button className='text-sm' onClick={() => signOut()}>Sign Out</Button>
      </div>
    );
  }

  return <Button onClick={() => signIn()}>Sign In</Button>;
}
