import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const tasks = await prisma.task.findMany({
      where: { tenantId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, fullName: true, companyName: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET_TASKS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const body = await req.json();

    const { title, description, dueDate, priority, leadId } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: "Title and Due Date are required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        tenantId,
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || "MEDIUM",
        status: "PENDING",
        createdById: userId,
        assignedToId: userId,
        leadId: leadId || null,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("CREATE_TASK_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}