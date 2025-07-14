import { api } from "@/app/api/api";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useMessageStore } from "../../../lib/store/message-store";
import { useRouter } from "next/navigation";

export type Message = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

export const useMessages = (chatId?: string) =>
  useSuspenseQuery({
    queryKey: ["messages", chatId ?? "none"],
    queryFn: () =>
      chatId
        ? api.get<Message[]>(`/api/chat/${chatId}/messages`)
        : Promise.resolve([]),
  });

export const useSendMessage = (chatId?: string) => {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    /** Create chat lazily → send message → return the (real) chatId */
    mutationFn: async (content: string) => {
      // lazy-create chat if none yet
      let id = chatId;
      if (!id) {
        const chat = await api.post<{ id: string }>("/api/chat", {
          title: "Untitled Chat",
        });
        id = chat.id;
      }

      //  post user msg & stream assistant
      const resp = await fetch(`/api/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();

      const setTemp = useMessageStore.getState().setTempMessage;
      const resetTemp = useMessageStore.getState().resetTemp;

      let fullContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setTemp(fullContent);
      }

      resetTemp();
      return id; // pass id to onSuccess
    },

    onSuccess: (id) => {
      //  refresh caches
      qc.invalidateQueries({ queryKey: ["messages", id] });
      qc.invalidateQueries({ queryKey: ["chats"] });

      if (!chatId) router.replace(`/chat/${id}`);
    },
  });
};
