import { api } from "@/app/api/api";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export type Message = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

export const useMessages = (chatId?: string) =>
  useSuspenseQuery<Message[]>({
    queryKey: ["messages", chatId ?? "none"],
    queryFn: () =>
      chatId
        ? api.get<Message[]>(`/api/chat/${chatId}/messages`)
        : Promise.resolve([]),
  });

let currentAbort: AbortController | null = null;

export const useSendMessage = (chatId?: string) => {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    retry: false,
    /* optimistic */
    onMutate: async (content: string) => {
      await qc.cancelQueries({ queryKey: ["messages", chatId ?? "none"] });

      const tempMsg = {
        id: "tmp-" + Date.now(),
        role: "USER" as const,
        content,
      };
      const placeholder = {
        id: "tmp-ai",
        role: "ASSISTANT" as const,
        content: 'Generating<span class="dots">…</span>',
      };

      const prev =
        qc.getQueryData<Message[]>(["messages", chatId ?? "none"]) ?? [];

      /* write the optimistic list into the cache */
      qc.setQueryData(
        ["messages", chatId ?? "none"],
        [...prev, tempMsg, placeholder]
      );

      /* return context for rollback */
      return { prev };
    },
    /** Create chat lazily → send message → return the (real) chatId */
    mutationFn: async (content: string) => {
      // cancel any earlier run
      currentAbort?.abort();
      const ctrl = new AbortController();
      // remember it
      currentAbort = ctrl;

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
        signal: ctrl.signal,
      });

      if (!resp.ok || !resp.body) throw new Error(resp.statusText);

      /* ⬇️ read stream */
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        assistantText += decoder.decode(value, { stream: true });

        /* replace placeholder immediately */
        qc.setQueryData<Message[]>(["messages", id], (old = []) =>
          old.map((m) =>
            m.id === "tmp-ai" ? { ...m, content: assistantText } : m
          )
        );
      }

      return id;
    },

    onSuccess: (id) => {
      //  refresh caches
      qc.invalidateQueries({ queryKey: ["messages", id] });
      qc.invalidateQueries({ queryKey: ["chats"] });

      if (!chatId) router.replace(`/chat/${id}`);
    },

    onError: (err) => {
      console.error("sendMessage failed:", err);
      if ((err as Error).name === "AbortError") {
        qc.setQueryData<Message[]>(["messages", chatId ?? "none"], (old = []) =>
          old.filter((m) => m.id !== "tmp-ai")
        );
      }
    },
  });
};

export const cancelSendMessage = () => currentAbort?.abort();
