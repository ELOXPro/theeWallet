import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import Menu from "@/components/Menu";
import Overview from "@/components/dashboard/Overview"; // Overview Component
import { redirect } from "next/navigation";
import Budgets from "@/components/dashboard/Budgets"; // Budgets Component
import Account from "@/components/dashboard/Account"; // Account Component
import History from "@/components/dashboard/History"; // History Component

export default async function Home() {
  // Authenticate the user
  const session = await auth();

  // Redirect to sign-in if no session or user is found
  if (!session?.user?.id || !session.user.name) {
    redirect("/signin");
    return;
  }

  // Extract user details
  const { id: userId, name: userName } = session.user;

  return (
    <HydrateClient>
      <main className="flex flex-col items-center justify-center p-2">
        <Menu userId={userId} />
        <div className="grid h-1/2 w-full grid-cols-1 items-center justify-center gap-2 lg:grid-cols-10">
          <Account userId={userId} name={userName} />
          <Overview userId={userId} />
          <Budgets userId={userId} />
        </div>

        {/* Transaction History */}
        <History userId={userId} />

        <div className="flex w-full items-center justify-center gap-1 text-xs font-bold">
          Developed by{" "}
          <a href="https://elox.vercel.app" className="text-red-500">
            ELOX
          </a>
        </div>
      </main>
    </HydrateClient>
  );
}
