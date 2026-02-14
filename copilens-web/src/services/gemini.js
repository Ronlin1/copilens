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

  async chat(messages, repoContext = null) {
    if (!this.ai) {
      this.initialize();
    }

    let systemPrompt = 'You are Copilens AI, an expert code analysis assistant helping developers understand repositories, detect AI-generated code, and provide technical insights.';
    
    if (repoContext) {
      systemPrompt += '\n\nRepository Context:\n';
      systemPrompt += '- URL: ' + repoContext.url + '\n';
      systemPrompt += '- Files: ' + (repoContext.files || 'N/A') + '\n';
      systemPrompt += '- Languages: ' + (repoContext.languages ? Object.keys(repoContext.languages).join(', ') : 'N/A') + '\n';
      systemPrompt += '- Commits: ' + (repoContext.commits || 'N/A');
    }

    const conversationHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. Ready to assist with repository analysis.' }] },
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

  async analyzeCode(code, language = 'unknown') {
    if (!this.ai) {
      this.initialize();
    }

    const prompt = 'Analyze this ' + language + ' code and provide:\n' +
      '1. Brief overview\n' +
      '2. Code quality assessment\n' +
      '3. Potential issues or improvements\n' +
      '4. AI-generated code likelihood (0-100%)\n\n' +
      'Code:\n' + code;

    try {
      const response = await this.ai.models.generateContentStream({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        }
      });

      let fullText = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
        }
      }

      return fullText;
    } catch (error) {
      if (!ENV.IS_PRODUCTION) {
        console.error('Code analysis error:', error);
      }
      throw error;
    }
  }
}

export default new GeminiService();
