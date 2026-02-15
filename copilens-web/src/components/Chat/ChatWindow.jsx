import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
import MessageList from './MessageList';
import geminiAPI from '../../services/gemini';

export default function ChatWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Copilens AI assistant powered by Gemini 3. Analyze a repository first, then I can help you understand the code, detect AI-generated patterns, discuss deployment options, and answer technical questions. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get repository context from localStorage
      const sessionData = localStorage.getItem('copilens_session');
      let repoContext = null;

      if (sessionData) {
        const data = JSON.parse(sessionData);
        repoContext = {
          url: data.repoUrl,
          name: data.repoName,
          description: data.description,
          languages: data.languages.map(l => l.name).join(', '),
          totalCommits: data.totalCommits,
          contributors: data.totalContributors,
          aiDetection: data.aiAnalysis?.aiDetection?.percentage || 0,
          codeQuality: data.aiAnalysis?.codeQuality?.score || 0,
          analysis: data.aiAnalysis,
          complexityData: data.complexityData,
          deploymentOptions: data.deploymentOptions,
          recommendedPlatform: data.recommendedPlatform
        };
      }

      // Call Gemini API
      const response = await geminiAPI.chat(
        [...messages, { role: 'user', content: userMessage }],
        repoContext
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
      setIsLoading(false);

    } catch (error) {
      setError(error.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${error.message}\n\nPlease make sure you've analyzed a repository first and that your Gemini API key is configured.`
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            height: isMinimized ? '60px' : '600px'
          }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-6 right-6 z-50 w-96 glass rounded-2xl shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-cyber-500 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">Copilens AI</h3>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Beta</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
                <MessageList messages={messages} isLoading={isLoading} />
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your repository..."
                    rows={2}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 resize-none cursor-text"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-4 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end cursor-pointer hover-lift"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
