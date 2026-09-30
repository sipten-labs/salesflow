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

    // 1. Fetch all tenant leads
    const leads = await prisma.lead.findMany({
      where: { tenantId },
      select: { status: true, estimatedValue: true, createdAt: true, leadSource: true },
    });

    // 2. Fetch tasks
    const tasks = await prisma.task.findMany({
      where: { tenantId },
      select: { status: true, dueDate: true },
    });

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === "NEW").length;
    const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED").length;
    const wonLeads = leads.filter((l) => l.status === "WON");
    const lostLeads = leads.filter((l) => l.status === "LOST").length;

    const pipelineValue = leads
      .filter((l) => !["WON", "LOST"].includes(l.status))
      .reduce((acc, curr) => acc + curr.estimatedValue, 0);

    const wonRevenue = wonLeads.reduce((acc, curr) => acc + curr.estimatedValue, 0);

    const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : "0";

    const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED").length;
    const now = new Date();
    const overdueTasks = tasks.filter((t) => t.status !== "COMPLETED" && new Date(t.dueDate) < now).length;

    // Leads by source breakdown
    const sourceMap: Record<string, number> = {};
    leads.forEach((l) => {
      const src = l.leadSource || "Direct";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    const leadsBySource = Object.keys(sourceMap).map((k) => ({
      name: k,
      count: sourceMap[k],
    }));

    return NextResponse.json({
      metrics: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        wonDeals: wonLeads.length,
        lostDeals: lostLeads,
        pipelineValue,
        wonRevenue,
        conversionRate: `${conversionRate}%`,
        pendingTasks,
        overdueTasks,
      },
      leadsBySource,
    });
  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}