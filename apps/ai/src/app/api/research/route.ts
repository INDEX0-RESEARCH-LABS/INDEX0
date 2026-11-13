import { NextRequest, NextResponse } from "next/server";

const ORCHESTRATOR_URL =
  process.env.ORCHESTRATOR_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userPrompt, region, depth = "deep" } = body;

  if (!userPrompt) {
    return NextResponse.json({ error: "userPrompt required" }, { status: 400 });
  }

  const res = await fetch(`${ORCHESTRATOR_URL}/research/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userPrompt, region, depth }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Research agent unavailable" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get("planId");

  if (!planId) {
    return NextResponse.json({ error: "planId required" }, { status: 400 });
  }

  const res = await fetch(
    `${ORCHESTRATOR_URL}/research/${planId}/status`
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
