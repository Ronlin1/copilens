"""
Health Checker for Deployed Applications
"""

import time
import requests
from enum import Enum
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
from pathlib import Path


class HealthStatus(Enum):
    """Health check status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    UNKNOWN = "unknown"


@dataclass
class HealthCheckResult:
    """Result of health check"""
    url: str
    status: HealthStatus
    response_time_ms: float
    status_code: Optional[int] = None
    error: Optional[str] = None
    timestamp: datetime = None
    headers: Dict[str, str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.headers is None:
            self.headers = {}


class HealthChecker:
    """Monitors health of deployed applications"""
    
    def __init__(self, url: str, interval: int = 60):
        self.url = url
        self.interval = interval  # seconds
        self.history: List[HealthCheckResult] = []
        self.state_file = Path.home() / '.copilens' / 'monitoring.json'
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Load history
        self._load_history()
    
    def check_health(self, timeout: int = 10) -> HealthCheckResult:
        """Perform health check"""
        start_time = time.time()
        
        try:
            response = requests.get(
                self.url,
                timeout=timeout,
                headers={'User-Agent': 'Copilens-Monitor/1.0'}
            )
            
            response_time = (time.time() - start_time) * 1000
            
            # Determine status
            if response.status_code == 200:
                status = HealthStatus.HEALTHY
            elif 200 <= response.status_code < 300:
                status = HealthStatus.HEALTHY
            elif 300 <= response.status_code < 500:
                status = HealthStatus.DEGRADED
            else:
                status = HealthStatus.DOWN
            
            result = HealthCheckResult(
                url=self.url,
                status=status,
                response_time_ms=response_time,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        
        except requests.exceptions.Timeout:
            result = HealthCheckResult(
                url=self.url,
                status=HealthStatus.DOWN,
                response_time_ms=timeout * 1000,
                error="Request timeout"
            )
        
        except requests.exceptions.ConnectionError:
            result = HealthCheckResult(
                url=self.url,
                status=HealthStatus.DOWN,
                response_time_ms=0,
                error="Connection error"
            )
        
        except Exception as e:
            result = HealthCheckResult(
                url=self.url,
                status=HealthStatus.UNKNOWN,
                response_time_ms=0,
                error=str(e)
            )
        
        # Add to history
        self.history.append(result)
        
        # Keep only last 1000 checks
        if len(self.history) > 1000:
            self.history = self.history[-1000:]
        
        # Save history
        self._save_history()
        
        return result
    
    def get_uptime_percentage(self, hours: int = 24) -> float:
        """Calculate uptime percentage"""
        if not self.history:
            return 0.0
        
        cutoff = datetime.now() - timedelta(hours=hours)
        recent_checks = [
            c for c in self.history 
            if c.timestamp >= cutoff
        ]
        
        if not recent_checks:
            return 0.0
        
        healthy_checks = sum(
            1 for c in recent_checks 
            if c.status == HealthStatus.HEALTHY
        )
        
        return (healthy_checks / len(recent_checks)) * 100
    
    def get_average_response_time(self, hours: int = 24) -> float:
        """Calculate average response time"""
        if not self.history:
            return 0.0
        
        cutoff = datetime.now() - timedelta(hours=hours)
        recent_checks = [
            c for c in self.history 
            if c.timestamp >= cutoff and c.status == HealthStatus.HEALTHY
        ]
        
        if not recent_checks:
            return 0.0
        
        return sum(c.response_time_ms for c in recent_checks) / len(recent_checks)
    
    def detect_anomaly(self) -> bool:
        """Detect if current response time is anomalous"""
        if len(self.history) < 10:
            return False
        
        # Get last 10 response times
        recent = self.history[-10:]
        healthy_recent = [
            c.response_time_ms for c in recent 
            if c.status == HealthStatus.HEALTHY
        ]
        
        if len(healthy_recent) < 5:
            return True  # Too many failures
        
        avg = sum(healthy_recent) / len(healthy_recent)
        latest = self.history[-1].response_time_ms
        
        # Anomaly if 3x slower than average
        return latest > avg * 3
    
    def get_current_status(self) -> HealthStatus:
        """Get current status"""
        if not self.history:
            return HealthStatus.UNKNOWN
        
        return self.history[-1].status
    
    def get_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Get monitoring statistics"""
        return {
            'url': self.url,
            'current_status': self.get_current_status().value,
            'uptime_percentage': self.get_uptime_percentage(hours),
            'average_response_time_ms': self.get_average_response_time(hours),
            'total_checks': len(self.history),
            'recent_checks': len([
                c for c in self.history 
                if c.timestamp >= datetime.now() - timedelta(hours=hours)
            ]),
            'last_check': self.history[-1].timestamp.isoformat() if self.history else None
        }
    
    def _save_history(self):
        """Save monitoring history"""
        try:
            data = {
                'url': self.url,
                'history': [
                    {
                        'url': c.url,
                        'status': c.status.value,
                        'response_time_ms': c.response_time_ms,
                        'status_code': c.status_code,
                        'error': c.error,
                        'timestamp': c.timestamp.isoformat()
                    }
                    for c in self.history[-100:]  # Save only last 100
                ]
            }
            
            with open(self.state_file, 'w') as f:
                json.dump(data, f, indent=2)
        
        except Exception:
            pass
    
    def _load_history(self):
        """Load monitoring history"""
        try:
            if self.state_file.exists():
                with open(self.state_file, 'r') as f:
                    data = json.load(f)
                    
                    if data.get('url') == self.url:
                        self.history = [
                            HealthCheckResult(
                                url=c['url'],
                                status=HealthStatus(c['status']),
                                response_time_ms=c['response_time_ms'],
                                status_code=c.get('status_code'),
                                error=c.get('error'),
                                timestamp=datetime.fromisoformat(c['timestamp'])
                            )
                            for c in data.get('history', [])
                        ]
        except Exception:
            pass
