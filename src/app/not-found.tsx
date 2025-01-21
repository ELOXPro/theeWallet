import GoBack from '@/components/ui/go-back';
import Image from 'next/image';

export const metadata = {
  title: "Not Found || Inkingi System",
  description: "Page Not Found in Inkingi System.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function NotFound() {
  return (
    <div className='w-screen h-screen flex gap-6 items-center justify-center'>
      <Image src="/icon.png" alt=" theeWallet Logo" width={50} height={50} priority />
      <div className='border-l border-secondary gap-4 flex flex-col p-2'>
      <h1 className='text-primary text-xl animate-pulse font-bold'>Page Not Found</h1>
      <GoBack />
      </div>
    </div>
  )
}