import { NextRequest, NextResponse } from 'next/server';

// SECURITY FIX: Removed NEXT_PUBLIC_ prefix to keep API key server-side only
// Never use NEXT_PUBLIC_ for sensitive credentials - they get embedded in client JavaScript
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [], settings = {} } = body;

    // Format messages for OpenRouter API
    interface ChatMessage {
      role: 'user' | 'assistant';
      content: string;
    }
    
    const messages: ChatMessage[] = [
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message.content
      }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://echo-app.local',
        'X-Title': 'Echo App'
      },
      body: JSON.stringify({
        model: settings.model || 'anthropic/claude-3-haiku',
        messages,
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return NextResponse.json({
        response: data.choices[0].message.content,
        type: 'text'
      });
    } else {
      return NextResponse.json(
        { error: 'Unexpected response format from OpenRouter' },
        { status: 500 }
      );
    }
  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}