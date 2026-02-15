"""
Alert Manager for Copilens Monitoring
Sends notifications via multiple channels
"""

import os
from enum import Enum
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from pathlib import Path


class AlertChannel(Enum):
    """Alert notification channels"""
    EMAIL = "email"
    SLACK = "slack"
    DISCORD = "discord"
    WEBHOOK = "webhook"
    CONSOLE = "console"


class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class Alert:
    """Alert notification"""
    title: str
    message: str
    severity: AlertSeverity
    timestamp: datetime = None
    url: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.metadata is None:
            self.metadata = {}


class AlertManager:
    """Manages alerts and notifications"""
    
    def __init__(self):
        self.channels: List[AlertChannel] = []
        self.config = self._load_config()
        self.alert_history: List[Alert] = []
        
        # Enable console by default
        self.channels.append(AlertChannel.CONSOLE)
    
    def add_channel(self, channel: AlertChannel):
        """Add notification channel"""
        if channel not in self.channels:
            self.channels.append(channel)
    
    def send_alert(self, alert: Alert):
        """Send alert through all configured channels"""
        self.alert_history.append(alert)
        
        for channel in self.channels:
            try:
                if channel == AlertChannel.CONSOLE:
                    self._send_console(alert)
                elif channel == AlertChannel.SLACK:
                    self._send_slack(alert)
                elif channel == AlertChannel.DISCORD:
                    self._send_discord(alert)
                elif channel == AlertChannel.WEBHOOK:
                    self._send_webhook(alert)
                elif channel == AlertChannel.EMAIL:
                    self._send_email(alert)
            except Exception:
                pass
    
    def _send_console(self, alert: Alert):
        """Print alert to console"""
        icon = {
            AlertSeverity.INFO: "ℹ️",
            AlertSeverity.WARNING: "⚠️",
            AlertSeverity.CRITICAL: "🚨"
        }[alert.severity]
        
        print(f"\n{icon} {alert.title}")
        print(f"   {alert.message}")
        if alert.url:
            print(f"   URL: {alert.url}")
        print()
    
    def _send_slack(self, alert: Alert):
        """Send alert to Slack"""
        webhook_url = self.config.get('slack_webhook')
        if not webhook_url:
            return
        
        try:
            from slack_sdk.webhook import WebhookClient
            
            color = {
                AlertSeverity.INFO: "#36a64f",
                AlertSeverity.WARNING: "#ff9900",
                AlertSeverity.CRITICAL: "#ff0000"
            }[alert.severity]
            
            client = WebhookClient(webhook_url)
            response = client.send(
                text=alert.title,
                attachments=[{
                    "color": color,
                    "title": alert.title,
                    "text": alert.message,
                    "fields": [
                        {
                            "title": "URL",
                            "value": alert.url,
                            "short": False
                        }
                    ] if alert.url else [],
                    "footer": "Copilens Monitor",
                    "ts": int(alert.timestamp.timestamp())
                }]
            )
        except Exception:
            pass
    
    def _send_discord(self, alert: Alert):
        """Send alert to Discord"""
        webhook_url = self.config.get('discord_webhook')
        if not webhook_url:
            return
        
        try:
            from discord_webhook import DiscordWebhook, DiscordEmbed
            
            webhook = DiscordWebhook(url=webhook_url)
            
            color = {
                AlertSeverity.INFO: "03b2f8",
                AlertSeverity.WARNING: "ff9900",
                AlertSeverity.CRITICAL: "ff0000"
            }[alert.severity]
            
            embed = DiscordEmbed(
                title=alert.title,
                description=alert.message,
                color=color
            )
            
            if alert.url:
                embed.add_embed_field(name="URL", value=alert.url)
            
            embed.set_footer(text="Copilens Monitor")
            embed.set_timestamp()
            
            webhook.add_embed(embed)
            webhook.execute()
        except Exception:
            pass
    
    def _send_webhook(self, alert: Alert):
        """Send alert to custom webhook"""
        webhook_url = self.config.get('webhook_url')
        if not webhook_url:
            return
        
        try:
            import requests
            
            payload = {
                'title': alert.title,
                'message': alert.message,
                'severity': alert.severity.value,
                'timestamp': alert.timestamp.isoformat(),
                'url': alert.url,
                'metadata': alert.metadata
            }
            
            requests.post(
                webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
        except Exception:
            pass
    
    def _send_email(self, alert: Alert):
        """Send alert via email (placeholder)"""
        # Would need SMTP configuration
        # For now, just log
        pass
    
    def _load_config(self) -> Dict[str, str]:
        """Load alert configuration"""
        config_file = Path.home() / '.copilens' / 'alerts_config.json'
        
        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    return json.load(f)
            except Exception:
                pass
        
        return {}
    
    def configure_slack(self, webhook_url: str):
        """Configure Slack webhook"""
        self.config['slack_webhook'] = webhook_url
        self._save_config()
        self.add_channel(AlertChannel.SLACK)
    
    def configure_discord(self, webhook_url: str):
        """Configure Discord webhook"""
        self.config['discord_webhook'] = webhook_url
        self._save_config()
        self.add_channel(AlertChannel.DISCORD)
    
    def configure_webhook(self, webhook_url: str):
        """Configure custom webhook"""
        self.config['webhook_url'] = webhook_url
        self._save_config()
        self.add_channel(AlertChannel.WEBHOOK)
    
    def _save_config(self):
        """Save alert configuration"""
        config_file = Path.home() / '.copilens' / 'alerts_config.json'
        config_file.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            with open(config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception:
            pass
    
    def get_recent_alerts(self, count: int = 10) -> List[Alert]:
        """Get recent alerts"""
        return self.alert_history[-count:]
