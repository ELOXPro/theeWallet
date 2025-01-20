"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";

export default function MenuLink({
  Title,
  url,
}: {
  Title: string;
  url: string;
}) {
  const pathname = usePathname();
  const path = pathname === url;
  return (
    <div
      className={`${path ? "border-b" : ""} border-black transition-all hover:border-b`}
    >
      <Link href={url}>{Title}</Link>
    </div>
  );
}
