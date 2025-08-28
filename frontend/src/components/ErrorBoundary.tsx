'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Check if this is a test error from monitoring dashboard
    const isTestError = error.message === 'Test error for monitoring system';
    
    if (isTestError) {

    } else {

    }

    // Send to error reporting service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_parameter_1: isTestError ? 'test_error' : 'production_error'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      const isTestError = this.state.error?.message === 'Test error for monitoring system';
      
      return this.props.fallback || (
        <motion.div 
          className="error-boundary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="error-content">
            {isTestError ? (
              <>
                <h2>🧪 Test Error Caught!</h2>
                <p>The monitoring system test error was successfully caught by the ErrorBoundary.</p>
                <p style={{ fontSize: '0.9em', color: '#888' }}>Check the console for detailed logs.</p>
              </>
            ) : (
              <>
                <h2>Something went wrong</h2>
                <p>We&apos;re sorry, but something unexpected happened.</p>
              </>
            )}
            <button
              onClick={() => this.setState({ hasError: false })}
              className="retry-button"
            >
              {isTestError ? 'Close Test Result' : 'Try again'}
            </button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;