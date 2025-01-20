import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { accountRouter } from "./routers/account";
import { transactionRouter } from "./routers/transaction";

export const appRouter = createTRPCRouter({
  user: userRouter,
  account: accountRouter,
  transaction: transactionRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
