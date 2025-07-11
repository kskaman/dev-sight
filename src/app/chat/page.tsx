"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/app/api/api";

export default function ChatLanding() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      //POST /api/chat  ->  { id, title }
      const chat = await api.post<{ id: string }>("/api/chat", {
        title: "Untitled Chat",
      });

      //redirect to /chat/[id]
      router.replace(`/chat/${chat.id}`);
    })();
  }, [router]);

  return null;
}
