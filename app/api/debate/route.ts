import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/claude";
import { getPersonaPrompt } from "@/lib/prompts";
import { getSeoulDataForTopic } from "@/lib/seoul-data";
import { DebateRequest } from "@/types/debate";
import topicsData from "@/data/topics.json";
import statementsData from "@/data/candidate-statements.json";

export async function POST(req: NextRequest) {
  try {
    const body: DebateRequest = await req.json();
    const { messages, persona, topic, candidateName, round } = body;

    const topicInfo = topicsData.topics.find((t) => t.id === topic);
    const dataKeys = topicInfo?.dataKeys ?? [];
    const seoulData = getSeoulDataForTopic(dataKeys);

    const topicStatements = statementsData.statements.find(
      (s) => s.topic === topic
    );

    const systemPrompt = `${getPersonaPrompt(persona, candidateName)}

## 현재 라운드: ${round}
## 현재 주제: ${topicInfo?.title ?? topic}

## 참고 서울시 데이터
${seoulData}

${
  topicStatements
    ? `## 상대 후보(${candidateName})의 과거 발언 (활용 가능)
${topicStatements.quotes.map((q) => `- "${q}"`).join("\n")}`
    : ""
}`;

    const apiMessages = messages.slice(-8).map((msg) => ({
      role: (msg.role === "opponent" ? "assistant" : "user") as
        | "user"
        | "assistant",
      content: `[${msg.speaker}] ${msg.content}`,
    }));

    const response = await generateResponse(systemPrompt, apiMessages, "sonnet");

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Debate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate debate response" },
      { status: 500 }
    );
  }
}
