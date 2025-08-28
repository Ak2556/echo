import React, { useEffect, useState } from 'react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const response = await fetch('/api/analytics/overview');
    const data = await response.json();
    setAnalytics(data);
  };

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Daily Active Users</h3>
          <p className="text-3xl font-bold">{analytics.daily_active_users}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Total Sessions</h3>
          <p className="text-3xl font-bold">{analytics.total_sessions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Conversion Rate</h3>
          <p className="text-3xl font-bold">{analytics.conversion_rate}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Bounce Rate</span>
              <span>{analytics.bounce_rate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded">
              <div className="bg-blue-500 h-2 rounded" style={{width: analytics.bounce_rate + '%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Engagement Rate</span>
              <span>65.4%</span>
            </div>
            <div className="w-full bg-gray-200 rounded">
              <div className="bg-green-500 h-2 rounded" style={{width: '65.4%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
