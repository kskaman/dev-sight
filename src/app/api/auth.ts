import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../lib/prisma";


export const { auth, handlers, signIn, signOut } = NextAuth({
  
  providers: [GitHub({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
  })
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    redirect({ url, baseUrl }) {
      // `url` is what signIn() passed in (if any)
      return url ?? `${baseUrl}/`;
    },
  },
});