'use server';

import { signIn, signOut } from "@/app/(auth)/auth";

export const login = async () => {
  await signIn("github", { redirectTo: "/chat" });
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};