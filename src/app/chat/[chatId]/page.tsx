"use client";

import { useParams } from "next/navigation";
import ChatShell from "../components/chat-shell";

export default function ChatByIdPage() {
  const { chatId } = useParams<{ chatId: string }>();
  return <ChatShell chatId={chatId} />;
}
