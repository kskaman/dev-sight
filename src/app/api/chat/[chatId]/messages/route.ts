import { auth } from "@/app/api/auth/auth";
import { prisma } from "../../../../../../lib/prisma";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

const toCoreRole = (r: Role): "user" | "assistant" | "system" =>
  r === Role.USER ? "user" : r === Role.ASSISTANT ? "assistant" : "system";

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId } = await params;
  const { content } = (await req.json()) as { content: string };

  if (!content || typeof content !== "string") {
    return new Response("Invalid message", { status: 400 });
  }

  // ensure chat exists or create a chat
  const chat = await prisma.chat.upsert({
    where: { id: chatId },
    update: { updatedAt: new Date() },
    create: { id: chatId, userId: session.user.id, title: "New chat" },
  });

  // Save user message
  await prisma.message.create({
    data: {
      chatId: chat.id,
      role: Role.USER,
      content,
    },
  });

  // Fetch previous messages (context)
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

  let assistantBuf = "";

  const result = streamText({
    model: google("gemini-1.5-pro-latest"),
    messages: history,
    onChunk: ({ chunk }) => {
      if (chunk.type === "text-delta") assistantBuf += chunk.textDelta;
    },
    onFinish: async () => {
      await prisma.message.create({
        data: { chatId: chat.id, role: Role.ASSISTANT, content: assistantBuf },
      });

      // rename if it’s still “Untitled Chat”
      if (chat.title === "Untitled Chat") {
        await prisma.chat.update({
          where: { id: chat.id },
          data: { title: content.slice(0, 40) }, // first 40 chars of user prompt
        });
      }
    },
  });

  return result.toDataStreamResponse();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const chatId = await params.chatId;

  const msgs = await prisma.message.findMany({
    where: { chatId, chat: { userId: session.user.id }, isDeleted: false },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true },
  });

  return NextResponse.json(msgs);
}
