import { redirect } from "next/navigation";
import ChatShell from "./components/chat-shell";
import { auth } from "../(auth)/auth";

export default async function ChatPage() {
  const session = await auth();

  if (!session) redirect("/login");

  return <ChatShell user={session.user} />;
}
