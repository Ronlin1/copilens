"""
Gemini 3 Pro Provider with Thinking and Google Search
Advanced provider for deep code analysis
"""

import os
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

try:
    from google import genai
    from google.genai import types
    GEMINI3_AVAILABLE = True
except ImportError:
    GEMINI3_AVAILABLE = False

# Import config manager
try:
    from copilens.core.config_manager import get_config
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False


@dataclass
class ThinkingResponse:
    """Response with thinking process"""
    content: str
    thinking: Optional[str] = None
    search_results: Optional[List[Dict[str, Any]]] = None


class Gemini3Provider:
    """
    Gemini 3 Pro provider with advanced features:
    - Deep thinking (HIGH level)
    - Google Search integration
    - Streaming responses
    - Enhanced analysis capabilities
    """
    
    def __init__(self, api_key: Optional[str] = None):
        # Check config file first, then environment
        if not api_key:
            if CONFIG_AVAILABLE:
                config = get_config()
                api_key = config.get_api_key('gemini')
            else:
                api_key = os.getenv("GEMINI_API_KEY")
        
        self.api_key = api_key
        self.client = None
        self.model = "gemini-3-flash-preview"  # Fast and powerful
        
        if self.api_key and GEMINI3_AVAILABLE:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception:
                self.client = None
    
    def is_available(self) -> bool:
        """Check if Gemini 3 is available"""
        return GEMINI3_AVAILABLE and self.client is not None
    
    def analyze_code(
        self,
        prompt: str,
        use_search: bool = True,
        thinking_level: str = "HIGH",
        stream: bool = False
    ) -> ThinkingResponse:
        """
        Analyze code with deep thinking and optional Google Search
        
        Args:
            prompt: Analysis prompt
            use_search: Enable Google Search
            thinking_level: HIGH, MEDIUM, or LOW
            stream: Stream response
        
        Returns:
            ThinkingResponse with content and thinking process
        """
        if not self.is_available():
            raise RuntimeError("Gemini 3 not available. Install: pip install google-genai")
        
        # Build contents
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)]
            )
        ]
        
        # Configure tools
        tools = []
        if use_search:
            tools.append(types.Tool(googleSearch=types.GoogleSearch()))
        
        # Configure generation
        config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(
                thinking_level=thinking_level.upper()
            ),
            tools=tools if tools else None,
            temperature=0.3,  # Lower for code analysis
            top_p=0.95,
            top_k=40,
        )
        
        # Generate
        if stream:
            return self._generate_streaming(contents, config)
        else:
            return self._generate_complete(contents, config)
    
    def _generate_complete(
        self,
        contents: List[types.Content],
        config: types.GenerateContentConfig
    ) -> ThinkingResponse:
        """Generate complete response"""
        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            config=config
        )
        
        # Extract content
        content = ""
        thinking = None
        
        if response.candidates:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if hasattr(part, 'text') and part.text:
                        content += part.text
                    elif hasattr(part, 'thought') and part.thought:
                        thinking = part.thought
        
        return ThinkingResponse(
            content=content.strip(),
            thinking=thinking
        )
    
    def _generate_streaming(
        self,
        contents: List[types.Content],
        config: types.GenerateContentConfig
    ) -> ThinkingResponse:
        """Generate streaming response"""
        content = ""
        thinking = None
        
        for chunk in self.client.models.generate_content_stream(
            model=self.model,
            contents=contents,
            config=config
        ):
            if chunk.text:
                content += chunk.text
                yield chunk.text
        
        return ThinkingResponse(
            content=content.strip(),
            thinking=thinking
        )


