"""Test runner script for comprehensive testing"""
import subprocess
import sys


def run_tests():
    """Run all test suites"""
    print("=" * 70)
    print("COPILENS - COMPREHENSIVE TEST SUITE")
    print("=" * 70)
    print()
    
    test_suites = [
        ("AI Detection Accuracy Tests", "tests/test_ai_detection_accuracy.py"),
        ("Integration Tests", "tests/test_integration.py"),
        ("Risk Analysis Tests", "tests/test_risk.py"),
        ("Configuration Tests", "tests/test_config.py"),
        ("Original AI Detector Tests", "tests/test_ai_detector.py"),
    ]
    
    results = {}
    
    for name, path in test_suites:
        print(f"\n{'=' * 70}")
        print(f"Running: {name}")
        print(f"{'=' * 70}\n")
        
        result = subprocess.run(
            ["pytest", path, "-v", "--tb=short"],
            capture_output=False
        )
        
        results[name] = "PASSED" if result.returncode == 0 else "FAILED"
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    for name, status in results.items():
        status_color = "\033[92m" if status == "PASSED" else "\033[91m"
        print(f"{status_color}{status}\033[0m - {name}")
    
    print("=" * 70)
    
    # Return exit code
    all_passed = all(status == "PASSED" for status in results.values())
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(run_tests())
