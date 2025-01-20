import { date, z } from "zod";
import { ObjectId } from "bson";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { start } from "repl";

export const accountRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().toLowerCase(),
        balance: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingAccount = await ctx.db.accountW.findFirst({
        where: { name: input.name, userId: input.userId },
      });

      if (existingAccount) {
        return { result: "Account already exists" };
      }

      const createAccount = await ctx.db.accountW.create({
        data: {
          id: new ObjectId().toHexString(),
          userId: input.userId,
          name: input.name,
          balance: input.balance,
        },
      });

      return createAccount
        ? { result: "Account Created" }
        : { result: "Failed to Create Account!" };
    }),

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().toLowerCase(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingAccount = await ctx.db.accountW.findFirst({
        where: { name: input.name },
      });

      if (existingAccount) {
        return { result: "Account already exists" };
      }

      const editAccount = await ctx.db.accountW.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      });

      return editAccount
        ? { result: "Account Updated" }
        : { result: "Failed to update Account!" };
    }),

  list: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const accounts = await ctx.db.accountW.findMany({
      where: { userId: input },
    });

    return accounts;
  }),

  balance: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let balance = 0;
      if (input.id === "all") {
        const accounts = await ctx.db.accountW.findMany({
          where: { userId: input.userId },
        });
        accounts.map((account) => {
          return (balance += account.balance);
        });
        return balance;
      }

      const account = await ctx.db.accountW.findFirst({
        where: { userId: input.userId, id: input.id },
      });

      balance = account ? account.balance : 0;

      return balance;
    }),

  createBudget: protectedProcedure
    .input(
      z.object({
        name: z.string().toLowerCase(),
        amount: z.number(),
        userId: z.string(),
        category: z.string(),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const createBudget = await ctx.db.budget.create({
        data: {
          id: new ObjectId().toHexString(),
          userId: input.userId,
          name: input.name,
          amount: input.amount,
          category: input.category,
          startDate: input.date,
        },
      });

      return createBudget
        ? { result: "Budget Created" }
        : { result: "Failed to Create Budget!" };
    }),

  updateBudget: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        amount: z.number(),
        category: z.string(),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateBudget = await ctx.db.budget.update({
        where: { id: input.id },
        data: {
          name: input.name,
          amount: input.amount,
          category: input.category,
          startDate: input.date,
        },
      });

      return updateBudget
        ? { result: "Budget Updated" }
        : { result: "Failed to update Budget!" };
    }),
  loadBudget: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      let used = 0;

      const budget = await ctx.db.budget.findFirst({
        where: { id: input },
      });

      if (!budget) {
        return { result: "Budget not found" };
      }

      const transactions = await ctx.db.transaction.findMany({
        where: {
          category: budget.category,
          userId: budget.userId,
          date: {
            gte: budget.startDate,
          },
        },
      });

      transactions.forEach((transaction) => {
        used += transaction.amount;
      });

      return {
        budget,
        used,
      };
    }),

  deleteBudget: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const deleteBudget = await ctx.db.budget.delete({
        where: { id: input },
      });
      return deleteBudget ? { result: "Budget Deleted" } : { result: "Failed to delete Budget!" };
    }),
  listBudget: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const preBudgets = await ctx.db.budget.findMany({
        where: { userId: input },
      });

      const budgets = await Promise.all(
        preBudgets.map(async (budget) => {
          let used = 0;

          const budgets = await ctx.db.budget.findFirst({
            where: { id: budget.id },
          });

          if (!budgets) {
            return { result: "Budget not found" };
          }

          const transactions = await ctx.db.transaction.findMany({
            where: {
              category: budget.category,
              userId: budgets.userId,
              date: {
                gte: budgets.startDate,
              },
            },
          });

          transactions.forEach((transaction) => {
            used += transaction.amount;
          });

          return {
            data: budgets,
            used,
          };
        }),
      );
      return budgets;
    }),
});
