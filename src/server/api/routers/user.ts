import { z } from "zod";
import { ObjectId } from "bson";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        email: z.string(),
        username: z.string().toLowerCase(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findFirst({
        where: { email: input.email },
      });

      if (existingUser) {
        return { result: "User already exists" };
      }

      const createWallet = await ctx.db.user.create({
        data: {
          id: new ObjectId().toHexString(), // Generate a valid ObjectId
          name: input.username,
          email: input.email,
          password: input.password,
        },
      });

      return createWallet
        ? { result: "Wallet Created", user: createWallet.id }
        : { result: "Failed to Create Wallet!" };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { email: input.email },
      });

      if (!user) {
        return { result: "User not found" };
      }

      const isPasswordCorrect = input.password === user.password;

      if (isPasswordCorrect) {
        return { result: "Logged in", user: user.id };
      } else {
        return { result: "Invalid Password" };
      }
    }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().toLowerCase(),
        userId: z.string(),
        type: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingCategory = await ctx.db.category.findFirst({
        where: { name: input.name },
      });

      if (existingCategory) {
        return { result: "Category already exists" };
      }

      const createCategory = await ctx.db.category.create({
        data: {
          id: new ObjectId().toHexString(),
          userId: input.userId,
          name: input.name,
          type: input.type,
        },
      });

      return createCategory
        ? { result: "Category Created" }
        : { result: "Failed to Create Category!" };
    }),

  listCategories: protectedProcedure.input(z.object({
    type: z.string(),
    userId: z.string(),
  }),).query(async ({ ctx, input }) => {
    const categories = await ctx.db.category.findMany({
      where: { userId: input.userId, type: input.type },
    });

    return categories;
  }),
});
