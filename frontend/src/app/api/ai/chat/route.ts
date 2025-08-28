import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ratelimit } from '@/lib/ratelimit';
import { sanitizeInput, validateInput } from '@/lib/security';

/**
 * Secure AI Chat API Route
 * Handles OpenRouter API calls server-side with proper security measures
 */
export async function POST(request: NextRequest) {

  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'anonymous';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // Get and validate API key (server-side only)
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('🔑 API Key status:', apiKey ? `Present (${apiKey.substring(0, 10)}...)` : 'Missing');
    if (!apiKey) {

      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { message, model, temperature } = body;

    // Input validation and sanitization
    if (!validateInput.message(message)) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    if (!validateInput.model(model)) {
      return NextResponse.json(
        { error: 'Invalid model selection' },
        { status: 400 }
      );
    }

    const sanitizedMessage = await sanitizeInput(message);

    // Security headers
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'",
    };

    // Make secure API call to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Echo Social Platform',
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: sanitizedMessage
          }
        ],
        temperature: Math.min(Math.max(temperature || 0.7, 0), 2),
        max_tokens: 4000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error('Request details:', { model, message: sanitizedMessage.substring(0, 100) });
      return NextResponse.json(
        { error: `Failed to process request: ${response.status} - ${errorText}` },
        { status: response.status, headers: securityHeaders }
      );
    }

    const data = await response.json();

    // Sanitize response before sending to client
    const sanitizedResponse = {
      response: await sanitizeInput(data.choices?.[0]?.message?.content || 'No response'),
      type: 'text',
      model: data.model,
      usage: data.usage
    };

    return NextResponse.json(sanitizedResponse, {
      headers: {
        ...securityHeaders,
        'X-RateLimit-Remaining': remaining.toString(),
      }
    });

  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        }
      }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}