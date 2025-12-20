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
    const ip =
      request.headers.get('x-forwarded-for') ||
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
    const isDemoMode = !apiKey;
    console.log(
      '🔑 API Key status:',
      apiKey ? `Present (${apiKey.substring(0, 10)}...)` : 'Missing - Running in DEMO mode'
    );

    // If no API key, run in demo mode with mock responses
    if (isDemoMode) {
      const body = await request.json();
      const { message } = body;

      // Demo mode responses
      const demoResponses = [
        "Hello! I'm Echo AI running in demo mode. To enable full AI capabilities, please add your OPENROUTER_API_KEY to the .env file. How can I help you today?",
        "I'm currently in demo mode. This is a sample response to show how Echo AI works. For real AI responses, configure your API key!",
        "Demo mode active! Echo AI is designed to help you with questions, suggestions, and conversations. Add an API key to unlock full functionality.",
        "Thanks for trying Echo AI! I'm running in demo mode right now. To get intelligent AI responses, set up your OPENROUTER_API_KEY environment variable.",
      ];

      // Simple response based on message keywords
      let response = demoResponses[Math.floor(Math.random() * demoResponses.length)];

      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = "👋 Hello! I'm Echo AI in demo mode. I can see you're greeting me! To enable intelligent conversations, please add your OPENROUTER_API_KEY to the environment configuration.";
      } else if (lowerMessage.includes('help')) {
        response = "I'm here to help! Currently running in demo mode. To enable full AI assistance with real-time intelligent responses, you'll need to configure an OPENROUTER_API_KEY in your .env file.";
      } else if (lowerMessage.includes('weather')) {
        response = "☀️ I'd love to help with weather information! In demo mode, I can't access real-time data. Configure your API key for live weather updates and more!";
      } else if (lowerMessage.includes('how') || lowerMessage.includes('what')) {
        response = `Great question! I'm Echo AI in demo mode. To get detailed, intelligent answers to questions like "${message.substring(0, 50)}...", please add your OPENROUTER_API_KEY to enable full AI capabilities.`;
      }

      return NextResponse.json({
        response: response,
        type: 'text',
        model: 'demo-mode',
        usage: { demo: true },
        isDemo: true,
      }, {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'X-RateLimit-Remaining': remaining.toString(),
        },
      });
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
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Echo Social Platform',
        },
        body: JSON.stringify({
          model: model || 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: sanitizedMessage,
            },
          ],
          temperature: Math.min(Math.max(temperature || 0.7, 0), 2),
          max_tokens: 4000,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error('Request details:', {
        model,
        message: sanitizedMessage.substring(0, 100),
      });
      return NextResponse.json(
        {
          error: `Failed to process request: ${response.status} - ${errorText}`,
        },
        { status: response.status, headers: securityHeaders }
      );
    }

    const data = await response.json();

    // Sanitize response before sending to client
    const sanitizedResponse = {
      response: await sanitizeInput(
        data.choices?.[0]?.message?.content || 'No response'
      ),
      type: 'text',
      model: data.model,
      usage: data.usage,
    };

    return NextResponse.json(sanitizedResponse, {
      headers: {
        ...securityHeaders,
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        },
      }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
