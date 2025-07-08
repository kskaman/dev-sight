"use client";

import { api } from "@/app/api/api";
import { logout } from "@/app/api/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, LogOut, SquarePen, Search } from "lucide-react";
import { User } from "next-auth";
import { useRouter } from "next/navigation";

type Chat = {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

interface Props {
  user: User;
  isMinimized: boolean;
  onMinimize: () => void;
}

export default function Sidebar({ user, isMinimized, onMinimize }: Props) {
  const firstName = user?.name?.split(" ")?.[0] ?? "User";
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: () => api.get<Chat[]>("/api/chats"),
  });

  const { mutate: createChat } = useMutation({
    mutationFn: () => api.post<Chat>("/api/chats", { title: "Untitled Chat" }),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.push(`/chat/${chat.id}`);
    },
  });

  return (
    <aside
      className={`flex h-full
      ${isMinimized ? "w-16" : "w-[300px]"} flex-col border-r bg-card
      border border-border rounded-lg px-2 py-2`}
    >
      {/* Toggle */}
      <div className={`pb-4 flex flex-row ${isMinimized ? "justify-center" : "justify-end"}`}>
        <Button
          onClick={onMinimize}
          variant="outline"
          className="w-10 h-10 p-0 rounded-full cursor-pointer flex items-center justify-center"
        >
          {isMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* New chat + search */}
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={() => createChat()}
          variant="outline"
          className={`w-full rounded-full px-4 py-2 text-sm font-normal cursor-pointer flex items-center justify-center ${
            isMinimized ? "w-10 h-10 p-0" : ""
          }`}
        >
          <SquarePen className="h-4 w-4" />
          {!isMinimized && <span>New chat</span>}
        </Button>
        {/* Search function yet to implement*/}
        <Button
          variant="outline"
          className={`w-full rounded-full px-4 py-2 text-sm font-normal cursor-pointer flex items-center justify-center ${
            isMinimized ? "w-10 h-10 p-0" : ""
          }`}
        >
          <Search className="h-4 w-4" />
          {!isMinimized && <span>Search Chat</span>}
        </Button>
      </div>

      {/* <Separator className="my-4" /> */}

      {/* Conversation list */}
      {!isMinimized && (
        <ScrollArea className="flex-1 mt-4 pr-2">
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors truncate"
              >
                {chat.title}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center justify-between gap-3">
        <Button
          onClick={logout}
          variant="outline"
          className={`w-full rounded-full px-4 py-2 text-sm font-normal cursor-pointer flex items-center justify-center ${
            isMinimized ? "w-10 h-10 p-0" : ""
          }`}
        >
          <LogOut className="h-4 w-4 rotate-180" />
          {!isMinimized && "Log Out"}
        </Button>

        <Button
          variant="outline"
          className={`w-full rounded-full px-4 py-2 text-sm font-normal cursor-pointer flex items-center justify-center ${
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
