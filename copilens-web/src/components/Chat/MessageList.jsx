import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import CodeBlock from './CodeBlock';

export default function MessageList({ messages, isLoading }) {
  const renderContent = (content) => {
    // Check if content contains code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    // If no code blocks found, return plain text
    if (parts.length === 0) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    // Render mixed content
    return parts.map((part, index) => (
      part.type === 'code' ? (
        <CodeBlock key={index} language={part.language} code={part.content} />
      ) : (
        <p key={index} className="whitespace-pre-wrap">{part.content}</p>
      )
    ));
  };

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.role === 'user'
              ? 'bg-gradient-to-r from-primary-500 to-cyber-500'
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}>
            {message.role === 'user' ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Message */}
          <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block px-4 py-3 rounded-2xl ${
              message.role === 'user'
                ? 'bg-gradient-to-r from-primary-500 to-cyber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}>
              {renderContent(message.content)}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="inline-block px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
