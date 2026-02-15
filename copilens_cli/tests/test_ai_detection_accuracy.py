"""Comprehensive test suite for AI detection accuracy"""
import pytest
from copilens.core.enhanced_ai_detector import EnhancedAIDetector, AIDetectionResult


# Sample AI-generated code (typical patterns)
AI_GENERATED_SAMPLE_1 = '''
def process_user_data(
    user_id: int,
    data: Dict[str, Any],
    validate: bool = True
) -> Optional[Dict[str, Any]]:
    """
    Process user data with comprehensive validation and error handling.
    
    This function takes user data and processes it according to business rules.
    It performs validation, transformation, and returns the processed result.
    
    Args:
        user_id: The unique identifier for the user
        data: Dictionary containing user data to process
        validate: Whether to perform validation (default: True)
    
    Returns:
        Processed data dictionary or None if processing fails
    
    Raises:
        ValueError: If user_id is invalid
        ProcessingError: If data processing fails
    """
    try:
        # Validate user ID
        if user_id <= 0:
            raise ValueError("Invalid user ID")
        
        # Validate data if requested
        if validate:
            if not isinstance(data, dict):
                raise ValueError("Data must be a dictionary")
            
            # Check required fields
            required_fields = ["name", "email", "age"]
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"Missing required field: {field}")
        
        # Process the data
        result = {}
        result["user_id"] = user_id
        result["processed_at"] = datetime.now()
        result["data"] = data
        
        return result
        
    except ValueError as e:
        logging.error(f"Validation error: {e}")
        return None
    except Exception as e:
        logging.error(f"Processing error: {e}")
        raise ProcessingError(f"Failed to process data: {e}")
'''

AI_GENERATED_SAMPLE_2 = '''
class UserManager:
    """
    Comprehensive user management system with full CRUD operations.
    
    This class provides a complete interface for managing users including
    creation, retrieval, updates, and deletion with proper error handling.
    """
    
    def __init__(self, database: Database):
        """Initialize the user manager with a database connection."""
        self.database = database
        self.logger = logging.getLogger(__name__)
    
    def create_user(
        self,
        username: str,
        email: str,
        password: str
    ) -> Optional[User]:
        """
        Create a new user with validation and password hashing.
        
        Args:
            username: Unique username for the user
            email: Valid email address
            password: Plain text password to be hashed
        
        Returns:
            Created User object or None if creation fails
        """
        try:
            # Validate inputs
            if not self._validate_username(username):
                raise ValueError("Invalid username format")
            
            if not self._validate_email(email):
                raise ValueError("Invalid email format")
            
            # Hash password
            hashed_password = self._hash_password(password)
            
            # Create user
            user = User(
                username=username,
                email=email,
                password_hash=hashed_password
            )
            
            # Save to database
            self.database.save(user)
            
            return user
            
        except Exception as e:
            self.logger.error(f"User creation failed: {e}")
            return None
'''

# Sample human-written code (more organic, less perfect)
HUMAN_WRITTEN_SAMPLE_1 = '''
def calc_total(items):
    total = 0
    for item in items:
        total += item.price
    return total

def get_user(id):
    # quick lookup
    return db.query(User).filter(User.id==id).first()
'''

HUMAN_WRITTEN_SAMPLE_2 = '''
# TODO: refactor this mess
def process(data):
    res = []
    for d in data:
        if d.status == 'active':
            res.append(d)
    return res

# helper
def fmt(val):
    return str(val).strip()
'''


