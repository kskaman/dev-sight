import { redirect } from "next/navigation";
import ChatShell from "./components/chat-shell";
import { auth } from "../(auth)/auth";
import Sidebar from "./components/sidebar";

export default async function ChatPage() {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <div className="flex h-screen w-full flex-row  bg-slate-50">
      <Sidebar user={session.user} />
      <ChatShell user={session.user} />
    </div>
  );
}
