import { auth } from "../../auth";
import { prisma } from "../../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const chat = await prisma.chat.findFirst({
    where: {
      id: params.chatId,
      userId: session.user.id,
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!chat) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(chat);
}

export async function PUT(req: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { title } = await req.json();

  const updated = await prisma.chat.updateMany({
    where: {
      id: params.chatId,
      userId: session.user.id,
    },
    data: { title },
  });

  return NextResponse.json({ updated: updated.count > 0 });
}

export async function DELETE(_: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  await prisma.message.deleteMany({ where: { chatId: params.chatId } });

  const deleted = await prisma.chat.deleteMany({
    where: {
      id: params.chatId,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ deleted: deleted.count > 0 });
}
