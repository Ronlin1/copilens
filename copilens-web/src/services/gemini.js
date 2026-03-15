import Groq from 'groq-sdk';
import { ENV } from '../config/env';

class GroqService {
  constructor() {
    this.client = null;
    this.model = 'llama-3.3-70b-versatile';
    this.proModel = 'llama-3.3-70b-versatile';
  }

  initialize() {
    if (!ENV.GROQ_API_KEY) {
      throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.');
    }
    this.client = new Groq({
      apiKey: ENV.GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  async _complete(messages, { temperature = 0.3, maxTokens = 4096, model } = {}) {
    if (!this.client) this.initialize();
    const response = await this.client.chat.completions.create({
      model: model || this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0]?.message?.content || '';
  }

  async analyzeRepository(repoData) {
    const { repoInfo, stats, languages, commits, fileContents, tree } = repoData;

    const totalLines = fileContents.reduce((sum, f) => sum + (f.lines || 0), 0);
    const totalFilesAnalyzed = fileContents.length;
    const avgFileSize = fileContents.length > 0
      ? Math.round(fileContents.reduce((sum, f) => sum + f.size, 0) / fileContents.length)
      : 0;

    const filesByExtension = {};
    fileContents.forEach(f => {
      const ext = f.path.split('.').pop();
      if (!filesByExtension[ext]) filesByExtension[ext] = [];
      filesByExtension[ext].push(f);
    });

    const codeSamples = [];
    Object.entries(filesByExtension).forEach(([ext, files]) => {
      const samplesToTake = Math.min(3, files.length);
      files.slice(0, samplesToTake).forEach(f => {
        codeSamples.push({
          path: f.path,
          extension: ext,
          size: f.size,
          lines: f.lines,
          preview: f.content.substring(0, 3000)
        });
      });
    });

    const prompt = `You are an expert code analyst. Analyze this GitHub repository comprehensively based on ${totalFilesAnalyzed} files containing ${totalLines.toLocaleString()} lines of code.

REPOSITORY INFORMATION:
- Name: ${repoInfo.name}
- Owner: ${repoInfo.owner.login}
- Description: ${repoInfo.description || 'No description'}
- Stars: ${stats.stars}
- Forks: ${stats.forks}
- Created: ${stats.createdAt}
- Last Updated: ${stats.lastUpdated}

COMPREHENSIVE STATISTICS:
- Total Commits: ${stats.totalCommits}
- Contributors: ${stats.totalContributors}
- Branches: ${stats.totalBranches}
- Total Files in Repo: ${stats.totalFiles}
- Code Files Analyzed: ${totalFilesAnalyzed} (${totalLines.toLocaleString()} lines)
- Average File Size: ${(avgFileSize / 1024).toFixed(1)}KB
- Repository Size: ${Math.round(stats.totalSize / 1024)}KB

LANGUAGES USED (by size):
${Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .map(([lang, bytes]) => `- ${lang}: ${Math.round(bytes / 1024)}KB (${((bytes / stats.totalSize) * 100).toFixed(1)}%)`)
        .join('\n')}

FILE TYPE DISTRIBUTION:
${Object.entries(filesByExtension)
        .sort(([, a], [, b]) => b.length - a.length)
        .map(([ext, files]) => `- .${ext}: ${files.length} files (${files.reduce((sum, f) => sum + (f.lines || 0), 0).toLocaleString()} lines)`)
        .join('\n')}

RECENT COMMITS (Last ${Math.min(commits.length, 10)}):
${commits.slice(0, 10).map(c => `- ${c.commit.message.split('\n')[0]} (by ${c.commit.author.name})`).join('\n')}

CODE SAMPLES FROM ${codeSamples.length} DIVERSE FILES:
${codeSamples.map(f => `
--- File: ${f.path} (${f.lines} lines, .${f.extension}) ---
${f.preview}
---`).join('\n')}

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
      const fullText = await this._complete(
        [{ role: 'user', content: prompt }],
        { temperature: 0.3, maxTokens: 4096 }
      );

      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        aiDetection: { percentage: 0, confidence: 'low', indicators: ['Analysis failed - please try again'], aiGeneratedFiles: [] },
        codeQuality: { score: 0, strengths: [], weaknesses: [], documentation: 'unknown', testing: 'unknown' },
        techStack: { primary: [], architecture: 'unknown', frameworks: [], buildTools: [] },
        projectHealth: { activityLevel: 'unknown', lastCommitDays: 0, contributorActivity: 'unknown', maintenanceStatus: 'unknown' },
        recommendations: [],
        summary: 'Analysis could not be completed. Please try again.'
      };
    } catch (error) {
      console.error('Groq analysis error:', error);
      throw new Error('Failed to analyze repository: ' + error.message);
    }
  }

  async chat(messages, repoContext = null) {
    let systemContent = `You are Copilens AI, a friendly and knowledgeable code analysis assistant. Your responses should be conversational, clear, and natural - like talking to a helpful colleague.

IMPORTANT RESPONSE STYLE:
- Write in natural, flowing prose without markdown formatting
- Do NOT use asterisks (**bold**, *italic*), underscores, or other markdown syntax
- Do NOT use bullet points, numbered lists, or special formatting
- Use plain text only - write complete sentences and paragraphs
- Be conversational and warm in tone, like explaining to a friend
- Keep responses concise but informative (2-4 sentences unless detailed explanation needed)

Your role is to help developers understand their repositories, detect patterns, provide insights, and answer technical questions about the codebase.`;

    if (repoContext) {
      systemContent += `\n\nYou have analyzed this repository:
Repository: ${repoContext.name}
Description: ${repoContext.description}
Primary Languages: ${repoContext.languages}
Total Commits: ${repoContext.totalCommits}
Contributors: ${repoContext.contributors}
AI Detection: ${repoContext.aiDetection}% of code appears to be AI-generated
Code Quality Score: ${repoContext.codeQuality}/10`;

      if (repoContext.deploymentOptions) {
        const availablePlatforms = Object.entries(repoContext.deploymentOptions)
          .filter(([, config]) => config.available)
          .map(([platform]) => platform);
        if (availablePlatforms.length > 0) {
          systemContent += `\n\nDeployment configurations detected: ${availablePlatforms.join(', ')}.`;
        }
      }
    }

    const groqMessages = [
      { role: 'system', content: systemContent },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    try {
      const text = await this._complete(groqMessages, { temperature: 0.7, maxTokens: 2048 });
      return text || 'I apologize, but I could not generate a response. Please try again.';
    } catch (error) {
      if (!ENV.IS_PRODUCTION) console.error('Groq API error:', error);
      throw new Error('Failed to get AI response: ' + error.message);
    }
  }

  async generateArchitecture(githubData) {
    try {
      console.log('🏗️ Generating system architecture with Llama...');

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

Generate a detailed technical architecture document covering:
1. Architecture Overview (pattern: MVC, microservices, monolith, etc.)
2. Technology Stack breakdown
3. System Components and responsibilities
4. Data Flow
5. Key Design Patterns
6. Infrastructure Requirements
7. Security Considerations
8. Performance Characteristics
9. Scalability Analysis
10. Technical Debt & Recommendations

Format in Markdown with clear headings. Make it professional and suitable for technical documentation.`;

      const architecture = await this._complete(
        [{ role: 'user', content: prompt }],
        { temperature: 0.7, maxTokens: 4096 }
      );

      console.log('✅ Architecture generated successfully');
      return {
        architecture: architecture || 'Failed to generate architecture',
        generatedAt: new Date().toISOString(),
        modelUsed: this.model
      };
    } catch (error) {
      console.error('❌ Architecture generation failed:', error);
      return {
        architecture: '# Architecture Generation Failed\n\nPlease try again later.',
        error: error.message
      };
    }
  }

  async generateArchitectureDoc(repoData) {
    // Groq/Llama does not support image generation — go straight to text analysis
    console.log('📝 Generating text-based architecture analysis with Llama...');
    try {
      const languages = Array.isArray(repoData.languages)
        ? repoData.languages.slice(0, 5).map(l => l.name).join(', ')
        : Object.keys(repoData.languages || {}).slice(0, 5).join(', ');

      const files = repoData.tree?.slice(0, 30).map(f => f.path || f).join('\n') || 'No files';

      const prompt = `Analyze this repository's architecture in detail:

Repository: ${repoData.repoInfo?.name || 'Unknown'}
Description: ${repoData.repoInfo?.description || 'No description'}
Languages: ${languages}
Total Files: ${repoData.tree?.length || 0}

Key Files:
${files}

Provide a comprehensive architecture analysis covering:
1. Architecture Pattern (MVC, Microservices, Monolith, etc.)
2. System Components (Frontend, Backend, Database, APIs, etc.)
3. Technology Stack (Frameworks, libraries, tools used)
4. Data Flow (How data moves through the system)
5. Key Features (Main capabilities)
6. Deployment Strategy (How it should be deployed)

Make it detailed, professional, and technical. Format in markdown.`;

      const text = await this._complete(
        [{ role: 'user', content: prompt }],
        { temperature: 0.7, maxTokens: 2048 }
      );

      if (text && text.trim()) {
        console.log('✅ Architecture analysis generated');
        return { textData: text, imageData: null, type: 'text' };
      }
    } catch (error) {
      console.error('❌ Architecture analysis failed:', error);
    }

    // Final fallback
    const languages = Array.isArray(repoData.languages)
      ? repoData.languages.slice(0, 3).map(l => l.name).join(', ')
      : Object.keys(repoData.languages || {}).slice(0, 3).join(', ');

    return {
      textData: `# Architecture Analysis: ${repoData.repoInfo?.name || 'Application'}

## Technology Stack
**Languages:** ${languages}
**Total Files:** ${repoData.tree?.length || 0}
**Description:** ${repoData.repoInfo?.description || 'No description'}

## System Architecture

### Key Components
1. **Frontend Layer** — User interface and presentation logic
2. **Backend Services** — Business logic and API endpoints
3. **Data Layer** — Database and persistent storage

### Data Flow
User → Frontend → Backend APIs → Database → Response → UI

---
*Text-based analysis powered by Llama via Groq.*`,
      imageData: null,
      type: 'text'
    };
  }

  async analyzeHighRiskFiles(riskFiles, repoData) {
    try {
      console.log(`🔍 Analyzing ${riskFiles.length} high-risk files with Llama...`);

      const filesAnalysis = riskFiles.map(f => ({
        path: f.path,
        riskScore: f.risk.score,
        riskLevel: f.risk.level,
        lines: f.lines,
        cyclomatic: f.cyclomatic,
        cognitive: f.cognitive,
        factors: f.risk.factors,
        metrics: f.risk.metrics
      }));

      const prompt = `As a senior software architect and code quality expert, analyze these high-risk files and provide specific, actionable refactoring recommendations.

REPOSITORY: ${repoData.repoInfo?.name || 'Unknown'}
HIGH-RISK FILES DETECTED: ${riskFiles.length}

FILES ANALYSIS:
${filesAnalysis.map((f, i) => `
${i + 1}. ${f.path}
   - Risk Score: ${f.riskScore}/100 (${f.riskLevel} Risk)
   - Size: ${f.lines} lines
   - Cyclomatic Complexity: ${f.cyclomatic}
   - Cognitive Complexity: ${f.cognitive}
   - Maintainability Index: ${f.metrics.maintainabilityIndex}/100
   - Comment Ratio: ${f.metrics.commentRatio}
   - Estimated Bugs: ${f.metrics.estimatedBugs}
   - Risk Factors: ${f.factors.join(', ')}
`).join('\n')}

Provide a comprehensive analysis with:
1. Root Cause Analysis
2. Refactoring Strategy for top 3 files
3. Design Pattern Recommendations
4. Testing Strategy
5. Priority Ranking
6. Quick Wins
7. Long-term Architecture recommendations

Format as markdown with clear sections and code examples where relevant.`;

      const analysis = await this._complete(
        [{ role: 'user', content: prompt }],
        { temperature: 0.7, maxTokens: 4096, model: this.proModel }
      );

      console.log('✅ High-risk file analysis complete');
      return analysis;
    } catch (error) {
      console.error('❌ High-risk file analysis failed:', error);
      return `# High-Risk File Analysis

Analysis failed: ${error.message}

## Detected High-Risk Files:
${riskFiles.map((f, i) => `${i + 1}. **${f.path}** - Risk Score: ${f.risk.score}/100`).join('\n')}

Please review these files manually for refactoring opportunities.`;
    }
  }
}

export default new GroqService();
