"use client";

import { useSendMessage } from "@/app/queries/messages";
import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputButton,
  AIInputTools,
  AIInputSubmit,
} from "@/components/ui/shadcn-io/input-ai";
import { PaperclipIcon, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEventHandler } from "react";

export default function ChatInput({ chatId }: { chatId?: string }) {
  const router = useRouter();
  const send = useSendMessage(chatId);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get("message");

    if (!message || typeof message !== "string" || !message.trim()) return;

    // Handle form submission
    send.mutate(message.trim(), {
      onSuccess: (id) => {
        // navigate only when needed
        if (!chatId) router.replace(`/chat/${id}`);
      },
    });

    // Reset the form
    event.currentTarget.reset();
  };

  return (
    <div className="w-full">
      <AIInput onSubmit={handleSubmit}>
        <AIInputTextarea placeholder="Ask anything..." />
        <AIInputToolbar>
          <AIInputTools>
            <AIInputButton>
              <PaperclipIcon size={16} />
            </AIInputButton>
          </AIInputTools>
          <AIInputSubmit>
            <SendIcon size={16} />
          </AIInputSubmit>
        </AIInputToolbar>
      </AIInput>
    </div>
  );
}
