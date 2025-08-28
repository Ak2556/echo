#!/usr/bin/env python3
"""
Echo Performance Monitor
Real-time performance monitoring dashboard for the optimized Echo application.
"""

import asyncio
import aiohttp
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, List
import argparse

class PerformanceMonitor:
    def __init__(self, backend_url: str = "http://localhost:8000", frontend_url: str = "http://localhost:3000"):
        self.backend_url = backend_url
        self.frontend_url = frontend_url
        self.session = None
        self.metrics_history: List[Dict[str, Any]] = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def check_health(self) -> Dict[str, Any]:
        """Check application health status."""
        health_status = {
            "timestamp": datetime.now().isoformat(),
            "backend": {"status": "unknown", "response_time": None},
            "frontend": {"status": "unknown", "response_time": None},
            "redis": {"status": "unknown"}
        }
        
        # Check backend health
        try:
            start_time = time.time()
            async with self.session.get(f"{self.backend_url}/health", timeout=5) as response:
                response_time = (time.time() - start_time) * 1000
                if response.status == 200:
                    data = await response.json()
                    health_status["backend"] = {
                        "status": "healthy",
                        "response_time": round(response_time, 2),
                        "redis": data.get("redis", False)
                    }
                    health_status["redis"]["status"] = "healthy" if data.get("redis") else "unhealthy"
                else:
                    health_status["backend"]["status"] = "unhealthy"
        except Exception as e:
            health_status["backend"]["status"] = "error"
            health_status["backend"]["error"] = str(e)
        
        # Check frontend health
        try:
            start_time = time.time()
            async with self.session.get(self.frontend_url, timeout=5) as response:
                response_time = (time.time() - start_time) * 1000
                if response.status == 200:
                    health_status["frontend"] = {
                        "status": "healthy",
                        "response_time": round(response_time, 2)
                    }
                else:
                    health_status["frontend"]["status"] = "unhealthy"
        except Exception as e:
            health_status["frontend"]["status"] = "error"
            health_status["frontend"]["error"] = str(e)
        
        return health_status
    
    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get detailed performance statistics."""
        try:
            async with self.session.get(f"{self.backend_url}/api/performance/stats", timeout=5) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": f"HTTP {response.status}"}
        except Exception as e:
            return {"error": str(e)}
    
    async def test_api_endpoints(self) -> Dict[str, Any]:
        """Test various API endpoints for performance."""
        endpoints = [
            ("/", "Root"),
            ("/api/ai/models", "AI Models"),
            ("/api/ai/personalities", "AI Personalities"),
            ("/api/languages", "Languages"),
            ("/api/posts", "Posts")
        ]
        
        results = {}
        
        for endpoint, name in endpoints:
            try:
                start_time = time.time()
                async with self.session.get(f"{self.backend_url}{endpoint}", timeout=5) as response:
                    response_time = (time.time() - start_time) * 1000
                    results[name] = {
                        "status": response.status,
                        "response_time": round(response_time, 2),
                        "cached": "X-Cache-Status" in response.headers
                    }
            except Exception as e:
                results[name] = {
                    "status": "error",
                    "error": str(e)
                }
        
        return results
    
    def format_health_status(self, health: Dict[str, Any]) -> str:
        """Format health status for display."""
        output = []
        output.append("🏥 HEALTH STATUS")
        output.append("=" * 50)
        
        # Backend status
        backend = health["backend"]
        status_icon = "✅" if backend["status"] == "healthy" else "❌"
        output.append(f"{status_icon} Backend: {backend['status'].upper()}")
        if backend.get("response_time"):
            output.append(f"   Response Time: {backend['response_time']}ms")
        if backend.get("error"):
            output.append(f"   Error: {backend['error']}")
        
        # Frontend status
        frontend = health["frontend"]
        status_icon = "✅" if frontend["status"] == "healthy" else "❌"
        output.append(f"{status_icon} Frontend: {frontend['status'].upper()}")
        if frontend.get("response_time"):
            output.append(f"   Response Time: {frontend['response_time']}ms")
        if frontend.get("error"):
            output.append(f"   Error: {frontend['error']}")
        
        # Redis status
        redis = health["redis"]
        status_icon = "✅" if redis["status"] == "healthy" else "❌"
        output.append(f"{status_icon} Redis: {redis['status'].upper()}")
        
        return "\\n".join(output)
    
    def format_performance_stats(self, stats: Dict[str, Any]) -> str:
        """Format performance statistics for display."""
        if "error" in stats:
            return f"❌ Performance Stats Error: {stats['error']}"
        
        output = []
        output.append("📊 PERFORMANCE STATISTICS")
        output.append("=" * 50)
        
        for endpoint, data in stats.items():
            output.append(f"🔗 {endpoint}")
            output.append(f"   Requests: {data.get('count', 0)}")
            output.append(f"   Avg Time: {data.get('avg_time', 0):.2f}ms")
            output.append(f"   Min Time: {data.get('min_time', 0):.2f}ms")
            output.append(f"   Max Time: {data.get('max_time', 0):.2f}ms")
            output.append(f"   P95 Time: {data.get('p95_time', 0):.2f}ms")
            output.append("")
        
        return "\\n".join(output)
    
    def format_endpoint_tests(self, results: Dict[str, Any]) -> str:
        """Format endpoint test results for display."""
        output = []
        output.append("🧪 ENDPOINT PERFORMANCE TESTS")
        output.append("=" * 50)
        
        for name, data in results.items():
            if data.get("status") == "error":
                output.append(f"❌ {name}: ERROR - {data.get('error', 'Unknown error')}")
            else:
                status_icon = "✅" if data["status"] == 200 else "⚠️"
                cache_icon = "💾" if data.get("cached") else "🔄"
                output.append(f"{status_icon} {name}: {data['status']} - {data['response_time']}ms {cache_icon}")
        
        return "\\n".join(output)
    
    async def run_single_check(self):
        """Run a single performance check."""
        print("🔍 Running Echo Performance Check...")
        print()
        
        # Health check
        health = await self.check_health()
        print(self.format_health_status(health))
        print()
        
        # Performance stats
        stats = await self.get_performance_stats()
        print(self.format_performance_stats(stats))
        print()
        
        # Endpoint tests
        endpoint_results = await self.test_api_endpoints()
        print(self.format_endpoint_tests(endpoint_results))
        print()
        
        # Summary
        backend_healthy = health["backend"]["status"] == "healthy"
        frontend_healthy = health["frontend"]["status"] == "healthy"
        redis_healthy = health["redis"]["status"] == "healthy"
        
        if backend_healthy and frontend_healthy and redis_healthy:
            print("🎉 All systems are healthy and performing well!")
        else:
            print("⚠️  Some systems need attention. Check the details above.")
    
    async def run_continuous_monitoring(self, interval: int = 30):
        """Run continuous performance monitoring."""
        print(f"🔄 Starting continuous monitoring (checking every {interval}s)")
        print("Press Ctrl+C to stop")
        print()
        
        try:
            while True:
                # Clear screen
                print("\\033[2J\\033[H", end="")
                
                # Show timestamp
                print(f"📅 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print()
                
                # Run checks
                health = await self.check_health()
                stats = await self.get_performance_stats()
                endpoint_results = await self.test_api_endpoints()
                
                # Store metrics
                self.metrics_history.append({
                    "timestamp": time.time(),
                    "health": health,
                    "stats": stats,
                    "endpoints": endpoint_results
                })
                
                # Keep only last 100 entries
                if len(self.metrics_history) > 100:
                    self.metrics_history = self.metrics_history[-100:]
                
                # Display results
                print(self.format_health_status(health))
                print()
                print(self.format_endpoint_tests(endpoint_results))
                print()
                
                # Show trend
                if len(self.metrics_history) > 1:
                    prev_health = self.metrics_history[-2]["health"]
                    current_health = health
                    
                    backend_trend = "📈" if (current_health["backend"].get("response_time", 0) < 
                                           prev_health["backend"].get("response_time", float('inf'))) else "📉"
                    frontend_trend = "📈" if (current_health["frontend"].get("response_time", 0) < 
                                            prev_health["frontend"].get("response_time", float('inf'))) else "📉"
                    
                    print(f"📊 Performance Trends: Backend {backend_trend} Frontend {frontend_trend}")
                    print()
                
                print(f"⏰ Next check in {interval} seconds...")
                
                # Wait for next check
                await asyncio.sleep(interval)
                
        except KeyboardInterrupt:
            print("\\n🛑 Monitoring stopped by user")

async def main():
    parser = argparse.ArgumentParser(description="Echo Performance Monitor")
    parser.add_argument("--backend", default="http://localhost:8000", help="Backend URL")
    parser.add_argument("--frontend", default="http://localhost:3000", help="Frontend URL")
    parser.add_argument("--continuous", "-c", action="store_true", help="Run continuous monitoring")
    parser.add_argument("--interval", "-i", type=int, default=30, help="Monitoring interval in seconds")
    
    args = parser.parse_args()
    
    async with PerformanceMonitor(args.backend, args.frontend) as monitor:
        if args.continuous:
            await monitor.run_continuous_monitoring(args.interval)
        else:
            await monitor.run_single_check()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\n👋 Goodbye!")
        sys.exit(0)