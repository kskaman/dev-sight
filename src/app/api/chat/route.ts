import { auth } from "../auth/auth";
import { prisma } from "../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(chats);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { title } = await req.json();

  const newChat = await prisma.chat.create({
    data: {
      userId: session.user.id,
      title: title || "Untitled Chat",
    },
  });

  return NextResponse.json(newChat, { status: 201 });
}
