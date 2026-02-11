import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/claude";
import {
  getModeratorPrompt,
  getIntroPrompt,
  getTransitionPrompt,
  getCooperationPrompt,
} from "@/lib/prompts";
import { ModerateRequest } from "@/types/debate";

export async function POST(req: NextRequest) {
  try {
    const body: ModerateRequest = await req.json();
    const {
      messages,
      phase,
      topic,
      round,
      totalRounds,
      candidateName,
      opponentName,
    } = body;

    const systemPrompt = getModeratorPrompt(candidateName, opponentName);

    let userPrompt: string;

    if (phase === "intro") {
      userPrompt = getIntroPrompt(
        candidateName,
        opponentName,
        topic,
        round,
        totalRounds
      );
    } else if (phase === "cooperation") {
      const lastMessages = messages
        .slice(-4)
        .map((m) => `[${m.speaker}] ${m.content}`)
        .join("\n");

      userPrompt = getCooperationPrompt(
        candidateName,
        opponentName,
        lastMessages
      );
    } else if (phase === "transition" || phase === "closing") {
      const lastMessages = messages
        .slice(-4)
        .map((m) => `[${m.speaker}] ${m.content}`)
        .join("\n");

      const nextTopic = phase === "closing" ? null : topic;
      userPrompt = getTransitionPrompt(
        candidateName,
        opponentName,
        lastMessages,
        nextTopic
      );
    } else {
      userPrompt = `현재 ${round}라운드, 주제: "${topic}". ${candidateName} 후보에게 발언을 요청하세요.`;
    }

    const response = await generateResponse(
      systemPrompt,
      [{ role: "user", content: userPrompt }],
      "haiku"
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Moderate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate moderator response" },
      { status: 500 }
    );
  }
}
