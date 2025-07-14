import { auth } from "../../auth/auth";
import { prisma } from "../../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { chatId } = await params;

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!chat) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(chat);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { title } = await req.json();
  const { chatId } = await params;

  const updated = await prisma.chat.update({
    where: {
      id: chatId,
      userId: session.user.id,
    },
    data: { title },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { chatId } = await params;

  await prisma.chat.deleteMany({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  });

  return new NextResponse(null, { status: 204 });
}
