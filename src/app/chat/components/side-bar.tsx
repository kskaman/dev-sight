"use client";

import { logout } from "@/app/api/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  SquarePen,
  Search,
} from "lucide-react";
import { User } from "next-auth";
import ChatItem from "./sidebar-chat-item";
import { useChats, useCreateChat } from "@/app/queries/chat";

interface Props {
  user: User;
  isMinimized: boolean;
  onMinimize: () => void;
}

export default function Sidebar({ user, isMinimized, onMinimize }: Props) {
  const firstName = user?.name?.split(" ")?.[0] ?? "User";

  const { data: chats = [] } = useChats();

  const { mutate: createChat } = useCreateChat();

  return (
    <aside
      className={`flex h-full
      ${isMinimized ? "w-16" : "w-[300px]"} flex-col border-r bg-card
      border border-border rounded-lg px-2 py-2`}
    >
      {/* Toggle */}
      <div
        className={`pb-4 flex flex-row ${
          isMinimized ? "justify-center" : "justify-end"
        }`}
      >
        <Button
          onClick={onMinimize}
          variant="outline"
          className="w-10 h-10 p-0 rounded-full cursor-pointer flex items-center justify-center"
        >
          {isMinimized ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* New chat + search */}
      {!isMinimized && (
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => createChat()}
            variant="outline"
            className={`w-full rounded-full px-4 py-2 text-sm 
              font-normal cursor-pointer flex items-center  ${
                isMinimized ? "w-10 h-10 p-0 justify-center" : ""
              }`}
          >
            <SquarePen className="h-4 w-4" />
            <span>New chat</span>
          </Button>
          {/* Search function yet to implement*/}
          <Button
            variant="outline"
            className={`w-full rounded-full px-4 py-2 text-sm 
              font-normal cursor-pointer flex items-center ${
                isMinimized ? "w-10 h-10 p-0 justify-center" : ""
              }`}
          >
            <Search className="h-4 w-4" />
            <span>Search Chat</span>
          </Button>
        </div>
      )}

      {/* <Separator className="my-4" /> */}

      {/* Conversation list */}
      {!isMinimized && (
        <ScrollArea
          className="flex-1 my-4 p-2 h-5 border 
        border-gray-300 rounded-[20px]"
        >
          <div className="space-y-1">
            {chats.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center justify-between gap-3">
        <Button
          onClick={logout}
          variant="outline"
          className={`w-full rounded-full px-4 py-2 text-sm 
            font-normal cursor-pointer flex items-center justify-center ${
              isMinimized ? "w-10 h-10 p-0" : ""
            }`}
        >
          <LogOut className="h-4 w-4 rotate-180" />
          {!isMinimized && "Log Out"}
        </Button>

        <Button
          variant="outline"
          className={`w-full rounded-full px-4 py-2 text-sm 
            font-normal cursor-pointer flex items-center justify-center ${
              isMinimized ? "w-10 h-10 p-0" : ""
            }`}
        >
          <Avatar className="h-4 w-4">
            <AvatarImage src={user?.image ?? ""} alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          {!isMinimized && firstName}
        </Button>
      </div>
    </aside>
  );
}
