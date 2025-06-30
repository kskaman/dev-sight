"use client";

import { User } from "next-auth";
import ChatInput from "./chat-input";

interface Props {
  user?: User;
}

export default function ChatShell({ user }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 flex-1 h-full w-full mt-2">
      <div className="flex flex-col items-center gap-2 w-full md:w-[95%] h-full">
        <p className="font-medium">{user?.name}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>

        <div className="mt-auto w-full">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
