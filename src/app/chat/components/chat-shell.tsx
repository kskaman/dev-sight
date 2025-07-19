"use client";

import ChatInput from "./chat-input";
import { useEffect, useRef } from "react";
import { useMessages } from "@/app/queries/messages";

export default function ChatShell({ chatId }: { chatId?: string }) {
  const { data: msgs = [] } = useMessages(chatId);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  return (
    <div className="flex flex-col items-center gap-4 flex-1 w-full mt-2">
      <div className="flex flex-col gap-2 w-full md:w-[95%] h-full overflow-y-auto">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`whitespace-pre-wrap rounded-lg py-2 px-3 mb-2 rounded-xl ${
              m.role === "USER"
                ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                : "bg-muted text-muted-foreground max-w-[80%]"
            }`}
          >
            {m.id.startsWith("tmp-ai") ? (
              /* animated indicator for the placeholder */
              <span>
                Generating
                <span className="typing-dots">
                  <span className="dot1" />
                  <span className="dot2" />
                  <span className="dot3" />
                </span>
              </span>
            ) : (
              m.content
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="mt-auto w-full md:w-[95%]">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
}
