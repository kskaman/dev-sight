import { auth } from "@/app/api/auth/auth";
import { prisma } from "../../../../../../lib/prisma";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

const toCoreRole = (r: Role): "user" | "assistant" | "system" =>
  r === Role.USER ? "user" : r === Role.ASSISTANT ? "assistant" : "system";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId } = await params;

  // Verify user owns this chat
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  });

  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  /*  auth */
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  /*  request body */
  const { chatId } = await params;
  const { content } = (await req.json()) as { content: string };
  if (!content?.trim()) return new Response("Invalid message", { status: 400 });

  /* ensure chat exists, save USER message */
  const chat = await prisma.chat.upsert({
    where: { id: chatId },
    update: { updatedAt: new Date() },
    create: { id: chatId, userId: session.user.id, title: "Untitled Chat" },
  });

  await prisma.message.create({
    data: { chatId: chat.id, role: Role.USER, content },
  });

  /* fetch last 30 for history */
  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
    take: 30,
  });

  const history = messages.map((m) => ({
    role: toCoreRole(m.role),
    content: m.content,
  }));

  /* prepare abort chain: if client disconnects → abort Gemini */
  const geminiCtrl = new AbortController();
  req.signal.addEventListener("abort", () => geminiCtrl.abort());

  const stream = streamText({
    model: google("gemini-2.0-flash"),
    messages: history,
    onFinish: async ({ text }) => {
      // 1️⃣ store assistant reply once full text is ready
      await prisma.message.create({
        data: { chatId: chat.id, role: Role.ASSISTANT, content: text },
      });
      // 2️⃣ rename chat on first turn
      if (chat.title === "Untitled Chat") {
        await prisma.chat.update({
          where: { id: chat.id },
          data: { title: content.slice(0, 10) },
        });
      }
    },
  });

  /* stream straight back to the browser */
  return stream.toDataStreamResponse();
}
