import { api } from "@/app/api/api";
import { useSuspenseQuery } from "@tanstack/react-query";

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
