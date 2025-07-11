"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatInput({ chatId }: { chatId: string }) {
  const [input, setInput] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  const { mutate: send, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const resp = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      const reader = resp.body!.getReader();
      let assistant = "";
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value);
      }
      return assistant;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", chatId] });
      setInput("");
      if (textAreaRef.current) {
        textAreaRef.current.value = "";
        textAreaRef.current.style.height = "auto";
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div
        className="w-full bg-white rounded-[24px] border border-gray-300 
          gap-0"
      >
        <textarea
          ref={textAreaRef}
          value={input}
          onChange={handleInputChange}
          rows={1}
          placeholder="Ask ..."
          className="block w-full px-3 pt-3  rounded-[24px] 
          focus:outline-none text-[14px]
          max-h-[160px] overflow-y-auto resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="m-[6px] rounded-full w-8 h-8 bg-neutral-900 
                      text-white flex items-center justify-center
          disabled:opacity-50 cursor-pointer"
          >
            <ArrowUp size={"18px"} className="text-normal" />
          </button>
        </div>
      </div>
    </form>
  );
}
