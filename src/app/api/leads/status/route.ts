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
    const { leadId, status } = await req.json();

    if (!leadId || !status) {
      return NextResponse.json({ error: "Missing leadId or status" }, { status: 400 });
    }

    // Verify lead belongs to this tenant and update
    const updatedLead = await prisma.lead.update({
      where: {
        id: leadId,
        tenantId: tenantId,
      },
      data: {
        status: status,
      },
    });

    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error("UPDATE_LEAD_STATUS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}