class TestEnhancedAIDetector:
    """Test suite for AI detection accuracy"""
    
    def test_detect_ai_generated_code_sample_1(self):
        """Test detection on typical AI-generated code"""
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage(
            AI_GENERATED_SAMPLE_1,
            added_lines=50,
            file_path="test.py"
        )
        
        # Should detect as likely AI
        assert result.ai_percentage > 0.6, f"Expected >60% AI, got {result.ai_percentage * 100}%"
        assert len(result.patterns) >= 3, "Should detect multiple patterns"
        assert result.confidence_level in ["medium", "high"]
    
    def test_detect_ai_generated_code_sample_2(self):
        """Test detection on class-based AI code"""
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage(
            AI_GENERATED_SAMPLE_2,
            added_lines=55,
            file_path="test.py"
        )
        
        assert result.ai_percentage > 0.6
        assert any(p.pattern_type == "verbose_comments" for p in result.patterns)
        assert any(p.pattern_type == "type_hints_everywhere" for p in result.patterns)
    
    def test_detect_human_written_code_sample_1(self):
        """Test detection on human-written code"""
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage(
            HUMAN_WRITTEN_SAMPLE_1,
            added_lines=8,
            file_path="test.py"
        )
        
        # Should detect as likely human
        assert result.ai_percentage < 0.5, f"Expected <50% AI, got {result.ai_percentage * 100}%"
        assert len(result.warnings) > 0  # Should warn about small sample
    
    def test_detect_human_written_code_sample_2(self):
        """Test detection on casual human code"""
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage(
            HUMAN_WRITTEN_SAMPLE_2,
            added_lines=12,
            file_path="test.py"
        )
        
        assert result.ai_percentage < 0.4
        # Human code has TODOs, short comments, inconsistent style
    
    def test_large_insertion_detection(self):
        """Test large code block detection"""
        detector = EnhancedAIDetector()
        code = "\n".join([f"line {i}" for i in range(100)])
        
        result = detector.calculate_ai_percentage(code, added_lines=100)
        
        assert any(p.pattern_type == "large_insertion" for p in result.patterns)
        assert result.ai_percentage > 0.5
    
    def test_type_hints_detection(self):
        """Test type hint pattern detection"""
        detector = EnhancedAIDetector()
        code = '''
def process(data: List[str], count: int) -> Dict[str, Any]:
    result: Dict[str, int] = {}
    items: Optional[List[str]] = None
    return result
'''
        result = detector.calculate_ai_percentage(code, added_lines=5)
        
        assert any(p.pattern_type == "type_hints_everywhere" for p in result.patterns)
    
    def test_verbose_comments_detection(self):
        """Test verbose documentation detection"""
        detector = EnhancedAIDetector()
        code = '''
def example():
    """
    This is an extremely verbose docstring that explains everything
    in great detail including all parameters, return values, exceptions,
    examples, and notes about implementation details that go on and on.
    """
    pass
'''
        result = detector.calculate_ai_percentage(code, added_lines=10)
        
        assert any(p.pattern_type == "verbose_comments" for p in result.patterns)
    
    def test_small_change_warning(self):
        """Test warning for small changes"""
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage("x = 1", added_lines=1)
        
        assert result.confidence_level == "low"
        assert len(result.warnings) > 0
        assert "small change" in result.warnings[0].lower()
    
    def test_non_code_file_warning(self):
        """Test warning for non-code files"""
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage(
            "# README\nSome text",
            added_lines=2,
            file_path="README.md"
        )
        
        assert any("non-code" in w.lower() for w in result.warnings)
    
    def test_confidence_levels(self):
        """Test confidence level calculation"""
        detector = EnhancedAIDetector()
        
        # High confidence (many patterns)
        result = detector.calculate_ai_percentage(AI_GENERATED_SAMPLE_1, added_lines=50)
        assert result.confidence_level == "high"
        
        # Low confidence (few patterns)
        result = detector.calculate_ai_percentage("x = 1\ny = 2", added_lines=2)
        assert result.confidence_level == "low"
    
    def test_metadata_completeness(self):
        """Test metadata is properly populated"""
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage(
            "code here",
            added_lines=10,
            file_path="test.py"
        )
        
        assert "added_lines" in result.metadata
        assert "pattern_count" in result.metadata
        assert "file_path" in result.metadata
        assert result.metadata["added_lines"] == 10


class TestAIDetectionAccuracy:
    """Test overall accuracy and edge cases"""
    
    def test_mixed_code_detection(self):
        """Test code with both AI and human characteristics"""
        detector = EnhancedAIDetector()
        mixed_code = '''
def process(data):
    """Process data."""
    # quick fix
    res = []
    for item in data:
        if item.valid:
            res.append(item)
    return res
'''
        result = detector.calculate_ai_percentage(mixed_code, added_lines=10)
        
        # Should be somewhere in the middle
        assert 0.2 <= result.ai_percentage <= 0.7
    
    def test_edge_case_empty_code(self):
        """Test empty code handling"""
        detector = EnhancedAIDetector()
        result = detector.calculate_ai_percentage("", added_lines=0)
        
        assert result.ai_percentage == 0.0
        assert result.confidence_level == "high"
    
    def test_edge_case_only_comments(self):
        """Test code with only comments"""
        detector = EnhancedAIDetector()
        code = "# Comment 1\n# Comment 2\n# Comment 3"
        result = detector.calculate_ai_percentage(code, added_lines=3)
        
        assert result.ai_percentage < 0.5


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
