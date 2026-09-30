import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { leadId } = await req.json();

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.convertedToCustomer) {
      return NextResponse.json({ error: "Lead is already converted." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          tenantId,
          companyName: lead.companyName || lead.fullName,
          contactName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          industry: lead.industry,
          notes: lead.notes,
          totalRevenue: lead.estimatedValue,
        },
      });

      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: "WON",
          convertedToCustomer: true,
          customerId: customer.id,
        },
      });

      return { customer, updatedLead };
    });

    return NextResponse.json({ customer: result.customer }, { status: 201 });
  } catch (error) {
    console.error("CONVERT_LEAD_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}