"use client";

import { FormEvent, useEffect, useRef } from "react";
import { useMessages } from "@/app/queries/messages";
import { useChat } from "@ai-sdk/react";

import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputButton,
  AIInputTools,
  AIInputSubmit,
} from "@/components/ui/shadcn-io/input-ai";
import { PaperclipIcon, SendIcon, XIcon } from "lucide-react";

export default function ChatShell({ chatId }: { chatId?: string }) {
  const hasReplaced = useRef(false); // guard so we do it once

  const { data: msgs = [] } = useMessages(chatId);

  const { id, messages, input, handleInputChange, handleSubmit, stop, status } =
    useChat({
      id: chatId,
      api: "/api/chat/ai",
      initialMessages: msgs.map((m) => ({
        ...m,
        role:
          m.role === "USER"
            ? "user"
            : m.role === "ASSISTANT"
            ? "assistant"
            : m.role === "SYSTEM"
            ? "system"
            : m.role,
      })),
    });

  /* 🔹 once the real id arrives, patch the URL bar without navigation */
  useEffect(() => {
    if (!chatId && id && !hasReplaced.current) {
      window.history.replaceState(null, "", `/chat/${id}`);
      hasReplaced.current = true;
    }
  }, [chatId, id]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sending = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col items-center gap-4 flex-1 h-full w-full mt-2 overflow-hidden">
      <div className="flex flex-col gap-2 w-full md:w-[95%] h-full overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`whitespace-pre-wrap rounded-lg py-2 px-3 mb-2 rounded-xl ${
              m.role === "user"
                ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                : "bg-muted text-muted-foreground max-w-[80%]"
            }`}
          >
            {m.content}
          </div>
        ))}

        {status === "submitted" && (
          <div
            className={`whitespace-pre-wrap rounded-lg py-2 px-3 mb-2 rounded-xl
          bg-muted text-muted-foreground max-w-[80%]`}
          >
            <span>
              Generating
              <span className="typing-dots">
                <span className="dot1" />
                <span className="dot2" />
                <span className="dot3" />
              </span>
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-auto w-full md:w-[95%]">
        <div className="w-full">
          <AIInput onSubmit={handleSubmit}>
            <AIInputTextarea
              aria-label="Message input"
              placeholder="Ask anything..."
              name="message"
              value={input}
              onChange={handleInputChange}
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey) return;
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                }
              }}
            />

            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton type="button">
                  <PaperclipIcon size={16} />
                </AIInputButton>
              </AIInputTools>

              {sending ? (
                /* “Stop generating” button */
                <AIInputButton
                  type="button"
                  onClick={stop}
                  className="cursor-pointer"
                >
                  <XIcon size={16} />
                </AIInputButton>
              ) : (
                /* normal send */
                <AIInputSubmit
                  disabled={!input.trim()}
                  className="cursor-pointer"
                >
                  <SendIcon size={16} />
                </AIInputSubmit>
              )}
            </AIInputToolbar>
          </AIInput>
        </div>
      </div>
    </div>
  );
}
