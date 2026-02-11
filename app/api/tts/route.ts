import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/elevenlabs";
import { TTSRequest } from "@/types/debate";

export async function POST(req: NextRequest) {
  try {
    const body: TTSRequest = await req.json();
    const { text, voiceType } = body;

    const voiceId =
      voiceType === "moderator"
        ? process.env.ELEVENLABS_MODERATOR_VOICE_ID
        : process.env.ELEVENLABS_OPPONENT_VOICE_ID;

    if (!voiceId) {
      return NextResponse.json(
        { error: `Voice ID for ${voiceType} not configured` },
        { status: 400 }
      );
    }

    const audioBuffer = await synthesizeSpeech(text, voiceId);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}
