import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Current workspace subscription details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        plan: true,
        maxUsers: true,
        maxLeads: true,
        aiMonthlyCredits: true,
        aiCreditsUsed: true,
        subscriptionStatus: true,
      },
    });

    const userCount = await prisma.user.count({ where: { tenantId } });
    const leadCount = await prisma.lead.count({ where: { tenantId } });

    return NextResponse.json({
      tenant,
      usage: {
        users: userCount,
        leads: leadCount,
      },
    });
  } catch (error) {
    console.error("GET_BILLING_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Simulate / Upgrade Plan (Server-side enforced)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const role = (session.user as any).role;

    if (role !== "OWNER") {
      return NextResponse.json({ error: "Only the Owner can modify billing" }, { status: 403 });
    }

    const { targetPlan } = await req.json();

    const planConfig: Record<string, { maxUsers: number; maxLeads: number; aiCredits: number }> = {
      STARTER: { maxUsers: 5, maxLeads: 2000, aiCredits: 50 },
      PROFESSIONAL: { maxUsers: 20, maxLeads: 20000, aiCredits: 250 },
      BUSINESS: { maxUsers: 50, maxLeads: 100000, aiCredits: 1000 },
    };

    if (!planConfig[targetPlan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: targetPlan as any,
        maxUsers: planConfig[targetPlan].maxUsers,
        maxLeads: planConfig[targetPlan].maxLeads,
        aiMonthlyCredits: planConfig[targetPlan].aiCredits,
        subscriptionStatus: "active",
      },
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (error) {
    console.error("UPDATE_BILLING_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}