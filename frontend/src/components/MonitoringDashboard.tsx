'use client';

import { useState, useEffect } from 'react';
import { analytics, track } from '@/lib/analytics';

// Component that throws an error during render for testing ErrorBoundary
const ErrorThrowingComponent = () => {
  throw new Error('Test error for monitoring system');
  return null;
};

interface MonitoringStats {
  pageViews: number;
  uniqueUsers: number;
  sessionDuration: number;
  errorRate: number;
  performanceScore: number;
  lastUpdated: string;
}

export default function MonitoringDashboard() {
  const [stats, setStats] = useState<MonitoringStats>({
    pageViews: 0,
    uniqueUsers: 0,
    sessionDuration: 0,
    errorRate: 0,
    performanceScore: 0,
    lastUpdated: new Date().toISOString(),
  });

  const [isVisible, setIsVisible] = useState(false);
  const [shouldThrowError, setShouldThrowError] = useState(false);

  useEffect(() => {
    // Track dashboard access
    track('monitoring_dashboard_viewed');

    // Check if admin/debug mode
    const isDebugMode = localStorage.getItem('echo_debug_mode') === 'true' ||
                       window.location.search.includes('debug=true');

    setIsVisible(isDebugMode);

    if (isDebugMode) {
      loadMonitoringStats();

      // Update stats every 30 seconds
      const interval = setInterval(loadMonitoringStats, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const loadMonitoringStats = async () => {
    try {
      // In production, this would fetch from your analytics API
      const mockStats: MonitoringStats = {
        pageViews: Math.floor(Math.random() * 10000) + 5000,
        uniqueUsers: Math.floor(Math.random() * 1000) + 500,
        sessionDuration: Math.floor(Math.random() * 300) + 120, // seconds
        errorRate: Math.random() * 2, // percentage
        performanceScore: Math.floor(Math.random() * 20) + 80, // 80-100
        lastUpdated: new Date().toISOString(),
      };

      setStats(mockStats);
    } catch (error) {

    }
  };

  const toggleDebugMode = () => {
    const newMode = !isVisible;
    setIsVisible(newMode);
    localStorage.setItem('echo_debug_mode', newMode.toString());

    if (newMode) {
      loadMonitoringStats();
    }

    track('debug_mode_toggled', { enabled: newMode });
  };

  const clearAnalyticsData = () => {
    localStorage.removeItem('echo_user_id');
    track('analytics_data_cleared');
    alert('Analytics data cleared. Page will reload.');
    window.location.reload();
  };

  const testErrorReporting = () => {
    const testType = confirm(
      'Choose error test type:\n\n' +
      'OK = Simulate error reporting (safe, no error created)\n' +
      'Cancel = Real error (tests ErrorBoundary)'
    );
    
    if (testType) {
      // Simulate error reporting flow without creating actual Error
      track('error_reporting_test_simulated');
      
      try {
        console.log('🧪 Testing error reporting system (simulated)...');
        
        // Simulate error data without creating Error object
        const simulatedErrorData = {
          message: 'Test error for monitoring system',
          timestamp: new Date().toISOString(),
          testType: 'simulated',
          component: 'MonitoringDashboard',
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        
        // Log as info instead of error to avoid triggering error monitoring

        // Send to analytics (this is the actual test)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exception', {
            description: simulatedErrorData.message,
            fatal: false,
            custom_parameter_1: 'test_error_simulated',
            custom_parameter_2: 'monitoring_dashboard_test'
          });
        }
        
        // Also test custom error tracking
        track('test_error_simulated', simulatedErrorData);
        
        alert(
          '✅ Error reporting test completed!\n\n' +
          'Simulated error data sent to analytics.\n' +
          'Check console (info level) and analytics dashboard.\n\n' +
          'No actual error was created or thrown.'
        );
        
      } catch (error) {

        alert('❌ Error reporting test failed. Check console for details.');
      }
    } else {
      // Real error (tests ErrorBoundary)
      const confirmed = confirm(
        'This will throw a REAL error to test the ErrorBoundary.\n\n' +
        'The component will crash and show an error UI.\n\n' +
        'Continue?'
      );
      
      if (confirmed) {
        track('error_reporting_test_real');

        setShouldThrowError(true);
      }
    }
  };

  const testAnalyticsEvent = () => {
    track('test_analytics_event', {
      testProperty: 'test value',
      timestamp: Date.now(),
      randomValue: Math.random(),
    });
    alert('Test analytics event sent!');
  };

  // Throw error if requested (for testing ErrorBoundary)
  if (shouldThrowError) {
    throw new Error('Test error for monitoring system');
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleDebugMode}
          className="nothing-button size-sm"
          title="Toggle monitoring dashboard"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          📊
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="card" style={{
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        color: '#fff',
        fontSize: '12px',
      }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0, fontSize: '14px', color: '#3b82f6' }}>
              📊 Monitoring
            </h3>
            <button
              onClick={toggleDebugMode}
              className="nothing-button"
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="card-content">
          <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Page Views:</span>
              <span style={{ color: '#3b82f6' }}>{stats.pageViews.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Unique Users:</span>
              <span style={{ color: '#10b981' }}>{stats.uniqueUsers.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Avg Session:</span>
              <span style={{ color: '#f59e0b' }}>{Math.floor(stats.sessionDuration / 60)}m</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Error Rate:</span>
              <span style={{ color: stats.errorRate > 1 ? '#ef4444' : '#10b981' }}>
                {stats.errorRate.toFixed(2)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Performance:</span>
              <span style={{
                color: stats.performanceScore > 90 ? '#10b981' :
                       stats.performanceScore > 70 ? '#f59e0b' : '#ef4444'
              }}>
                {stats.performanceScore}/100
              </span>
            </div>
          </div>

          <div style={{
            fontSize: '10px',
            color: '#666',
            marginBottom: '12px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            Updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
          </div>

          <div style={{ display: 'grid', gap: '4px' }}>
            <button
              onClick={testAnalyticsEvent}
              className="nothing-button"
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3b82f6',
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: '4px',
              }}
            >
              Test Analytics
            </button>
            <button
              onClick={testErrorReporting}
              className="nothing-button"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: '4px',
              }}
            >
              Test Reporting
            </button>
            <button
              onClick={clearAnalyticsData}
              className="nothing-button"
              style={{
                background: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                color: '#6b7280',
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: '4px',
              }}
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}