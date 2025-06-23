"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OutlineButton } from "@/components/ui/outline-button-wrapper";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { User } from "next-auth";
import { useState } from "react";

interface Props {
  user?: User;
}

export default function Sidebar({ user }: Props) {
  const firstName = user?.name?.split(" ")?.[0] ?? "User";
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  return (
    <aside
      className={`flex h-[calc(100%-32px)] max-w-[15%]
      ${isMinimized ? "w-16" : "w-[300px]"} flex-col border-r bg-white
      border border-gray-200 mx-4 my-4 rounded-lg px-2 py-2`}
    >
      {/* Logo + Toggle */}
      <div className="py-5 flex flex-row justify-between">
        {!isMinimized && (
          <h1 className="text-2xl font-bold tracking-wide mx-auto">devSight</h1>
        )}
        <Button
          variant="outline"
          onClick={() => setIsMinimized((prev) => !prev)}
          className="rounded-full p-2 cursor-pointer"
        >
          {isMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* New chat + search */}
      <div className="flex flex-col items-center gap-3">
        <OutlineButton>
          <Plus className="h-4 w-4" />
          {!isMinimized && "New chat"}
        </OutlineButton>
        <OutlineButton>
          <Search className="h-4 w-4" />
          {!isMinimized && "Search Chat"}
        </OutlineButton>
      </div>

      {/* <Separator className="my-4" /> */}

      {/* Conversation list */}
      {/* <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-2 pr-2">
            {chats.map((chat) => (
              <OutlineButton
                key={chat.id}
                
              >
                {chat.title}
              </OutlineButton>
            ))}
          </div>
        </ScrollArea> */}

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center justify-between gap-3 ">
        <OutlineButton>
          <Settings className="h-4 w-4" />
          {!isMinimized && "Settings"}
        </OutlineButton>

        <OutlineButton>
          <Avatar className="h-4 w-4">
            <AvatarImage src={user?.image ?? ""} alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          {!isMinimized && firstName}
        </OutlineButton>
      </div>
    </aside>
  );
}
