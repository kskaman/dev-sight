import { auth } from "@/app/api/auth/auth";
import { prisma } from "../../../../../../lib/prisma";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

// Define the Role enum locally to match Prisma schema
enum Role {
  USER = "USER",
  ASSISTANT = "ASSISTANT", 
  SYSTEM = "SYSTEM"
}

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
}

const toCoreRole = (r: Role): "user" | "assistant" | "system" =>
  r === Role.USER ? "user" : r === Role.ASSISTANT ? "assistant" : "system";

export async function GET(_: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
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
      createdAt: true 
    },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId } = await params;
  const { content } = await req.json() as { content: string } ;

  if (!content || typeof content !== "string") {
    return new Response("Invalid message", { status: 400 });
  }

  // ensure chat exists or create a chat
  const chat = await prisma.chat.upsert({
  where: { id: chatId },
  update: {},
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

  const history = messages.map((m: { role: Role; content: string }) => ({
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
    },
  });

  return result.toDataStreamResponse();
}


