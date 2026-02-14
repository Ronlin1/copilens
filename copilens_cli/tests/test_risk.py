"""Tests for risk analyzer"""
import pytest
from copilens.analyzers.risk import RiskAnalyzer


def test_high_ai_risk():
    """Test high AI contribution risk"""
    analyzer = RiskAnalyzer()
    
    risk = analyzer.calculate_risk(
        ai_percentage=0.8,
        complexity_delta=5,
        added_lines=50,
        file_path="test.py",
        has_tests=True
    )
    
    assert risk.total_score > 2.0
    assert any(f.name == "High AI Contribution" for f in risk.factors)


def test_complexity_risk():
    """Test complexity increase risk"""
    analyzer = RiskAnalyzer()
    
    risk = analyzer.calculate_risk(
        ai_percentage=0.3,
        complexity_delta=25,
        added_lines=100,
        file_path="test.py",
        has_tests=True
    )
    
    assert any(f.name == "High Complexity Increase" for f in risk.factors)


def test_security_sensitive_file():
    """Test security-sensitive file detection"""
    analyzer = RiskAnalyzer()
    
    risk = analyzer.calculate_risk(
        ai_percentage=0.5,
        complexity_delta=5,
        added_lines=50,
        file_path="auth.py",
        has_tests=True
    )
    
    assert any(f.name == "Security-Sensitive File" for f in risk.factors)
    assert risk.total_score >= 3.0


def test_low_risk():
    """Test low risk scenario"""
    analyzer = RiskAnalyzer()
    
    risk = analyzer.calculate_risk(
        ai_percentage=0.2,
        complexity_delta=2,
        added_lines=20,
        file_path="utils.py",
        has_tests=True
    )
    
    assert risk.level == "low"
