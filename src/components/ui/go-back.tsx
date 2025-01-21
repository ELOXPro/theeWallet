'use client'

import { useRouter } from "next/navigation";

export default function GoBack(){

  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };
  return (
    <button
    className='border-y border-primary hover:border-secondary rounded-md text-sm p-1 font-bold text-primary duration-200 transition-all'
    onClick={handleGoBack}>Go Back</button>
  )
}