"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { redirect } from "next/navigation";

interface Props {
  user?: User;
}

export default function ChatShell({ user }: Props) {
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-10">
      {user?.image && (
        <Image
          src={user.image}
          alt={user.name ?? "Avatar"}
          width={64}
          height={64}
          className="rounded-full"
        />
      )}
      <p className="font-medium">{user?.name}</p>
      <p className="text-sm text-muted-foreground">{user?.email}</p>

      <Button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-2 w-32"
      >
        Log out
      </Button>
    </div>
  );
}
