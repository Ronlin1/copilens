import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env';

class GeminiImageService {
  constructor() {
    this.client = null;
    this.model = 'gemini-3.1-flash-image-preview';
  }

  initialize() {
    if (!ENV.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }
    this.client = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
  }

  async generateArchitectureImage(repoData) {
    if (!this.client) this.initialize();

    const languages = Array.isArray(repoData.languages)
      ? repoData.languages.slice(0, 5).map(l => l.name).join(', ')
      : Object.keys(repoData.languages || {}).slice(0, 5).join(', ');

    const files = repoData.tree
      ?.slice(0, 30)
      .map(f => f.path || f.name || f)
      .join('\n') || 'No files';

    const prompt = `Generate a clean, professional software architecture diagram image for this repository:

Repository: ${repoData.repoInfo?.name || 'Unknown'}
Description: ${repoData.repoInfo?.description || 'No description'}
Languages: ${languages}
Total Files: ${repoData.tree?.length || 0}

Key Files:
${files}

Create a visually appealing system architecture diagram showing:
- Main components and their relationships
- Data flow between components  
- Technology stack layers (Frontend, Backend, Database, APIs)
- Use clean boxes, arrows, and labels
- Dark theme with blue/cyan accent colors
- Professional technical diagram style`;

    try {
      console.log('🎨 Generating architecture image with Gemini...');

      const config = {
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: {
          imageSize: '1K',
        },
      };

      const contents = [
        { role: 'user', parts: [{ text: prompt }] },
      ];

      const response = await this.client.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      // Collect image data from stream
      let imageData = null;
      let textData = '';

      for await (const chunk of response) {
        if (!chunk.candidates?.[0]?.content?.parts) continue;

        for (const part of chunk.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageData = `data:${mimeType};base64,${base64}`;
          } else if (part.text) {
            textData += part.text;
          }
        }
      }

      if (imageData) {
        console.log('✅ Architecture image generated successfully');
        return {
          imageData,
          textData: textData || null,
          type: 'image',
        };
      }

      if (textData) {
        console.log('⚠️ Gemini returned text only, no image');
        return { imageData: null, textData, type: 'text' };
      }

      throw new Error('No image or text returned from Gemini');
    } catch (error) {
      console.error('❌ Gemini image generation failed:', error);
      throw error;
    }
  }
}

const geminiImageService = new GeminiImageService();
export default geminiImageService;
