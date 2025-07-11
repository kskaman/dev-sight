import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    // 1) add the DB id to the JWT once (at sign-in)
    async jwt({ token, user }) {
      if (user) token.id = user.id; // user param only on sign-in
      return token;
    },
    // 2) expose that id on the session object we get via auth()
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token.id ?? token.sub) as string, // token.sub = user.id by default
      };
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        return u.origin === baseUrl ? url : baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },
});
