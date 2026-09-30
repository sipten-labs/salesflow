import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    // 1. Lead details fetch karna
    const lead = await prisma.lead.findUnique({
      where: { id: leadId, tenantId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // 2. Gemini AI setup
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert enterprise B2B sales strategist. Analyze the following lead and output ONLY a clean JSON object (no markdown, no backticks, just raw JSON).

Lead Details:
- Name: ${lead.fullName}
- Company: ${lead.companyName || "Unknown"}
- Estimated Deal Value: $${lead.estimatedValue}
- Current Status: ${lead.status}
- Lead Source: ${lead.leadSource || "Website"}

Output strictly matching this JSON schema:
{
  "summary": "Concise 2-sentence executive summary of the deal potential",
  "priority": "HIGH",
  "suggestedNextAction": "A specific high-impact next step for the sales rep",
  "suggestedFollowUpEmail": "A complete, highly personalized, persuasive cold outreach email pitch"
}
`;

    // 3. Retry loop for high-demand (503) handling
    let responseText = "";
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });

        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw err;
        }
        // Agar high demand aaye toh 1 second ruk kar retry karega
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    // Clean backticks if any
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedAnalysis = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      analysis: parsedAnalysis,
    });
  } catch (error: any) {
    console.error("AI_ANALYSIS_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}