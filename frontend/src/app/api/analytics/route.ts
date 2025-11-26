import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events format' },
        { status: 400 }
      );
    }

    // In production, you would send these to your analytics service
    // For now, we'll log them and store in a simple format
    const timestamp = new Date().toISOString();
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Process each event
    const processedEvents = await Promise.all(
      events.map(async (event: any) => {
        // Sanitize event data
        const sanitizedEvent = {
          name: await sanitizeInput(event.name || ''),
          timestamp: event.timestamp || Date.now(),
          userId: await sanitizeInput(event.userId || ''),
          sessionId: await sanitizeInput(event.sessionId || ''),
          properties: event.properties
            ? await sanitizeEventProperties(event.properties)
            : {},
          serverTimestamp: timestamp,
          clientIP,
        };

        return sanitizedEvent;
      })
    );

    // Log analytics events (in production, send to analytics service)
    console.log('📊 Analytics Events:', {
      count: processedEvents.length,
      timestamp,
      events: processedEvents.slice(0, 3), // Log first 3 events for debugging
    });

    // Here you would typically:
    // 1. Send to Google Analytics, Mixpanel, Amplitude, etc.
    // 2. Store in database for custom analytics
    // 3. Send to monitoring services like DataDog, New Relic

    // Example integration points:
    // await sendToGoogleAnalytics(processedEvents);
    // await storeInDatabase(processedEvents);
    // await sendToDataDog(processedEvents);

    return NextResponse.json({
      success: true,
      processed: processedEvents.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process analytics' },
      { status: 500 }
    );
  }
}

/**
 * Sanitize event properties recursively
 */
async function sanitizeEventProperties(properties: any): Promise<any> {
  if (typeof properties !== 'object' || properties === null) {
    return properties;
  }

  if (Array.isArray(properties)) {
    return Promise.all(properties.map(sanitizeEventProperties));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(properties)) {
    const sanitizedKey = await sanitizeInput(key);

    if (typeof value === 'string') {
      sanitized[sanitizedKey] = await sanitizeInput(value);
    } else if (typeof value === 'object') {
      sanitized[sanitizedKey] = await sanitizeEventProperties(value);
    } else {
      sanitized[sanitizedKey] = value;
    }
  }

  return sanitized;
}
