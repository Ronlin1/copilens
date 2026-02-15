import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env';

class GeminiService {
  constructor() {
    this.ai = null;
    this.model = 'gemini-3-flash-preview';
  }

  initialize() {
    if (!ENV.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add your API key to the .env file.');
    }
    
    this.ai = new GoogleGenAI({
      apiKey: ENV.GEMINI_API_KEY,
    });
  }

  async analyzeRepository(repoData) {
    if (!this.ai) {
      this.initialize();
    }

    const { repoInfo, stats, languages, commits, fileContents } = repoData;

    const prompt = `You are an expert code analyst. Analyze this GitHub repository in detail and provide comprehensive insights.

REPOSITORY INFORMATION:
- Name: ${repoInfo.name}
- Owner: ${repoInfo.owner.login}
- Description: ${repoInfo.description || 'No description'}
- Stars: ${stats.stars}
- Forks: ${stats.forks}
- Created: ${stats.createdAt}
- Last Updated: ${stats.lastUpdated}

STATISTICS:
- Total Commits: ${stats.totalCommits}
- Contributors: ${stats.totalContributors}
- Branches: ${stats.totalBranches}
- Total Files: ${stats.totalFiles}
- Code Files: ${stats.totalCodeFiles}
- Repository Size: ${Math.round(stats.totalSize / 1024)}KB

LANGUAGES USED:
${Object.entries(languages).map(([lang, bytes]) => `- ${lang}: ${Math.round(bytes / 1024)}KB`).join('\n')}

RECENT COMMITS (Last ${commits.length}):
${commits.slice(0, 10).map(c => `- ${c.commit.message.split('\n')[0]} (by ${c.commit.author.name})`).join('\n')}

SAMPLE CODE FILES (for pattern analysis):
${fileContents.map(f => `
File: ${f.path}
Size: ${f.size} bytes
Content Preview:
${f.content.substring(0, 1000)}
---`).join('\n')}

ANALYSIS REQUIRED:

1. **AI-Generated Code Detection**:
   - Analyze code patterns, comments, and structure
   - Look for signs of AI assistance (consistent patterns, placeholder comments, boilerplate code)
   - Estimate percentage of AI-generated vs human-written code (0-100%)
   - Identify specific files that appear AI-generated
   - Consider: GitHub Copilot patterns, ChatGPT code style, generic variable names

2. **Code Quality Assessment**:
   - Overall code quality score (1-10)
   - Code organization and structure
   - Documentation quality
   - Testing practices
   - Error handling patterns
   - Security considerations

3. **Technology Stack Analysis**:
   - Primary technologies and frameworks
   - Architecture pattern (MVC, microservices, monolith, etc.)
   - Database usage
   - API design patterns
   - Build tools and deployment setup

4. **Project Health Metrics**:
   - Activity level (active, moderate, dormant)
   - Contributor engagement
   - Code churn analysis
   - Maintenance status

5. **Recommendations**:
   - Top 5 improvement suggestions
   - Security concerns
   - Performance optimization opportunities
   - Best practices to adopt

Provide your analysis in the following JSON format:
{
  "aiDetection": {
    "percentage": <number 0-100>,
    "confidence": "<high/medium/low>",
    "indicators": ["<indicator1>", "<indicator2>"],
    "aiGeneratedFiles": ["<file1>", "<file2>"]
  },
  "codeQuality": {
    "score": <number 1-10>,
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "documentation": "<excellent/good/fair/poor>",
    "testing": "<excellent/good/fair/poor/none>"
  },
  "techStack": {
    "primary": ["<tech1>", "<tech2>"],
    "architecture": "<architecture type>",
    "frameworks": ["<framework1>", "<framework2>"],
    "buildTools": ["<tool1>", "<tool2>"]
  },
  "projectHealth": {
    "activityLevel": "<active/moderate/dormant>",
    "lastCommitDays": <number>,
    "contributorActivity": "<high/medium/low>",
    "maintenanceStatus": "<well-maintained/needs-attention/abandoned>"
  },
  "recommendations": [
    {
      "category": "<category>",
      "priority": "<high/medium/low>",
      "suggestion": "<detailed suggestion>"
    }
  ],
  "summary": "<2-3 sentence overview of the project>"
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or additional text.`;

    try {
      const response = await this.ai.models.generateContentStream({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        }
      });

      let fullText = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
        }
      }

      // Try to parse JSON from the response
      let jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, return structured error
      return {
        aiDetection: {
          percentage: 0,
          confidence: 'low',
          indicators: ['Analysis failed - please try again'],
          aiGeneratedFiles: []
        },
        codeQuality: { score: 0, strengths: [], weaknesses: [], documentation: 'unknown', testing: 'unknown' },
        techStack: { primary: [], architecture: 'unknown', frameworks: [], buildTools: [] },
        projectHealth: { activityLevel: 'unknown', lastCommitDays: 0, contributorActivity: 'unknown', maintenanceStatus: 'unknown' },
        recommendations: [],
        summary: 'Analysis could not be completed. Please try again.'
      };
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error('Failed to analyze repository: ' + error.message);
    }
  }

  async chat(messages, repoContext = null) {
    if (!this.ai) {
      this.initialize();
    }

    let systemPrompt = 'You are Copilens AI, an expert code analysis assistant helping developers understand repositories, detect AI-generated code, and provide technical insights.';
    
    if (repoContext) {
      systemPrompt += `\n\nCurrent Repository Context:\n`;
      systemPrompt += `- URL: ${repoContext.url}\n`;
      systemPrompt += `- Name: ${repoContext.name}\n`;
      systemPrompt += `- Description: ${repoContext.description}\n`;
      systemPrompt += `- Languages: ${repoContext.languages}\n`;
      systemPrompt += `- Total Commits: ${repoContext.totalCommits}\n`;
      systemPrompt += `- Contributors: ${repoContext.contributors}\n`;
      systemPrompt += `- AI Detection: ${repoContext.aiDetection}% AI-generated code\n`;
      systemPrompt += `- Code Quality: ${repoContext.codeQuality}/10\n`;
      
      if (repoContext.analysis) {
        systemPrompt += `\nDetailed Analysis:\n${JSON.stringify(repoContext.analysis, null, 2)}`;
      }
    }

    const conversationHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I have full context of the repository. Ready to assist with detailed insights and answers.' }] },
      ...conversationHistory
    ];

    try {
      const response = await this.ai.models.generateContentStream({
        model: this.model,
        contents,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });

      let fullText = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
        }
      }

      return fullText || 'I apologize, but I could not generate a response. Please try again.';
    } catch (error) {
      if (!ENV.IS_PRODUCTION) {
        console.error('Gemini API error:', error);
      }
      throw new Error('Failed to get AI response: ' + error.message);
    }
  }

  async generateArchitecture(githubData) {
    try {
      console.log('🏗️ Generating system architecture with Gemini...');
      
      if (!this.ai) {
        this.initialize();
      }

      // Prepare data for architecture analysis
      const languagesInfo = Object.entries(githubData.languages || {})
        .map(([lang, bytes]) => `${lang}: ${bytes} bytes`)
        .join('\n');
      
      const fileStructure = githubData.tree
        ?.filter(f => f.type === 'blob')
        .slice(0, 50)
        .map(f => f.path)
        .join('\n') || 'No file structure available';

      const prompt = `You are a senior software architect. Analyze this repository and generate a comprehensive technical architecture document.

REPOSITORY INFORMATION:
Name: ${githubData.repoInfo?.name || 'Unknown'}
Description: ${githubData.repoInfo?.description || 'No description'}
Primary Language: ${githubData.repoInfo?.language || 'Unknown'}
Stars: ${githubData.stats?.stars || 0}
Contributors: ${githubData.stats?.totalContributors || 0}
Total Commits: ${githubData.stats?.totalCommits || 0}

LANGUAGES USED:
${languagesInfo}

FILE STRUCTURE (Sample):
${fileStructure}

CODE SAMPLES:
${githubData.fileContents?.slice(0, 3).map(f => `
File: ${f.path}
\`\`\`
${f.content.substring(0, 1000)}
\`\`\`
`).join('\n') || 'No code samples available'}

