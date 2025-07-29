import { auth } from "@/app/api/auth/auth";
import { prisma } from "../../../../../lib/prisma";
import {
  streamText,
  convertToCoreMessages,
  createDataStreamResponse,
} from "ai";
import { google } from "@ai-sdk/google";
import cuid from "cuid";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

type UIMsg = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(req: NextRequest) {
  /* auth */
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  /* payload from useChat */
  const { id: maybeId, messages }: { id?: string; messages: UIMsg[] } =
    await req.json();

  /* ensure chat exists (or create) */
  const chatId = maybeId ?? cuid();

  const chat = await prisma.chat.upsert({
    where: { id: chatId },
    update: { updatedAt: new Date() },
    create: { id: chatId, userId: session.user.id, title: "Untitled Chat" },
  });

  /* persist user msg */
  const last = messages[messages.length - 1];
  if (last?.role === "user") {
    await prisma.message.create({
      data: { chatId, role: Role.USER, content: last.content },
    });
  }

  /* get the model stream */
  const llmStream = streamText({
    model: google("gemini-2.0-flash"),
    messages: convertToCoreMessages(
      messages.slice(-30).map((m) => ({
        role: m.role,
        content: m.content,
      }))
    ),

    onFinish: async ({ text }) => {
      await prisma.message.create({
        data: { chatId, role: Role.ASSISTANT, content: text },
      });
      if (chat.title === "Untitled Chat") {
        await prisma.chat.update({
          where: { id: chatId },
          data: { title: last.content.slice(0, 10) },
        });
      }
    },
  });

  /* merge a FIRST chunk containing { chatId } */
  return createDataStreamResponse({
    async execute(writer) {
      writer.writeData({ chatId }); // 👈 custom data part
      llmStream.mergeIntoDataStream(writer); // then the tokens
    },
  });
}

export const dynamic = "force-dynamic";
