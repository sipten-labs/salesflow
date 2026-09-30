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
    const { rows } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No records provided" }, { status: 400 });
    }

    // Existing emails nikal kar duplicate check karenge
    const existingEmails = new Set(
      (
        await prisma.lead.findMany({
          where: { tenantId },
          select: { email: true },
        })
      ).map((l) => l.email.toLowerCase())
    );

    const validRecords: any[] = [];
    const failedRecords: any[] = [];
    const seenInBatch = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = row.email ? String(row.email).toLowerCase().trim() : "";
      const fullName = row.fullName ? String(row.fullName).trim() : "";

      if (!fullName) {
        failedRecords.push({ row: i + 1, email, reason: "Full Name missing" });
        continue;
      }

      if (!email || !email.includes("@")) {
        failedRecords.push({ row: i + 1, email, reason: "Invalid or missing email" });
        continue;
      }

      if (existingEmails.has(email) || seenInBatch.has(email)) {
        failedRecords.push({ row: i + 1, email, reason: "Duplicate email address" });
        continue;
      }

      seenInBatch.add(email);
      validRecords.push({
        tenantId,
        fullName,
        companyName: row.companyName ? String(row.companyName).trim() : null,
        email,
        phone: row.phone ? String(row.phone).trim() : null,
        website: row.website ? String(row.website).trim() : null,
        country: row.country ? String(row.country).trim() : null,
        leadSource: row.leadSource ? String(row.leadSource).trim() : "CSV Import",
        industry: row.industry ? String(row.industry).trim() : null,
        estimatedValue: row.estimatedValue ? parseFloat(row.estimatedValue) || 0 : 0,
        status: "NEW",
      });
    }

    if (validRecords.length > 0) {
      await prisma.lead.createMany({
        data: validRecords,
      });
    }

    return NextResponse.json({
      success: true,
      importedCount: validRecords.length,
      failedCount: failedRecords.length,
      failedRecords,
    });
  } catch (error) {
    console.error("IMPORT_LEADS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}