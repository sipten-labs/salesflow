import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { fullName, email, password, companyName } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Auto-generate safe slug
    const company = companyName || `${fullName} Company`;
    const generatedSlug = company
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30) + `-${Date.now()}`;

    // 1. Create Tenant with slug
    const tenant = await prisma.tenant.create({
      data: {
        name: company,
        slug: generatedSlug,
      } as any,
    });

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User with passwordHash
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash: hashedPassword,
        role: "OWNER",
        tenantId: tenant.id,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully with 30-Day Free Trial",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("REGISTER_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}