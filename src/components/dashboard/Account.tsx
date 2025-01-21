"use client";

import { AddAccount } from "../account/AddAccount";
import { CreateTransaction } from "../transaction/CreateTransaction";
import { Settings } from "lucide-react";
import Link from "next/link";
export default function Account({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  return (
    <div className="col-span-1 flex h-auto w-full flex-col justify-between gap-2 rounded-md border border-black p-2 shadow-md sm:col-span-2 sm:h-full">
      <div className="capitalize flex w-full items-center justify-between gap-2">
        <h1 className="w-3/4 text-2xl font-extrabold text-ellipsis">Hi, {name}</h1>
        <Link href={`/settings/${userId}`} className="w=1/4 py-1 px-2">
          <Settings />
        </Link>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-end gap-1">
        <CreateTransaction userId={userId} />
        <AddAccount userId={userId} />
      </div>
    </div>
  );
}
