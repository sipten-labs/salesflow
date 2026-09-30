import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const demoEmail = "demo@salesflow.internal";

    // 1. Find or create demo workspace with required slug
    let tenant = await prisma.tenant.findFirst({
      where: { name: "Demo Workspace" },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: "Demo Workspace",
          slug: `demo-workspace-${Date.now()}`,
        } as any,
      });
    }

    // 2. Find or create demo user with passwordHash
    let demoUser = await prisma.user.findFirst({
      where: { email: demoEmail },
    });

    if (!demoUser) {
      const hashedPassword = await bcrypt.hash("demo12345", 10);

      demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          name: "Demo Guest",
          passwordHash: hashedPassword,
          role: "OWNER",
          tenantId: tenant.id,
        } as any,
      });

      // 3. Demo leads seed karein
      await prisma.lead.createMany({
        data: [
          {
            tenantId: tenant.id,
            fullName: "Alex Miller",
            email: "alex@techstart.io",
            companyName: "TechStart Labs",
            estimatedValue: 12000,
            status: "QUALIFIED",
            leadSource: "LinkedIn Outreach",
          },
          {
            tenantId: tenant.id,
            fullName: "Sarah Connor",
            email: "sarah@cyberdyne.co",
            companyName: "Cyberdyne Systems",
            estimatedValue: 45000,
            status: "CONTACTED",
            leadSource: "Direct Inbound",
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      email: demoEmail,
      password: "demo12345",
    });
  } catch (error: any) {
    console.error("DEMO_LOGIN_ERROR", error);
    return NextResponse.json({ error: "Failed to initialize demo" }, { status: 500 });
  }
}