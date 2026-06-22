import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/ai/factory';
import type { AIProviderName } from '@/types';
import type { AIRequest } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { provider, apiKey, model, request } = body as {
    provider: AIProviderName;
    apiKey: string;
    model: string;
    request: AIRequest;
  };

  if (!provider || provider === 'none') {
    return NextResponse.json({ error: 'No AI provider configured.' }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required.' }, { status: 400 });
  }

  const aiProvider = getProvider(provider);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of aiProvider.interpret(request, apiKey, model)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`\n\nError: ${message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
