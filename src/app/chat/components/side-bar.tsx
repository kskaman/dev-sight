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
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  user: User;
  isMinimized: boolean;
  onMinimize: () => void;
}

export default function Sidebar({ user, isMinimized, onMinimize }: Props) {
  const [search, setSearch] = useState<string>("");

  const firstName = user?.name?.split(" ")?.[0] ?? "User";

  const { data: chats = [] } = useChats();

  const createChat = useCreateChat();
  const router = useRouter();

  const filteredChats = chats.filter((chat) =>
    chat.title.trim().toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <aside
      className={`flex h-[100vh-28px]
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
            onClick={() => {
              createChat.mutate(undefined, {
                onSuccess: (chat) => router.replace(`/chat/${chat.id}`),
              });
            }}
            variant="outline"
            className={`w-full rounded-full px-4 py-2 text-sm 
              font-normal cursor-pointer flex items-center  ${
                isMinimized ? "w-10 h-10 p-0 justify-center" : "justify-start"
              }`}
          >
            <SquarePen className="h-4 w-4" />
            <span>New chat</span>
          </Button>
          {/* Search chat function*/}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="pl-10 pr-4 py-2 w-full rounded-full border text-sm bg-background border-border focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* <Separator className="my-4" /> */}

      {/* Conversation list */}
      {!isMinimized && (
        <ScrollArea
          className="flex-1 my-4 px-2 py-3 h-5 border 
        border-gray-300 rounded-[20px]"
        >
          {filteredChats.length === 0 ? (
            <div className="h-full mx-4 flex items-center justify-start text-sm text-muted-foreground">
              No chats to show
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center justify-between gap-3">
        <Button
          onClick={logout}
          variant="outline"
          className={`w-full rounded-full px-4 py-2 text-sm 
            font-normal cursor-pointer flex items-center ${
              isMinimized ? "w-10 h-10 p-0 justify-center" : "justify-start"
            }`}
        >
          <LogOut className="h-4 w-4 rotate-180" />
          {!isMinimized && "Log Out"}
        </Button>

        <Button
          variant="outline"
          className={`w-full rounded-full px-4 py-2 text-sm 
            font-normal cursor-pointer flex items-center ${
              isMinimized ? "w-10 h-10 p-0 justify-center" : "justify-start"
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
