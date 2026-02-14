"""Tests for AI detector"""
import pytest
from copilens.core.ai_detector import AIDetector


def test_large_insertion_detection():
    """Test detection of large code insertions"""
    detector = AIDetector()
    
    code = "\n".join([f"line {i}" for i in range(60)])
    patterns = detector.detect_ai_patterns(code, 60)
    
    assert len(patterns) > 0
    assert any(p.pattern_type == "large_insertion" for p in patterns)


def test_boilerplate_detection():
    """Test boilerplate pattern detection"""
    detector = AIDetector()
    
    code = '''
    """
    This is a docstring
    """
    def main():
        # TODO: Implement this
        pass
    
    if __name__ == "__main__":
        main()
    '''
    
    patterns = detector.detect_ai_patterns(code, 10)
    
    assert any(p.pattern_type == "boilerplate" for p in patterns)


def test_ai_percentage_calculation():
    """Test AI percentage calculation"""
    detector = AIDetector()
    
    code = "\n".join([f"def function_{i}(): pass" for i in range(20)])
    ai_percentage = detector.calculate_ai_percentage(code, 20)
    
    assert 0.0 <= ai_percentage <= 1.0
    assert ai_percentage > 0.1  # Should detect some AI patterns
