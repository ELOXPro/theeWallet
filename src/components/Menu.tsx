import AuthButton from "./AuthButton";

export default function Menu({ userId }: { userId: string }) {
  return (
    <div className="flex h-auto w-full lg:w-1/2 items-center justify-between px-2 pb-2">
      <img src="/icon.png" alt="logo" className="h-10 w-10" />
      <h1 className="hidden sm:block text-3xl font-extrabold">TheeWallet</h1>
        <AuthButton userId={userId} />
    </div>
  );
}
