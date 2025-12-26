/**
 * Production Configuration and Environment Management
 * Centralized configuration for production monitoring, analytics, and feature flags
 */

export interface AppConfig {
  // Environment
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildTime: string;

  // Analytics & Monitoring
  analytics: {
    enabled: boolean;
    batchSize: number;
    flushInterval: number;
    endpoint: string;
    trackingId?: string;
  };

  // Error Reporting
  errorReporting: {
    enabled: boolean;
    endpoint: string;
    enableSourceMaps: boolean;
    sensitiveDataFilter: string[];
  };

  // Performance Monitoring
  performance: {
    enabled: boolean;
    sampleRate: number;
    thresholds: {
      pageLoad: number;
      api: number;
      render: number;
    };
  };

  // Feature Flags
  features: {
    pwaEnabled: boolean;
    offlineMode: boolean;
    debugMode: boolean;
    experimentalFeatures: boolean;
    aiChat: boolean;
    miniApps: boolean;
    analytics: boolean;
    pushNotifications: boolean;
  };

  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    rateLimiting: {
      requests: number;
      windowMs: number;
    };
  };

  // Security
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;
    enableCORS: boolean;
    trustedDomains: string[];
    apiKeyRotationInterval: number;
  };

  // Caching
  cache: {
    enabled: boolean;
    defaultTTL: number;
    maxSize: number;
    strategy: 'memory' | 'localStorage' | 'indexedDB';
  };
}

class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    const environment = process.env.NODE_ENV as
      | 'development'
      | 'staging'
      | 'production';

    // Base configuration
    const baseConfig: AppConfig = {
      environment,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),

      analytics: {
        enabled: environment === 'production',
        batchSize: 10,
        flushInterval: 30000,
        endpoint: '/api/analytics',
        trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
      },

      errorReporting: {
        enabled: environment !== 'development',
        endpoint: '/api/errors',
        enableSourceMaps: environment === 'development',
        sensitiveDataFilter: ['password', 'token', 'key', 'secret', 'auth'],
      },

      performance: {
        enabled: true,
        sampleRate: environment === 'production' ? 0.1 : 1.0,
        thresholds: {
          pageLoad: 3000, // 3 seconds
          api: 5000, // 5 seconds
          render: 100, // 100ms
        },
      },

      features: {
        pwaEnabled: true,
        offlineMode: true,
        debugMode: environment === 'development',
        experimentalFeatures: environment !== 'production',
        aiChat: true,
        miniApps: true,
        analytics: environment !== 'development',
        pushNotifications: environment === 'production',
      },

      api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        timeout: 30000,
        retryAttempts: 3,
        rateLimiting: {
          requests: 100,
          windowMs: 15 * 60 * 1000, // 15 minutes
        },
      },

      security: {
        enableCSP: environment === 'production',
        enableHSTS: environment === 'production',
        enableCORS: true,
        trustedDomains: [
          'localhost',
          'echo.app',
          '*.echo.app',
          'openrouter.ai',
          'api.openai.com',
        ],
        apiKeyRotationInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      },

      cache: {
        enabled: true,
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        maxSize: 50 * 1024 * 1024, // 50MB
        strategy: 'indexedDB',
      },
    };

    // Environment-specific overrides
    if (environment === 'production') {
      return {
        ...baseConfig,
        analytics: {
          ...baseConfig.analytics,
          enabled: true,
          batchSize: 20,
          flushInterval: 60000, // 1 minute in production
        },
        performance: {
          ...baseConfig.performance,
          sampleRate: 0.1, // Sample 10% in production
        },
        features: {
          ...baseConfig.features,
          debugMode: false,
          experimentalFeatures: false,
        },
      };
    }

    if (environment === 'staging') {
      return {
        ...baseConfig,
        analytics: {
          ...baseConfig.analytics,
          enabled: true,
          endpoint: '/api/analytics?staging=true',
        },
        errorReporting: {
          ...baseConfig.errorReporting,
          endpoint: '/api/errors?staging=true',
        },
      };
    }

    // Development overrides
    return {
      ...baseConfig,
      analytics: {
        ...baseConfig.analytics,
        enabled: false, // Disable in development by default
      },
      errorReporting: {
        ...baseConfig.errorReporting,
        enabled: false,
      },
      features: {
        ...baseConfig.features,
        debugMode: true,
        experimentalFeatures: true,
      },
    };
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  public getAnalyticsConfig() {
    return this.config.analytics;
  }

  public getPerformanceConfig() {
    return this.config.performance;
  }

  public getErrorReportingConfig() {
    return this.config.errorReporting;
  }

  public getAPIConfig() {
    return this.config.api;
  }

  public getSecurityConfig() {
    return this.config.security;
  }

  public getCacheConfig() {
    return this.config.cache;
  }

  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  public isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  public getVersion(): string {
    return this.config.version;
  }

  public getBuildInfo() {
    return {
      version: this.config.version,
      buildTime: this.config.buildTime,
      environment: this.config.environment,
    };
  }

  // Runtime feature flag updates (for A/B testing, etc.)
  public updateFeatureFlag(
    feature: keyof AppConfig['features'],
    enabled: boolean
  ): void {
    this.config.features[feature] = enabled;

    // Persist to localStorage for session consistency
    localStorage.setItem(
      'echo_feature_flags',
      JSON.stringify(this.config.features)
    );
  }

  // Load feature flags from localStorage (for persistent overrides)
  private loadFeatureFlags(): Partial<AppConfig['features']> {
    try {
      const stored = localStorage.getItem('echo_feature_flags');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Health check configuration
  public getHealthCheckConfig() {
    return {
      enabled: this.config.environment !== 'development',
      interval: 60000, // 1 minute
      endpoints: ['/api/health', '/api/analytics', '/api/errors'],
      thresholds: {
        responseTime: 1000, // 1 second
        successRate: 0.95, // 95%
      },
    };
  }
}

// Create singleton instance
export const config = new ConfigManager();

// Convenience exports
export const isFeatureEnabled = (feature: keyof AppConfig['features']) =>
  config.isFeatureEnabled(feature);

export const isDevelopment = () => config.isDevelopment();
export const isProduction = () => config.isProduction();
export const isStaging = () => config.isStaging();

export default config;
