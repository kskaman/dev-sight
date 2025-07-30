import { api } from "@/app/api/api";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export type Chat = {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export const useChats = () =>
  useSuspenseQuery({
    queryKey: ["chats"],
    queryFn: () => api.get<Chat[]>("/api/chat"),
  });

export const useCreateChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<Chat>("/api/chat", { title: "Untitled Chat" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });
};

export const useUpdateChat = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) =>
      api.patch<Chat>(`/api/chat/${id}`, { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });
};

export const useDeleteChat = (chatId: string) => {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: () => api.del(`/api/chat/${chatId}`),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chats"] });
      // if user was viewing the deleted chat → go to blank shell
      setTimeout(() => {
        if (pathname === `/chat/${chatId}`) {
          router.replace("/chat");
        }
      }, 50);
    },
  });
};
