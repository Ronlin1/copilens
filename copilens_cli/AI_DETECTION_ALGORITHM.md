# Copilens AI Detection Algorithm - Technical Documentation

## Overview

Copilens uses a **heuristic pattern-matching algorithm** to detect AI-generated code. It is NOT a machine learning model but rather a rule-based system that identifies common characteristics of AI-generated code.

## ⚠️ Important Disclaimers

1. **Not 100% Accurate**: AI detection is probabilistic and can produce false positives/negatives
2. **Pattern-Based**: Relies on common AI coding patterns, not deep learning
3. **Best for Large Changes**: More accurate with 20+ lines of code
4. **Context-Dependent**: Accuracy varies by programming language and coding style
5. **Continuously Learning**: Patterns are updated based on research and feedback

## Detection Algorithm

### Core Methodology

The algorithm assigns **confidence scores** (0.0 - 1.0) based on detected patterns:

```
AI_Percentage = WeightedAverage(Pattern_Confidences) + Adjustments
Confidence_Level = Function(Pattern_Count, AI_Percentage, Code_Size)
```

### Detected Patterns

#### 1. Large Code Insertions (Weight: 0.8)
- **Trigger**: 50+ lines added in one block
- **Rationale**: AI often generates complete implementations at once
- **Confidence**: 60-90% depending on size
- **Example**: Adding an entire class or module

#### 2. Verbose Documentation (Weight: 0.6)
- **Trigger**: Docstrings > 100 characters, detailed comments
- **Rationale**: AI generates comprehensive documentation
- **Confidence**: 50-85%
- **Patterns**:
  ```python
  """
  Very detailed docstring explaining everything including
  parameters, return values, exceptions, examples, notes...
  """
  ```

#### 3. Extensive Type Hints (Weight: 0.7)
- **Trigger**: Type hints on parameters, returns, variables
- **Rationale**: AI consistently uses type annotations
- **Confidence**: 60-80%
- **Patterns**:
  ```python
  def func(x: List[str], y: Dict[str, Any]) -> Optional[int]:
  ```

#### 4. Comprehensive Error Handling (Weight: 0.5)
- **Trigger**: Multiple try-except blocks, detailed error handling
- **Rationale**: AI generates thorough error handling
- **Confidence**: 55-75%
- **Patterns**:
  ```python
  try:
      # code
  except SpecificError as e:
      logger.error(f"Error: {e}")
  except Exception as e:
      raise CustomError(f"Failed: {e}")
  ```

#### 5. Generic Helper Names (Weight: 0.5)
- **Trigger**: Functions named `process_*`, `handle_*`, `validate_*`
- **Rationale**: AI uses predictable naming patterns
- **Confidence**: 45-65%
- **Examples**: `process_data()`, `handle_request()`, `validate_input()`

#### 6. Consistent Code Style (Weight: 0.6)
- **Trigger**: Unusual consistency in formatting
- **Rationale**: AI code is more uniform than human code
- **Confidence**: 50-70%
- **Measures**: Indentation consistency, line length variance

#### 7. Generic Variable Names (Weight: 0.3)
- **Trigger**: Variables like `data`, `result`, `output`, `value`
- **Rationale**: AI uses common generic names
- **Confidence**: 30-50%
- **Lower weight**: Common in both AI and human code

### Confidence Levels

Results include a confidence level:

- **High**: 4+ patterns detected, 60%+ AI score, 20+ lines
- **Medium**: 2-3 patterns detected, OR 40-60% AI score
- **Low**: <2 patterns, OR <10 lines, OR non-code file

### Warnings

The system provides warnings for:
- Very small changes (<10 lines) - "Difficult to accurately assess"
- No patterns detected - "Low confidence estimate"
- Non-code files (.md, .json, etc.) - "AI detection may be inaccurate"

## Accuracy Benchmarks

Based on our test suite:

| Scenario | Accuracy | Notes |
|----------|----------|-------|
| AI-generated (50+ lines) | ~80-90% | High confidence |
| AI-generated (10-50 lines) | ~70-80% | Medium confidence |
| Human-written (casual style) | ~75-85% | Correctly identifies as human |
| Mixed AI/Human | ~60-70% | Variable results |
| Very small changes (<10 lines) | ~50-60% | Low confidence |

## Limitations

### Known False Positives
- Well-documented human code may score high
- Enterprise code with strict style guides
- Code following best practices extensively

### Known False Negatives
- AI code edited by humans
- AI code with intentionally casual style
- Very small AI-generated snippets

### Not Detected
- AI-assisted code (human with AI suggestions)
- Degree of AI contribution (can't distinguish 50% vs 100% AI)
- Specific AI model used (GPT vs Copilot vs Claude)

## Validation & Testing

### Test Coverage
1. **Unit Tests**: 15+ tests for pattern detection
2. **Integration Tests**: Real repository scenarios
3. **Accuracy Tests**: Known AI vs human samples
4. **Stress Tests**: Performance with large diffs
5. **Edge Cases**: Special characters, empty files, etc.

### Running Tests
```bash
cd copilens_cli
pytest tests/test_ai_detection_accuracy.py -v
pytest tests/test_integration.py -v
```

## Improving Accuracy

Users can improve results by:
1. Using `--staged` to analyze specific changes
2. Reviewing files with "low confidence" warnings
3. Combining with manual code review
4. Using multiple indicators (risk score + complexity + AI%)

## Future Improvements

### Planned Enhancements
1. Machine learning model (when training data available)
2. Language-specific pattern refinement
3. Historical trend analysis
4. Integration with known AI coding assistants
5. User feedback loop for pattern refinement

### Research Areas
- AST-based structural analysis
- Commit message correlation
- Author behavior patterns
- Time-based coding velocity analysis

## Transparency Commitment

We believe in **radical transparency** about our AI detection:
- ✅ Open source algorithm
- ✅ Clear confidence levels
- ✅ Documented limitations
- ✅ Continuous improvement
- ✅ User feedback integration

## Contact & Feedback

- **Report inaccuracies**: atuhaire.com/connect
- **Suggest improvements**: Submit issues with examples
- **Share datasets**: Help us improve accuracy with labeled samples

---

**Remember**: Copilens is a **tool to assist**, not replace, human judgment. Always combine automated analysis with manual code review.

**Last Updated**: February 2026
**Algorithm Version**: 1.0 (Enhanced Heuristic)
