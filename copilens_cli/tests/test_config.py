"""Tests for configuration management"""
import pytest
import tempfile
from pathlib import Path
from copilens.core.config import ConfigManager, CopilensConfig


def test_default_config():
    """Test default configuration"""
    config = CopilensConfig()
    
    assert config.version == "0.1.0"
    assert config.ai_threshold == 0.5
    assert config.risk_threshold == 3.0
    assert config.track_trends is True


def test_config_save_load():
    """Test saving and loading configuration"""
    with tempfile.TemporaryDirectory() as tmpdir:
        manager = ConfigManager(tmpdir)
        manager.init_config()
        
        # Modify config
        manager.config.ai_threshold = 0.7
        manager.save()
        
        # Load config
        new_manager = ConfigManager(tmpdir)
        assert new_manager.config.ai_threshold == 0.7
