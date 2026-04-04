import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content, type } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'content is required and must be a string' },
        { status: 400 }
      );
    }

    // Mock rewrite — in production this would call an LLM
    const rewritten =
      type === 'metric'
        ? `In plain terms: ${content} — this number shows how well things are going.`
        : type === 'process'
          ? `Simply put: ${content} — this is a step-by-step way to get something done.`
          : `Here's a simpler way to say it: ${content} — this means the same thing, just easier to understand.`;

    return NextResponse.json({ rewritten });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