def create_analysis_prompt(
    code_context: str,
    repository_url: Optional[str] = None,
    analysis_type: str = "comprehensive"
) -> str:
    """
    Create detailed analysis prompt for Gemini 3
    
    Args:
        code_context: Code or repository information
        repository_url: URL to repository (for search context)
        analysis_type: Type of analysis (comprehensive, security, quality, architecture)
    """
    
    base_prompt = f"""You are an expert code analyst with deep knowledge of software engineering, security, and architecture.

TASK: Perform a {analysis_type} analysis of the following code/repository.

"""
    
    if repository_url:
        base_prompt += f"""REPOSITORY: {repository_url}
Use Google Search to gather context about this repository, its purpose, community, issues, and best practices.

"""
    
    base_prompt += f"""CODE/CONTEXT:
{code_context}

"""
    
    # Analysis type-specific instructions
    if analysis_type == "comprehensive":
        base_prompt += """COMPREHENSIVE ANALYSIS - Provide:

1. **Overview & Purpose**
   - What does this code/project do?
   - Primary use cases
   - Target audience

2. **Architecture & Design**
   - Overall architecture pattern
   - Key components and their relationships
   - Design patterns used
   - Strengths and weaknesses

3. **Code Quality**
   - Code organization and structure
   - Naming conventions
   - Documentation quality
   - Test coverage assessment
   - Maintainability score (0-100)

4. **AI-Generated Code Detection**
   - Likelihood code is AI-generated (0-100%)
   - Specific indicators:
     * Verbose comments
     * Consistent formatting
     * Generic variable names
     * Comprehensive error handling
     * Type hints everywhere
   - Confidence level in assessment

5. **Security Analysis**
   - Potential vulnerabilities
   - Security best practices followed/missed
   - Critical issues (if any)
   - Recommended security improvements

6. **Performance**
   - Potential bottlenecks
   - Optimization opportunities
   - Resource usage concerns

7. **Dependencies & Tech Stack**
   - Key dependencies
   - Tech stack choices
   - Potential dependency issues
   - Update recommendations

8. **Best Practices Compliance**
   - Which best practices are followed
   - Which are violated
   - Industry standards compliance

9. **Recommendations**
   - Top 5 improvement priorities
   - Quick wins
   - Long-term refactoring suggestions

10. **Deployment Readiness**
    - Is it production-ready?
    - Missing configurations
    - Deployment recommendations

Provide specific examples and code snippets where relevant.
Be honest and constructive in your assessment.
"""
    
    elif analysis_type == "security":
        base_prompt += """SECURITY ANALYSIS - Provide:

1. **Vulnerability Assessment**
   - SQL injection risks
   - XSS vulnerabilities
   - Authentication/authorization issues
   - Secret exposure
   - Input validation gaps

2. **Security Best Practices**
   - What's done well
   - What's missing
   - OWASP Top 10 compliance

3. **Critical Fixes** (prioritized)
4. **Security Score** (0-100)
5. **Actionable Recommendations**
"""
    
    elif analysis_type == "quality":
        base_prompt += """CODE QUALITY ANALYSIS - Provide:

1. **Quality Metrics**
   - Cyclomatic complexity
   - Code duplication
   - Function/class sizes
   - Coupling and cohesion

2. **Maintainability**
   - How easy to modify?
   - Technical debt assessment
   - Refactoring opportunities

3. **Testing**
   - Test coverage
   - Test quality
   - Missing tests

4. **Quality Score** (0-100)
5. **Improvement Roadmap**
"""
    
    elif analysis_type == "architecture":
        base_prompt += """ARCHITECTURE ANALYSIS - Provide:

1. **Architecture Pattern**
   - Pattern used (MVC, microservices, etc.)
   - How well implemented
   - Appropriateness for use case

2. **Component Design**
   - Component breakdown
   - Dependencies
   - Communication patterns

3. **Scalability**
   - How well does it scale?
   - Bottlenecks
   - Horizontal/vertical scaling

4. **Technology Choices**
   - Are they appropriate?
   - Better alternatives?
   - Future-proofing

5. **Architecture Score** (0-100)
6. **Refactoring Recommendations**
"""
    
    base_prompt += """

FORMAT YOUR RESPONSE:
- Use clear headings (##)
- Use bullet points for lists
- Include code examples in ```language``` blocks
- Provide specific line numbers/file references when possible
- Be concise but thorough
- Prioritize actionable insights

TONE: Professional, constructive, and specific.
"""
    
    return base_prompt


def get_gemini3() -> Gemini3Provider:
    """Get singleton Gemini 3 provider"""
    if not hasattr(get_gemini3, '_instance'):
        get_gemini3._instance = Gemini3Provider()
    return get_gemini3._instance
