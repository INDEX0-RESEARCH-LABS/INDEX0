import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { streamText } from "ai";

const bedrock = createAmazonBedrock({ region: "ap-southeast-2" });

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, system } = await req.json();

  const result = await streamText({
    model: bedrock("anthropic.claude-sonnet-4-6"),
    system:
      system ||
      "You are INDEX0 AI — a sovereign software engineering agent. " +
      "You help developers plan, research, and build production-grade applications. " +
      "When a user describes an app they want to build, offer to run GROUNDWORK — " +
      "a research-first pipeline that grounds every architectural decision in live " +
      "web sources before writing a single line of code.",
    messages,
  });

  return result.toDataStreamResponse();
}
