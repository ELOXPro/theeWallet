import { z } from "zod";
import { ObjectId } from "bson";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const transactionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        description: z.string().toLowerCase(),
        amount: z.number(),
        type: z.string(),
        date: z.date(),
        category: z.string(),
        transfer: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.db.accountW.findFirst({
        where: { id: input.accountId },
      });

      if (!account) {
        return { result: "Account not found" };
      }

      if (input.type == "income") {
        await ctx.db.accountW.update({
          where: { id: input.accountId },
          data: {
            balance: account.balance + input.amount,
          },
        });
      } else if (input.type == "expense") {
        await ctx.db.accountW.update({
          where: { id: input.accountId },
          data: {
            balance: account.balance - input.amount,
          },
        });
      } else if (input.type == "transfer" && input.transfer) {
        const deliverAccount = await ctx.db.accountW.findFirst({
          where: { name: input.transfer, userId: account.userId },
        });

        if (!deliverAccount) {
          return { result: "Account not found" };
        }

        await ctx.db.accountW.update({
          where: { id: deliverAccount.id },
          data: {
            balance: deliverAccount.balance + input.amount,
          },
        });

        await ctx.db.accountW.update({
          where: { id: input.accountId },
          data: {
            balance: account.balance - input.amount,
          },
        });
      }

      const createTransaction = await ctx.db.transaction.create({
        data: {
          id: new ObjectId().toHexString(),
          accountId: input.accountId,
          userId: account.userId,
          description: input.description,
          amount: input.amount,
          type: input.type,
          date: input.date,
          category: input.category,
        },
      });

      return createTransaction
        ? { result: "Transaction Created" }
        : { result: "Failed to Create Transaction!" };
    }),

  balances: protectedProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      let expensesBalance = 0;
      let incomesBalance = 0;

      const expenses = input.accountId
        ? await ctx.db.transaction.findMany({
            where: { userId: input.userId, accountId: input.accountId, type: "expense" },
          })
        : await ctx.db.transaction.findMany({
            where: { userId: input.userId, type: "expense" },
          });

      const incomes = input.accountId
        ? await ctx.db.transaction.findMany({
            where: { userId: input.userId, accountId: input.accountId, type: "income" },
          })
        : await ctx.db.transaction.findMany({
            where: { userId: input.userId, type: "income" },
          });

      expenses.forEach((expense) => {
        expensesBalance += expense.amount;
      });

      incomes.forEach((income) => {
        incomesBalance += income.amount;
      });

      return { expensesBalance, incomesBalance };
    }),

  list: protectedProcedure
    .input(
      z.object({
        from: z.date().optional(),
        to: z.date().optional(),
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { from, to, userId } = input;
      let expensesBalance = 0;
      let incomesBalance = 0;

      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId,
          AND: [
            from ? { date: { gte: from } } : {},
            to ? { date: { lte: to } } : {},
          ],
        },
        orderBy: { date: "desc" },
      });

      transactions.forEach((transaction) => {
        if (transaction.type === "expense") {
          expensesBalance += transaction.amount;
        } else if (transaction.type === "income") {
          incomesBalance += transaction.amount;
        }
      });

      return { transactions, expensesBalance, incomesBalance };
    }),

  load: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const transaction = await ctx.db.transaction.findFirst({
      where: { id: input },
    });

    return transaction;
  }),

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        accountId: z.string(),
        description: z.string(),
        amount: z.number(),
        type: z.string(),
        date: z.date(),
        category: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingTransaction = await ctx.db.transaction.findFirst({
        where: { id: input.id },
      });

      if (!existingTransaction) {
        return { result: "Transaction not found" };
      }

      const account = await ctx.db.accountW.findFirst({
        where: { id: input.accountId },
      });

      if (!account) {
        return { result: "Account not found" };
      }

      // Update balance logic
      if (input.amount && input.type && input.amount !== existingTransaction.amount) {
        const amountDifference = input.amount - existingTransaction.amount;

        if (input.type === "income") {
          await ctx.db.accountW.update({
            where: { id: input.accountId },
            data: { balance: account.balance + amountDifference },
          });
        } else if (input.type === "expense") {
          await ctx.db.accountW.update({
            where: { id: input.accountId },
            data: { balance: account.balance - amountDifference },
          });
        }
      }

      const updatedTransaction = await ctx.db.transaction.update({
        where: { id: input.id },
        data: {
          description: input.description,
          amount: input.amount,
          type: input.type,
          date: input.date,
          category: input.category,
        },
      });

      return updatedTransaction
        ? { result: "Transaction Updated" }
        : { result: "Failed to Update Transaction!" };
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const transaction = await ctx.db.transaction.findFirst({
        where: { id: input },
      });

      if (!transaction) {
        return { result: "Transaction not found" };
      }

      const account = await ctx.db.accountW.findFirst({
        where: { id: transaction.accountId },
      });

      if (!account) {
        return { result: "Account not found" };
      }

      // Update balance on delete
      if (transaction.type === "income") {
        await ctx.db.accountW.update({
          where: { id: transaction.accountId },
          data: { balance: account.balance - transaction.amount },
        });
      } else if (transaction.type === "expense") {
        await ctx.db.accountW.update({
          where: { id: transaction.accountId },
          data: { balance: account.balance + transaction.amount },
        });
      }

      const deletedTransaction = await ctx.db.transaction.delete({
        where: { id: input },
      });

      return deletedTransaction
        ? { result: "Transaction Deleted" }
        : { result: "Failed to Delete Transaction!" };
    }),
});
