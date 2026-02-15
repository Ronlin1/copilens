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

  async generateArchitectureDoc(repoData) {
    try {
      console.log('🎨 Generating architecture diagram with Gemini Image...');
      
      if (!this.ai) {
        this.initialize();
      }

      // Get detailed repo info
      const languages = Array.isArray(repoData.languages) 
        ? repoData.languages.slice(0, 5).map(l => l.name).join(', ')
        : Object.keys(repoData.languages || {}).slice(0, 5).join(', ');
      
      const repoName = repoData.repoInfo?.name || 'Application';
      const description = repoData.repoInfo?.description || 'No description';
      const stars = repoData.repoInfo?.stargazers_count || 0;
      const fileCount = repoData.tree?.length || 0;

      // Extract key architecture files
      const keyFiles = repoData.tree?.slice(0, 50)
        .map(f => f.path || f)
        .filter(path => 
          path.includes('config') || 
          path.includes('server') || 
          path.includes('api') || 
          path.includes('database') ||
          path.includes('service') ||
          path.includes('controller') ||
          path.includes('model') ||
          path.includes('router') ||
          path.includes('index') ||
          path.includes('main') ||
          path.includes('app')
        ) || [];

      // Create detailed architecture diagram prompt
      const imagePrompt = `Generate a professional, detailed software architecture diagram for the "${repoName}" repository.

**Repository Information:**
- Name: ${repoName}
- Description: ${description}
- Primary Technologies: ${languages}
- Total Files: ${fileCount}
- GitHub Stars: ${stars}

**Key Architecture Files Detected:**
${keyFiles.slice(0, 20).join('\n') || 'Standard project structure'}

**Diagram Requirements:**

Create a modern, professional technical architecture diagram that shows:

1. **SYSTEM LAYERS** (show these as distinct horizontal layers):
   - Presentation Layer (UI/Frontend)
   - Application Layer (Business Logic)
   - Data Layer (Database/Storage)
   - External Services (APIs, Third-party integrations)

2. **COMPONENT BREAKDOWN**:
   - Frontend components and frameworks (${languages.split(',')[0] || 'main tech'})
   - Backend services and APIs
   - Database systems
   - Authentication & Authorization modules
   - External integrations

3. **DATA FLOW**:
   - Show arrows indicating request/response flow
   - Show data movement between components
   - Indicate synchronous vs asynchronous communication

4. **TECHNOLOGY STACK**:
   - Label each component with the technology used
   - Show frameworks, libraries, and tools
   - Include deployment/infrastructure elements

5. **VISUAL STYLE**:
   - Use a clean, modern technical diagram aesthetic (like AWS or Azure architecture diagrams)
   - Professional color scheme: blues (#3B82F6), purples (#8B5CF6), greens (#10B981), oranges (#F59E0B)
   - Clear component boxes with rounded corners
   - Distinct layers with different background shades
   - Bold, readable labels and text
   - Directional arrows showing flow
   - Icons or symbols for different component types
   - Grid-based layout for alignment

6. **QUALITY**:
   - High resolution, crisp and clear
   - Well-organized and balanced layout
   - Professional presentation quality
   - Suitable for technical documentation

Make it look like a professional architecture diagram from a technical design document. The diagram should be comprehensive, visually appealing, and technically accurate based on the repository structure and technologies used.`;

      console.log('📤 Requesting architecture diagram from Gemini...');
      
      const tools = [
        {
          googleSearch: {}
        }
      ];

      const config = {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K",
        },
        responseModalities: ['IMAGE', 'TEXT'],
        tools,
      };

      const contents = [
        {
          role: 'user',
          parts: [{ text: imagePrompt }],
        },
      ];

      const response = await this.ai.models.generateContentStream({
        model: 'gemini-3-pro-image-preview',
        config,
        contents,
      });

      console.log('📥 Processing response stream...');
      
      let imageData = null;
      let mimeType = null;
      let textContent = '';

      for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0]?.content || !chunk.candidates[0]?.content?.parts) {
          continue;
        }
        
        // Check for inline image data
        if (chunk.candidates[0].content.parts[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          imageData = inlineData.data;
          mimeType = inlineData.mimeType || 'image/png';
          console.log('📷 Image data received:', mimeType);
        } else if (chunk.text) {
          textContent += chunk.text;
          console.log('💬 Text chunk received');
        }
      }

      if (imageData) {
        console.log('✅ Architecture diagram image generated successfully');
        
        // Also generate text analysis in parallel
        console.log('📝 Generating text analysis...');
        let textData = textContent; // Use any text from image response
        
        // If no text came with image, generate separate text analysis
        if (!textData || textData.trim().length < 100) {
          try {
            const languages = Array.isArray(repoData.languages) 
              ? repoData.languages.slice(0, 5).map(l => l.name).join(', ')
              : Object.keys(repoData.languages || {}).slice(0, 5).join(', ');
            
            const files = repoData.tree?.slice(0, 30).map(f => f.path || f).join('\n') || 'No files';

            const textPrompt = `Analyze this repository's architecture in detail:

**Repository:** ${repoData.repoInfo?.name || 'Unknown'}
**Description:** ${repoData.repoInfo?.description || 'No description'}
**Languages:** ${languages}
**Total Files:** ${repoData.tree?.length || 0}

**Key Files:**
${files}

Provide a comprehensive architecture analysis covering:
1. **Architecture Pattern** (MVC, Microservices, Monolith, etc.)
2. **System Components** (Frontend, Backend, Database, APIs, etc.)
3. **Technology Stack** (Frameworks, libraries, tools used)
4. **Data Flow** (How data moves through the system)
5. **Key Features** (Main capabilities)
6. **Deployment Strategy** (How it should be deployed)

Make it detailed, professional, and technical. Format in markdown.`;

            const textResponse = await this.ai.models.generateContent({
              model: this.model,
              contents: [{ role: 'user', parts: [{ text: textPrompt }] }],
              config: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              }
            });

            textData = textResponse.text || textResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } catch (textError) {
            console.error('❌ Text generation failed:', textError);
            textData = `# Architecture Analysis

Image diagram generated successfully. Text analysis generation encountered an error.`;
          }
        }

        const imageDataUrl = `data:${mimeType};base64,${imageData}`;
        return { 
          imageData: imageDataUrl,
          textData: textData,
          type: 'image' 
        };
      }

      throw new Error('No image data in response');
      
    } catch (error) {
      console.error('❌ Image generation failed:', error.message);
      console.log('📝 Falling back to text-based architecture analysis...');
      
      // Fallback: Generate text description with Gemini
      try {
        if (!this.ai) {
          this.initialize();
        }

        const languages = Array.isArray(repoData.languages) 
          ? repoData.languages.slice(0, 5).map(l => `${l.name}`).join(', ')
          : Object.keys(repoData.languages || {}).slice(0, 5).join(', ');
        
        const files = repoData.tree?.slice(0, 30).map(f => f.path || f).join('\n') || 'No files';

        const prompt = `Analyze this repository's architecture in detail:

**Repository:** ${repoData.repoInfo?.name || 'Unknown'}
**Description:** ${repoData.repoInfo?.description || 'No description'}
**Languages:** ${languages}
**Total Files:** ${repoData.tree?.length || 0}

**Key Files:**
${files}

Provide a comprehensive architecture analysis covering:
1. **Architecture Pattern** (MVC, Microservices, Monolith, etc.)
2. **System Components** (Frontend, Backend, Database, APIs, etc.)
3. **Technology Stack** (Frameworks, libraries, tools used)
4. **Data Flow** (How data moves through the system)
5. **Key Features** (Main capabilities)
6. **Deployment Strategy** (How it should be deployed)

Make it detailed, professional, and technical. Format in markdown.`;

        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        });

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (text && text.trim()) {
          console.log('✅ Architecture analysis generated (text fallback)');
          return { 
            textData: text,
            imageData: null,
            type: 'text' 
          };
        }
      } catch (textError) {
        console.error('❌ Text generation also failed:', textError);
      }
      
      // Final fallback: Return template description
      const languages = Array.isArray(repoData.languages) 
        ? repoData.languages.slice(0, 3).map(l => l.name).join(', ')
        : Object.keys(repoData.languages || {}).slice(0, 3).join(', ');
      
      const description = `# Architecture Analysis: ${repoData.repoInfo?.name || 'Application'}

## Technology Stack
**Languages:** ${languages}
**Total Files:** ${repoData.tree?.length || 0}
**Description:** ${repoData.repoInfo?.description || 'No description'}

## System Architecture

### Architecture Pattern
This appears to be a modern application following industry best practices.

### Key Components

#### 1. Frontend Layer
- User interface and presentation logic
- Built with ${languages}
- Handles user interactions and display

#### 2. Backend Services
- Business logic and data processing
- API endpoints for client communication
- Authentication and authorization

#### 3. Data Layer
- Database for persistent storage
- Caching mechanisms for performance
- File storage and management

### Data Flow
1. User interacts with the frontend
2. Frontend sends requests to backend APIs
3. Backend processes business logic
4. Data is fetched/stored in the database
5. Response sent back to frontend
6. UI updates to reflect changes

### Deployment Recommendations
- Use containerization (Docker) for consistency
- Deploy frontend separately from backend
- Use CI/CD pipeline for automated deployments
- Implement monitoring and logging
- Set up load balancing for scalability

---
*Note: Architecture diagram generation is currently unavailable. This is a text-based analysis based on repository structure.*`;
      
      return { 
        textData: description,
        imageData: null,
        type: 'text' 
      };
    }
  }
}

export default new GeminiService();
