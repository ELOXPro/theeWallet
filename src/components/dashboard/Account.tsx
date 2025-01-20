"use client";

import { AddAccount } from "../account/AddAccount";
export default function Account({ userId, name }: { userId: string , name: string}) {

  return (
    <div className="col-span-2 flex h-full w-full flex-col gap-2 rounded-md border border-black p-2 shadow-md">
      <div className="flex flex-col sm:flex-row w-full justify-start capitailize gap-2">
        <h1 className="text-2xl font-extrabold">HI,</h1>
        <h1 className="text-2xl font-extrabold">{name}</h1>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-start">
        <AddAccount userId={userId} />
      </div>
    </div>
  );
}
