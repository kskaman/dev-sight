"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cancelSendMessage, useSendMessage } from "@/app/queries/messages";

import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputButton,
  AIInputTools,
  AIInputSubmit,
} from "@/components/ui/shadcn-io/input-ai";
import { PaperclipIcon, SendIcon, XIcon } from "lucide-react";

export default function ChatInput({ chatId }: { chatId?: string }) {
  const router = useRouter();
  const send = useSendMessage(chatId);
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;

    send.mutate(msg, {
      onSuccess: (id) => {
        // navigate to newly-created chat on first message
        if (!chatId) router.replace(`/chat/${id}`);
      },
    });
    setText("");
  };

  return (
    <div className="w-full">
      <AIInput onSubmit={handleSubmit}>
        <AIInputTextarea
          placeholder="Ask anything..."
          name="message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={send.isPending}
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

          {send.isPending ? (
            /* “Stop generating” button */
            <AIInputButton
              type="button"
              onClick={() => {
                cancelSendMessage(); // abort fetch
                send.reset(); // reset React-Query mutation
              }}
              className="cursor-pointer"
            >
              <XIcon size={16} />
            </AIInputButton>
          ) : (
            /* normal send */
            <AIInputSubmit disabled={!text.trim()} className="cursor-pointer">
              <SendIcon size={16} />
            </AIInputSubmit>
          )}
        </AIInputToolbar>
      </AIInput>
    </div>
  );
}
