"use client";

import { useQuery } from "@tanstack/react-query";
import ChatInput from "./chat-input";
import { api } from "@/app/api/api";
import { useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
}

export default function ChatShell({ chatId }: { chatId: string }) {
  const { data: msgs = [] } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => chatId ? api.get<Message[]>(`/api/chats/${chatId}/messages`) : Promise.resolve([]),
    enabled: !!chatId,
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  return (
    <div className="flex flex-col items-center gap-4 flex-1 h-full w-full mt-2">
      <div className="flex flex-col gap-2 w-full md:w-[95%] h-full overflow-y-auto">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`whitespace-pre-wrap rounded-lg p-3 mb-2 ${
              m.role === "USER" ? "bg-primary text-primary-foreground ml-auto max-w-[80%]" : "bg-muted text-muted-foreground max-w-[80%]"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-auto w-full md:w-[95%]">
        <ChatInput />
      </div>
    </div>
  );
}
