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

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().toLowerCase(),
        email: z.string(),
        oldpass: z.string(),
        newpass: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findFirst({
        where: { email: input.email },
      });



      const user = await ctx.db.user.findFirst({
        where: { id: input.id },
      });

      if (!user) {
        return { result: "User not found" };
      }

      if (existingUser && (existingUser.email !== user.email)) {
        return { result: "Email already exists" };
      }

      if (input.newpass) {
        const isPasswordCorrect = input.oldpass === user.password;

        if (!isPasswordCorrect) {
          return { result: "Invalid Password" };
        }
        await ctx.db.user.update({
          where: { id: input.id },
          data: {
            password: input.newpass,
          },
        });
      }

      const editUser = await ctx.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
        },
      });

      return editUser
        ? { result: "User Updated" }
        : { result: "Failed to update User!" };
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: input },
      });

      if (!user) {
        return { result: "User not found" };
      }

      const deleteUser = await ctx.db.user.delete({
        where: { id: input },
      });

      return deleteUser
        ? { result: "Wallet Terminated" }
        : { result: "Failed to terminate Wallet!" };
    }),

  load: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findFirst({
      where: { id: input },
    });

    if (!user) {
      return null;
    }

    user.password = "";

    return user;
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

  listCategories: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: { userId: input.userId, type: input.type },
      });

      return categories;
    }),

  loadCategory: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: { id: input },
      });

      return category;
    }),

  editCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().toLowerCase(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingCategory = await ctx.db.category.findFirst({
        where: { name: input.name },
      });

      if (existingCategory) {
        return { result: "Category already exists" };
      }

      const category = await ctx.db.category.findFirst({
        where: { id: input.id },
      });

      if (!category) {
        return { result: "Category not found" };
      }

      const updateTransactions = await ctx.db.transaction.updateMany({
        where: { category: category.name },
        data: {
          category: input.name,
        },
      });

      const editCategory = await ctx.db.category.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      });

      return editCategory && updateTransactions
        ? { result: "Category Updated" }
        : { result: "Failed to update Category!" };
    }),

  deleteCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: { id: input },
      });

      if (!category) {
        return { result: "Category not found" };
      }

      const updateTransactions = await ctx.db.transaction.updateMany({
        where: { category: category.name },
        data: {
          category: "Uncategorized",
        },
      });

      const deleteCategory = await ctx.db.category.delete({
        where: { id: input },
      });

      return deleteCategory && updateTransactions
        ? { result: "Category Deleted" }
        : { result: "Failed to delete Category!" };
    }),
});