Please generate a detailed technical architecture document including:

1. **Architecture Overview**: High-level architecture pattern (MVC, microservices, monolith, etc.)
2. **Technology Stack**: Detailed breakdown of technologies, frameworks, and libraries
3. **System Components**: Main components/modules and their responsibilities
4. **Data Flow**: How data moves through the system
5. **Key Design Patterns**: Identified design patterns used
6. **Infrastructure Requirements**: Deployment, scaling, and infrastructure needs
7. **Security Considerations**: Authentication, authorization, data protection
8. **Performance Characteristics**: Expected performance profile and bottlenecks
9. **Scalability Analysis**: How the system scales (horizontal/vertical)
10. **Technical Debt & Recommendations**: Areas for improvement

Format your response in Markdown with clear headings, bullet points, and code references where appropriate.
Make it professional and suitable for technical documentation.`;

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      });

      let architecture = '';
      for await (const chunk of response) {
        if (chunk.text) {
          architecture += chunk.text;
        }
      }
      
      console.log('✅ Architecture generated successfully');
      
      return {
        architecture: architecture || 'Failed to generate architecture',
        generatedAt: new Date().toISOString(),
        modelUsed: 'gemini-3-flash-preview'
      };
    } catch (error) {
      console.error('❌ Architecture generation failed:', error);
      return {
        architecture: '# Architecture Generation Failed\n\nPlease try again later.',
        error: error.message
      };
    }
  }
}

export default new GeminiService();
