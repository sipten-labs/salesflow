import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Sabhi leads fetch karna
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const leads = await prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error("GET_LEADS_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST: Nayi lead manually create karna
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();

    const { fullName, email, phone, companyName, estimatedValue, leadSource } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 }
      );
    }

    // Duplicate email check
    const existing = await prisma.lead.findFirst({
      where: { email, tenantId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A lead with this email already exists" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        fullName,
        email,
        phone: phone || null,
        companyName: companyName || null,
        estimatedValue: Number(estimatedValue) || 0,
        leadSource: leadSource || "Manual Entry",
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("POST_LEAD_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}