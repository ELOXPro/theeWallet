import Image from 'next/image';

export const metadata = {
  title: "Loading || Inkingi System",
  description: "Loading Inkingi System.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function NotFound() {
  return (
    <div className='w-screen h-screen flex flex-col gap-6 items-center justify-center overflow-hidden'>
      <div className='p-2 gap-2 flex flex-col'>
      <Image src="/Icon.png" alt=" theeWallet Logo" width={100} height={100} />
      </div>
      <h1 className='border-t border-secondary text-primary font-bold text-xl'>Loading</h1>
    </div>
  )
}