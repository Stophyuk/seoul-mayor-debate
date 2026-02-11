import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateResponse(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  model: "sonnet" | "haiku" = "sonnet"
): Promise<string> {
  const modelId =
    model === "sonnet"
      ? "claude-sonnet-4-5-20250929"
      : "claude-haiku-4-5-20251001";

  const response = await client.messages.create({
    model: modelId,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  if (block.type === "text") {
    return block.text;
  }
  return "";
}
