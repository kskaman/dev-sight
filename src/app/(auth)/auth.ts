import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
// import { PrismaClient } from "@prisma/client";
// import { PrismaAdapter } from "@auth/prisma-adapter";

// const prisma = new PrismaClient();

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
  })
  ],
  // adapter: PrismaAdapter(prisma),
  callbacks: {
    redirect({ url, baseUrl }) {
      // `url` is what signIn() passed in (if any)
      return url ?? `${baseUrl}/chat`;
    },
  },
});