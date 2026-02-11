import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/claude";
import { getFactCheckerPrompt } from "@/lib/prompts";
import { getSeoulDataForTopic } from "@/lib/seoul-data";
import { FactCheckRequest, FactCheckResult } from "@/types/debate";
import topicsData from "@/data/topics.json";

export async function POST(req: NextRequest) {
  try {
    const body: FactCheckRequest = await req.json();
    const { statement, speaker, topic } = body;

    const topicInfo = topicsData.topics.find((t) => t.id === topic);
    const dataKeys = topicInfo?.dataKeys ?? [];
    const seoulData = getSeoulDataForTopic(dataKeys);

    const systemPrompt = getFactCheckerPrompt(seoulData);
    const userPrompt = `발언자: ${speaker}\n발언 내용: "${statement}"`;

    const response = await generateResponse(
      systemPrompt,
      [{ role: "user", content: userPrompt }],
      "haiku"
    );

    let checks: FactCheckResult[] = [];
    try {
      const parsed = JSON.parse(response);
      checks = parsed.checks ?? [];
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          checks = parsed.checks ?? [];
        } catch {
          checks = [];
        }
      }
    }

    return NextResponse.json({ checks });
  } catch (error) {
    console.error("Factcheck API error:", error);
    return NextResponse.json({ checks: [] }, { status: 500 });
  }
}
