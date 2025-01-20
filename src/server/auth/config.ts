import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";

type User = {
  id: string;
  name: string;
  email: string;
}

const adapter = PrismaAdapter(db);

export const authConfig = {
  adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/signin',
    error: '/signin'
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { label: "userId", type: "text" }
      },
      async authorize(credentials) {
        if (credentials?.id) {
          const user = await db.user.findFirst({
            where: { id: credentials.id },
          });
          
          if (user) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
              };
          } else {
            throw new Error("User not found");
          }
        }
        throw new Error("Credentials not provided");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userdata = user as User;

      if (user) {
        token.sub = userdata.id
        token.email = userdata.email
        token.name = userdata.name
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          email: token.email,
          name: token.name,
        },
      }
    }
    
  },
} satisfies NextAuthConfig;
