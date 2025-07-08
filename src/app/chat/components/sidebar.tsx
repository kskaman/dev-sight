"use client";

import { api } from "@/app/api/api";
import { logout } from "@/app/api/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OutlineButton } from "@/components/ui/outline-button-wrapper";
import { Chat } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, LogOut, Plus, Search } from "lucide-react";
import { User } from "next-auth";
import { useRouter } from "next/router";

interface Props {
  user: User;
  isMinimized: boolean;
  onMinimize: () => void;
}

export default function Sidebar({ user, isMinimized, onMinimize }: Props) {
  const firstName = user?.name?.split(" ")?.[0] ?? "User";
  const router = useRouter();

  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: () => api.get<Chat[]>("/api/chat"),
  });

  const { mutate: createChat } = useMutation({
    mutationFn: () => api.post<Chat>("/api/chat", { title: "Untitled Chat" }),
    onSuccess: (chat) => {
      router.push(`/chat/${chat.id}`);
    },
  });

  return (
    <aside
      className={`flex h-full
      ${isMinimized ? "w-16" : "w-[300px]"} flex-col border-r bg-white
      border border-gray-200 rounded-lg px-2 py-2`}
    >
      {/* Toggle */}
      <div className={`pb-4 flex flex-row ${isMinimized ? "" : "ml-auto"}`}>
        <OutlineButton onClick={onMinimize}>
          {isMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </OutlineButton>
      </div>

      {/* New chat + search */}
      {!isMinimized && (
        <div className="flex flex-col items-center gap-3">
          <OutlineButton onClick={() => createChat()}>
            <Plus className="h-4 w-4" />
            <span>New chat</span>
          </OutlineButton>
          {/* Search function yet to implement*/}
          <OutlineButton>
            <Search className="h-4 w-4" />
            <span>Search Chat</span>
          </OutlineButton>
        </div>
      )}

      {/* <Separator className="my-4" /> */}

      {/* Conversation list */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto mt-4 space-y-1 pr-2">
          {chats.map((chat) => (
            <OutlineButton
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              {chat.title}
            </OutlineButton>
          ))}
        </div>
      )}

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
