import { ReactNode } from "react";
import { auth } from "../api/auth/auth";
import ClientShell from "./components/client-shell";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <ClientShell user={session.user}>{children}</ClientShell>;
}
