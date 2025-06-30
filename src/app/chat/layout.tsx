import { ReactNode } from "react";
import { auth } from "../(auth)/auth";
import { redirect } from "next/navigation";
import ClientShell from "./components/client-shell";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return <ClientShell user={session.user!}>{children}</ClientShell>;
}
