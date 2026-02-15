"""Configuration management"""
import json
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field


class CopilensConfig(BaseModel):
    """Copilens configuration"""
    version: str = "0.1.0"
    ai_threshold: float = Field(default=0.5, ge=0.0, le=1.0)
    risk_threshold: float = Field(default=3.0, ge=0.0, le=5.0)
    complexity_threshold: int = Field(default=10, ge=1)
    track_trends: bool = True
    output_format: str = "rich"  # rich, json, csv


class ConfigManager:
    """Manages Copilens configuration"""
    
    CONFIG_FILE = ".copilens.json"
    
    def __init__(self, repo_path: Optional[str] = None):
        self.repo_path = Path(repo_path or Path.cwd())
        self.config_path = self.repo_path / self.CONFIG_FILE
        self.config = self.load()
    
    def load(self) -> CopilensConfig:
        """Load configuration from file"""
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r') as f:
                    data = json.load(f)
                return CopilensConfig(**data)
            except Exception:
                return CopilensConfig()
        return CopilensConfig()
    
    def save(self, config: Optional[CopilensConfig] = None) -> None:
        """Save configuration to file"""
        cfg = config or self.config
        with open(self.config_path, 'w') as f:
            json.dump(cfg.model_dump(), f, indent=2)
    
    def init_config(self) -> None:
        """Initialize default configuration"""
        self.config = CopilensConfig()
        self.save()
