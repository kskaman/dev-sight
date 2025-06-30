"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatInput() {
  const [input, setInput] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  return (
    <form className="w-full">
      <div
        className="w-full bg-white rounded-[24px] border border-gray-300 
          gap-0"
      >
        <textarea
          ref={textAreaRef}
          value={input}
          onChange={handleInputChange}
          rows={1}
          placeholder="Ask anything"
          className="block w-full px-3 pt-3  rounded-[24px] 
          focus:outline-none text-[14px]
          max-h-[160px] overflow-y-auto resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!input.trim()}
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
