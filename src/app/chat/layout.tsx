import { ReactNode } from "react";
import { auth } from "../api/auth/auth";
import ClientShell from "./components/client-shell";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../../lib/query-client";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <QueryClientProvider client={queryClient}>
      <ClientShell user={session!.user!}>{children}</ClientShell>;
    </QueryClientProvider>
  );
}
