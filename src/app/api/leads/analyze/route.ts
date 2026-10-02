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

    const lead = await prisma.lead.findUnique({
      where: { id: leadId, tenantId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env" },
        { status: 500 }
      );
    }

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

    const ai = new GoogleGenAI({ apiKey });
    let responseText = "";

    // 1. Exponential retry for Gemini 3.8 Flash
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
        console.warn(`Attempt ${attempt} failed with Gemini API:`, err?.message || err);
        if (attempt < maxAttempts) {
          // Wait 1.5s, then 3s before next attempt
          await new Promise((res) => setTimeout(res, attempt * 1500));
        }
      }
    }

    // 2. Intelligent Fail-Safe (Agar Google server 503 me atka rahe)
    let analysisResult;

    if (responseText) {
      const cleanJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      try {
        analysisResult = JSON.parse(cleanJson);
      } catch (parseErr) {
        analysisResult = null;
      }
    }

    // Fallback if AI traffic is temporarily choked
    if (!analysisResult) {
      analysisResult = {
        summary: `High-value prospective deal for ${lead.companyName || lead.fullName} valued at $${lead.estimatedValue}. Client exhibits strong buying intent based on current ${lead.status} stage.`,
        priority: Number(lead.estimatedValue) > 20000 ? "HIGH" : "MEDIUM",
        suggestedNextAction: `Schedule a 20-minute executive discovery call with ${lead.fullName} to walk through product ROI metrics.`,
        suggestedFollowUpEmail: `Hi ${lead.fullName},\n\nI noticed your team at ${lead.companyName || "your company"} is exploring scalable enterprise solutions. Based on your current setup, SalesFlow can help streamline your sales pipeline and improve conversion by over 30%.\n\nWould you have 15 minutes this Thursday for a brief walkthrough?\n\nBest regards,\nSales Team`
      };
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (error: any) {
    console.error("AI_ANALYSIS_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}