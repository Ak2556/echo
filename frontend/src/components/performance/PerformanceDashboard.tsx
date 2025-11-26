'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  usePerformance,
  useRenderPerformance,
  useNetworkPerformance,
  useBundlePerformance,
  formatPerformanceMetrics,
} from '@/hooks/usePerformance';
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Zap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
}

export default function PerformanceDashboard({
  isVisible = false,
  onToggle,
}: PerformanceDashboardProps) {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'detailed' | 'alerts'
  >('overview');

  // Performance hooks
  const { metrics } = usePerformance({
    trackFPS: true,
    trackMemory: true,
    trackInteractions: true,
    onMetricsUpdate: handleMetricsUpdate,
  });

  const renderPerf = useRenderPerformance('PerformanceDashboard');
  const networkInfo = useNetworkPerformance();
  const bundleMetrics = useBundlePerformance();

  // Performance thresholds
  const thresholds = useMemo(
    () => ({
      fps: { warning: 30, error: 15 },
      renderTime: { warning: 16, error: 32 },
      memoryUsage: { warning: 70, error: 85 },
      interactionTime: { warning: 100, error: 300 },
      bundleSize: { warning: 5 * 1024 * 1024, error: 10 * 1024 * 1024 }, // 5MB warning, 10MB error
    }),
    []
  );

  // Handle metrics updates and generate alerts
  function handleMetricsUpdate(newMetrics: any) {
    const newAlerts: PerformanceAlert[] = [];

    // FPS alerts
    if (newMetrics.fps < thresholds.fps.error) {
      newAlerts.push({
        id: `fps-${Date.now()}`,
        type: 'error',
        message: `Very low FPS detected: ${newMetrics.fps}`,
        timestamp: Date.now(),
        metric: 'fps',
        value: newMetrics.fps,
        threshold: thresholds.fps.error,
      });
    } else if (newMetrics.fps < thresholds.fps.warning) {
      newAlerts.push({
        id: `fps-${Date.now()}`,
        type: 'warning',
        message: `Low FPS detected: ${newMetrics.fps}`,
        timestamp: Date.now(),
        metric: 'fps',
        value: newMetrics.fps,
        threshold: thresholds.fps.warning,
      });
    }

    // Render time alerts
    if (newMetrics.renderTime > thresholds.renderTime.error) {
      newAlerts.push({
        id: `render-${Date.now()}`,
        type: 'error',
        message: `Slow render detected: ${newMetrics.renderTime.toFixed(2)}ms`,
        timestamp: Date.now(),
        metric: 'renderTime',
        value: newMetrics.renderTime,
        threshold: thresholds.renderTime.error,
      });
    } else if (newMetrics.renderTime > thresholds.renderTime.warning) {
      newAlerts.push({
        id: `render-${Date.now()}`,
        type: 'warning',
        message: `Render time above optimal: ${newMetrics.renderTime.toFixed(2)}ms`,
        timestamp: Date.now(),
        metric: 'renderTime',
        value: newMetrics.renderTime,
        threshold: thresholds.renderTime.warning,
      });
    }

    // Memory usage alerts
    if (newMetrics.memoryUsage?.percentage > thresholds.memoryUsage.error) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'error',
        message: `High memory usage: ${newMetrics.memoryUsage.percentage}%`,
        timestamp: Date.now(),
        metric: 'memoryUsage',
        value: newMetrics.memoryUsage.percentage,
        threshold: thresholds.memoryUsage.error,
      });
    } else if (
      newMetrics.memoryUsage?.percentage > thresholds.memoryUsage.warning
    ) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        message: `Memory usage elevated: ${newMetrics.memoryUsage.percentage}%`,
        timestamp: Date.now(),
        metric: 'memoryUsage',
        value: newMetrics.memoryUsage.percentage,
        threshold: thresholds.memoryUsage.warning,
      });
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50 alerts
    }
  }

  // Clear old alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts((prev) =>
        prev.filter((alert) => Date.now() - alert.timestamp < 300000)
      ); // 5 minutes
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Performance score calculation
  const performanceScore = useMemo(() => {
    let score = 100;

    // FPS impact
    if (metrics.fps < 30) score -= 20;
    else if (metrics.fps < 45) score -= 10;

    // Render time impact
    if (metrics.renderTime > 32) score -= 20;
    else if (metrics.renderTime > 16) score -= 10;

    // Memory impact
    if (metrics.memoryUsage?.percentage > 85) score -= 15;
    else if (metrics.memoryUsage?.percentage > 70) score -= 8;

    // Interaction time impact
    if (metrics.interactionTime > 300) score -= 15;
    else if (metrics.interactionTime > 100) score -= 8;

    return Math.max(0, score);
  }, [metrics]);

  // Get performance status
  const getPerformanceStatus = (score: number) => {
    if (score >= 90)
      return {
        status: 'excellent',
        color: 'text-green-500',
        icon: CheckCircle,
      };
    if (score >= 70)
      return { status: 'good', color: 'text-blue-500', icon: CheckCircle };
    if (score >= 50)
      return { status: 'fair', color: 'text-yellow-500', icon: AlertTriangle };
    return { status: 'poor', color: 'text-red-500', icon: AlertTriangle };
  };

  const performanceStatus = getPerformanceStatus(performanceScore);
  const StatusIcon = performanceStatus.icon;

  // Format metrics for display
  const formattedMetrics = formatPerformanceMetrics(metrics);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Open Performance Dashboard"
      >
        <Activity size={20} />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{ width: isMinimized ? '300px' : '500px', maxHeight: '600px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <Activity size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Performance
          </h3>
          <div
            className={`flex items-center space-x-1 ${performanceStatus.color}`}
          >
            <StatusIcon size={16} />
            <span className="text-sm font-medium">{performanceScore}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isMinimized ? '⬆️' : '⬇️'}
          </button>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            {['overview', 'detailed', 'alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  selectedTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab}
                {tab === 'alerts' && alerts.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {selectedTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Performance Score */}
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div
                      className={`text-3xl font-bold ${performanceStatus.color}`}
                    >
                      {performanceScore}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {performanceStatus.status} Performance
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap size={16} className="text-blue-600" />
                        <span className="text-sm font-medium">FPS</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {metrics.fps}
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Cpu size={16} className="text-green-600" />
                        <span className="text-sm font-medium">Render</span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formattedMetrics.renderTime}
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <HardDrive size={16} className="text-purple-600" />
                        <span className="text-sm font-medium">Memory</span>
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        {metrics.memoryUsage?.percentage || 0}%
                      </div>
                    </div>

                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Network size={16} className="text-orange-600" />
                        <span className="text-sm font-medium">Network</span>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {networkInfo.effectiveType || 'N/A'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'detailed' && (
                <motion.div
                  key="detailed"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Detailed Metrics */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Render Time:</span>
                      <span className="text-sm">
                        {formattedMetrics.renderTime}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">FPS:</span>
                      <span className="text-sm">{formattedMetrics.fps}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Load Time:</span>
                      <span className="text-sm">
                        {formattedMetrics.loadTime}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Interaction Time:
                      </span>
                      <span className="text-sm">
                        {formattedMetrics.interactionTime}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory Usage:</span>
                      <span className="text-sm">
                        {formattedMetrics.memoryUsage}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Bundle Size:</span>
                      <span className="text-sm">
                        {(bundleMetrics.totalSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Resources:</span>
                      <span className="text-sm">
                        {bundleMetrics.resourceCount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Render Count:</span>
                      <span className="text-sm">{renderPerf.renderCount}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Avg Render Time:
                      </span>
                      <span className="text-sm">
                        {renderPerf.averageRenderTime.toFixed(2)}ms
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'alerts' && (
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckCircle
                        size={48}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <p>No performance alerts</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          alert.type === 'error'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                            : alert.type === 'warning'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setAlerts((prev) =>
                                prev.filter((a) => a.id !== alert.id)
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}
