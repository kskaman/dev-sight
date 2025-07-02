import { ReactNode } from "react";
import { auth } from "../(auth)/auth";
import ClientShell from "./components/client-shell";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return <ClientShell user={session!.user!}>{children}</ClientShell>;
}
