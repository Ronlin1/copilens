"""Integration tests - test Copilens on real repository scenarios"""
import pytest
import tempfile
import os
from pathlib import Path
from git import Repo
from copilens.core.git_analyzer import GitAnalyzer
from copilens.core.enhanced_ai_detector import EnhancedAIDetector
from copilens.analyzers.risk import RiskAnalyzer


class TestRealWorldScenarios:
    """Test Copilens with realistic repository scenarios"""
    
    def setup_method(self):
        """Create a temporary git repository for testing"""
        self.temp_dir = tempfile.mkdtemp()
        self.repo = Repo.init(self.temp_dir)
        self.repo.config_writer().set_value("user", "name", "Test User").release()
        self.repo.config_writer().set_value("user", "email", "test@test.com").release()
    
    def teardown_method(self):
        """Clean up temporary repository"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_simple_human_commit(self):
        """Test detection on simple human-written changes"""
        # Create a simple file
        file_path = Path(self.temp_dir) / "test.py"
        file_path.write_text('''
def add(a, b):
    return a + b

x = 5
y = 10
result = add(x, y)
''')
        
        self.repo.index.add(['test.py'])
        self.repo.index.commit("Initial commit")
        
        # Make a simple change
        file_path.write_text('''
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

x = 5
y = 10
result = add(x, y)
''')
        
        # Analyze
        analyzer = GitAnalyzer(self.temp_dir)
        diffs = analyzer.get_diff()
        
        assert len(diffs) > 0
        
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage(
            diffs[0].diff_content,
            diffs[0].added_lines
        )
        
        # Simple addition should be low AI
        assert result.ai_percentage < 0.5
    
    def test_ai_generated_function_commit(self):
        """Test detection on typical AI-generated code"""
        file_path = Path(self.temp_dir) / "api.py"
        file_path.write_text("# placeholder")
        self.repo.index.add(['api.py'])
        self.repo.index.commit("Initial")
        
        # Add AI-like code
        ai_code = '''
from typing import List, Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)

def process_api_request(
    endpoint: str,
    data: Dict[str, Any],
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 30
) -> Optional[Dict[str, Any]]:
    """
    Process an API request with comprehensive error handling and validation.
    
    This function handles API requests with proper validation, error handling,
    and logging to ensure robust and reliable communication with external services.
    
    Args:
        endpoint: The API endpoint URL to send the request to
        data: Dictionary containing the request payload data
        headers: Optional custom headers for the request
        timeout: Request timeout in seconds (default: 30)
    
    Returns:
        Response data as dictionary or None if request fails
    
    Raises:
        ValueError: If endpoint or data is invalid
        APIError: If the API request fails
    """
    try:
        # Validate inputs
        if not endpoint:
            raise ValueError("Endpoint cannot be empty")
        
        if not isinstance(data, dict):
            raise ValueError("Data must be a dictionary")
        
        # Prepare headers
        if headers is None:
            headers = {}
        
        headers.setdefault("Content-Type", "application/json")
        
        # Make request
        logger.info(f"Sending request to {endpoint}")
        response = make_http_request(endpoint, data, headers, timeout)
        
        # Validate response
        if response is None:
            logger.error("Received null response")
            return None
        
        logger.info("Request completed successfully")
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise
    except Exception as e:
        logger.error(f"API request failed: {e}")
        raise APIError(f"Failed to process request: {e}")
'''
        file_path.write_text(ai_code)
        
        # Analyze
        analyzer = GitAnalyzer(self.temp_dir)
        diffs = analyzer.get_diff()
        
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage(
            diffs[0].diff_content,
            diffs[0].added_lines
        )
        
        # Should detect as AI-generated
        assert result.ai_percentage > 0.6
        assert result.confidence_level in ["medium", "high"]
        assert len(result.patterns) >= 3


class TestStressTesting:
    """Stress tests for Copilens"""
    
    def test_large_diff_performance(self):
        """Test performance with large diffs"""
        detector = EnhancedAIDetector()
        
        # Generate large code block
        large_code = "\n".join([
            f"def function_{i}():\n    return {i}"
            for i in range(1000)
        ])
        
        import time
        start = time.time()
        result = detector.calculate_ai_percentage(large_code, added_lines=2000)
        duration = time.time() - start
        
        # Should complete quickly (< 1 second)
        assert duration < 1.0
        assert result.ai_percentage >= 0
    
    def test_many_patterns_performance(self):
        """Test with code containing many patterns"""
        detector = EnhancedAIDetector()
        
        # Code with many patterns
        complex_code = '''
def handler_function(
    param1: List[str],
    param2: Dict[str, Any],
    param3: Optional[int] = None
) -> Tuple[bool, str]:
    """
    This is a very verbose docstring that explains every detail
    about what this function does, including all edge cases,
    parameters, return values, and implementation notes.
    """
    try:
        if param3 is not None:
            result = process_data(param1, param2)
        else:
            result = handle_default(param1)
        return (True, result)
    except ValueError as e:
        logging.error(f"Error: {e}")
        return (False, str(e))
    except Exception as e:
        raise ProcessingError(f"Failed: {e}")
'''
        
        import time
        start = time.time()
        result = detector.calculate_ai_percentage(complex_code, added_lines=20)
        duration = time.time() - start
        
        assert duration < 0.5
        assert len(result.patterns) > 0
    
    def test_special_characters_handling(self):
        """Test handling of special characters"""
        detector = EnhancedAIDetector()
        
        code_with_special = '''
def test():
    x = "String with 'quotes' and \\"escapes\\""
    regex = r"\\d+\\s*[a-zA-Z]+"
    unicode = "你好世界 🚀"
    return x + regex + unicode
'''
        
        # Should not crash
        result = detector.calculate_ai_percentage(code_with_special, added_lines=5)
        assert result.ai_percentage >= 0
    
    def test_edge_case_very_long_lines(self):
        """Test with very long lines"""
        detector = EnhancedAIDetector()
        
        long_line = "x = " + "1 + " * 1000 + "1"
        
        result = detector.calculate_ai_percentage(long_line, added_lines=1)
        assert result.ai_percentage >= 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
