import { auth } from "@/server/auth"; // Authentication function
import { HydrateClient } from "@/trpc/server"; // TRPC Hydration Provider
import Menu from "@/components/Menu"; // Navigation Menu
import Overview from "@/components/dashboard/Overview"; // Overview Component
import { redirect } from "next/navigation"; // Next.js navigation
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
        {/* Navigation Menu */}
        <Menu />

        {/* Dashboard Layout */}
        <div className="grid h-1/2 w-full grid-cols-1 lg:grid-cols-10 items-center justify-center gap-y-2 gap-x-0 md:gap-4">
          <Overview userId={userId} />
          <Budgets userId={userId} />
          <Account userId={userId} name={userName} />
        </div>

        {/* Transaction History */}
        <History userId={userId} />

        {/* Footer */}
        <div className="flex w-full justify-center items-center text-xs gap-1 font-bold">
          Created by{" "}
          <a href="https://eloxpro.netlify.app" className="text-blue-500">
            ELOXPro
          </a>
        </div>
      </main>
    </HydrateClient>
  );
}
