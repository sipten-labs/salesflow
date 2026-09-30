import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { taskId, status } = await req.json();

    const updatedTask = await prisma.task.update({
      where: { id: taskId, tenantId },
      data: { status },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("TASK_STATUS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}