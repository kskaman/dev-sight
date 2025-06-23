"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { redirect } from "next/navigation";

interface Props {
  user?: User;
}

export default function ChatShell({ user }: Props) {
  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-10">
      <p className="font-medium">{user?.name}</p>
      <p className="text-sm text-muted-foreground">{user?.email}</p>

      <Button onClick={() => signOut()} className="mt-2 w-32 cursor-pointer">
        Log out
      </Button>
    </div>
  );
}
