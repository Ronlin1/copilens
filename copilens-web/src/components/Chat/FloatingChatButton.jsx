import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-full shadow-2xl shadow-primary-500/50 hover:shadow-primary-500/70 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            
            {/* Pulse Animation */}
            <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
