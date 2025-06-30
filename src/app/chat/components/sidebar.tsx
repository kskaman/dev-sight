"use client";

import { logout } from "@/app/(auth)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OutlineButton } from "@/components/ui/outline-button-wrapper";
import { ChevronLeft, ChevronRight, LogOut, Plus, Search } from "lucide-react";
import { User } from "next-auth";
import Image from "next/image";
import logoSrc from "../../../../public/logo.png";

interface Props {
  user: User;
  isMinimized: boolean;
  onMinimize: () => void;
}

export default function Sidebar({ user, isMinimized, onMinimize }: Props) {
  const firstName = user?.name?.split(" ")?.[0] ?? "User";

  return (
    <aside
      className={`flex h-full
      ${isMinimized ? "w-16" : "w-[300px]"} flex-col border-r bg-white
      border border-gray-200 rounded-lg px-2 py-2`}
    >
      {/* Toggle */}
      <div className="pb-4 flex flex-row justify-between">
        {!isMinimized && (
          <div>
            <Image src={logoSrc} alt={"devSight logo"} width={40} />
          </div>
        )}
        <Button
          variant="outline"
          onClick={onMinimize}
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
      <div className="mt-auto flex flex-col items-center justify-between gap-3">
        <OutlineButton onClick={logout}>
          <LogOut className="h-4 w-4 rotate-180" />
          {!isMinimized && "Log Out"}
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
