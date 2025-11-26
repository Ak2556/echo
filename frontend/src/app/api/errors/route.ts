import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';

interface ErrorReport {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  buildVersion: string;
}

export async function POST(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json();

    // Sanitize error report
    const sanitizedReport = {
      message: await sanitizeInput(errorReport.message || ''),
      stack: errorReport.stack
        ? await sanitizeInput(errorReport.stack.substring(0, 5000))
        : undefined,
      filename: errorReport.filename
        ? await sanitizeInput(errorReport.filename)
        : undefined,
      lineno:
        typeof errorReport.lineno === 'number' ? errorReport.lineno : undefined,
      colno:
        typeof errorReport.colno === 'number' ? errorReport.colno : undefined,
      timestamp: errorReport.timestamp || Date.now(),
      userAgent: await sanitizeInput(errorReport.userAgent || ''),
      url: await sanitizeInput(errorReport.url || ''),
      userId: errorReport.userId
        ? await sanitizeInput(errorReport.userId)
        : undefined,
      sessionId: await sanitizeInput(errorReport.sessionId || ''),
      buildVersion: await sanitizeInput(errorReport.buildVersion || ''),
      serverTimestamp: new Date().toISOString(),
      clientIP:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
    };

    // Determine error severity
    const severity = determineSeverity(sanitizedReport);

    // Log error (in production, send to error tracking service)

    // In production, you would send to error tracking services:
    // await sendToSentry(sanitizedReport);
    // await sendToBugsnag(sanitizedReport);
    // await sendToRollbar(sanitizedReport);
    // await storeInDatabase(sanitizedReport);

    // For critical errors, send immediate alerts
    if (severity === 'critical') {
      await sendCriticalErrorAlert(sanitizedReport);
    }

    return NextResponse.json({
      success: true,
      severity,
      id: generateErrorId(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}

/**
 * Determine error severity based on error characteristics
 */
function determineSeverity(
  errorReport: any
): 'low' | 'medium' | 'high' | 'critical' {
  const { message, stack, url } = errorReport;

  // Critical errors
  if (
    message.includes('SecurityError') ||
    message.includes('CORS') ||
    message.includes('Authentication') ||
    message.includes('ChunkLoadError') ||
    url.includes('/api/')
  ) {
    return 'critical';
  }

  // High severity errors
  if (
    message.includes('TypeError') ||
    message.includes('ReferenceError') ||
    message.includes('Network Error') ||
    stack?.includes('at Object.') ||
    message.includes('Unhandled promise rejection')
  ) {
    return 'high';
  }

  // Medium severity errors
  if (
    message.includes('Warning') ||
    message.includes('Deprecation') ||
    stack?.includes('console.warn')
  ) {
    return 'medium';
  }

  // Default to low severity
  return 'low';
}

/**
 * Send critical error alerts
 */
async function sendCriticalErrorAlert(errorReport: any): Promise<void> {
  try {
    // In production, send to alerting systems:
    // - Slack/Discord webhooks
    // - PagerDuty
    // - Email alerts
    // - SMS notifications
    // Example webhook notification (would be actual service in production)
    // await fetch(process.env.SLACK_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: `🚨 Critical Error in Echo: ${errorReport.message}`,
    //     attachments: [{
    //       color: 'danger',
    //       fields: [
    //         { title: 'URL', value: errorReport.url, short: true },
    //         { title: 'Build', value: errorReport.buildVersion, short: true },
    //         { title: 'User', value: errorReport.userId || 'Anonymous', short: true },
    //         { title: 'Time', value: new Date(errorReport.timestamp).toISOString(), short: true }
    //       ]
    //     }]
    //   })
    // });
  } catch (alertError) {}
}

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
