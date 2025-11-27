'use client';

import React from 'react';
import { Users, MessageSquare, Globe, TrendingUp } from 'lucide-react';
import { MetricCard } from './ui/MetricCard';

export function HeroMetrics() {
  return (
    <section className="echo-section">
      <div className="echo-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] bg-clip-text text-transparent mb-4">
            Join the Echo Community
          </h2>
          <p className="text-lg text-[var(--echo-text-secondary)] max-w-2xl mx-auto">
            Connect with millions of users worldwide, share your voice, and discover amazing content
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={Users}
            number="2.5M+"
            label="Active Users"
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />
          <MetricCard
            icon={MessageSquare}
            number="50M+"
            label="Posts Shared"
            trend={{ value: 25, isPositive: true }}
            delay={0.1}
          />
          <MetricCard
            icon={Globe}
            number="150+"
            label="Countries"
            trend={{ value: 8, isPositive: true }}
            delay={0.2}
          />
          <MetricCard
            icon={TrendingUp}
            number="98%"
            label="Satisfaction Rate"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}
