import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Database, GitBranch, GitPullRequest, AlertCircle, Tag, Users, GitCommit } from 'lucide-react';

export default function ProgressNotifications({ logs }) {
  // Keep only the last 5 logs
  const recentLogs = logs.slice(-5);

  const getIcon = (message) => {
    if (message.includes('commit')) return GitCommit;
    if (message.includes('contributor')) return Users;
    if (message.includes('branch')) return GitBranch;
    if (message.includes('pull request') || message.includes('PR')) return GitPullRequest;
    if (message.includes('issue')) return AlertCircle;
    if (message.includes('release')) return Tag;
    if (message.includes('✅') || message.includes('success')) return CheckCircle2;
    return Database;
  };

  const getGradient = (message) => {
    if (message.includes('commit')) return 'from-blue-500 to-cyan-500';
    if (message.includes('contributor')) return 'from-purple-500 to-pink-500';
    if (message.includes('branch')) return 'from-green-500 to-emerald-500';
    if (message.includes('pull request') || message.includes('PR')) return 'from-orange-500 to-red-500';
    if (message.includes('issue')) return 'from-red-500 to-pink-500';
    if (message.includes('release')) return 'from-yellow-500 to-orange-500';
    if (message.includes('✅')) return 'from-green-400 to-emerald-400';
    return 'from-indigo-500 to-purple-500';
  };

  return (
    <div className="fixed top-24 right-6 z-50 space-y-3 max-w-md">
      <AnimatePresence mode="popLayout">
        {recentLogs.map((log, index) => {
          const Icon = getIcon(log.message);
          const gradient = getGradient(log.message);
          const isCompleted = log.message.includes('✅');
          
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ 
                opacity: 1 - (index * 0.15), // Fade out older logs
                x: 0, 
                scale: 1 - (index * 0.05),
                y: index * 8, // Slight cascade effect
              }}
              exit={{ 
                opacity: 0, 
                x: 100, 
                scale: 0.8,
                transition: { duration: 0.3 }
              }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.4
              }}
              className="relative"
              style={{ zIndex: 50 - index }}
            >
              {/* Holographic background with glassmorphism */}
              <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 shadow-2xl">
                {/* Animated gradient border */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20`}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />

                {/* Content */}
                <div className="relative p-4 flex items-start gap-3">
                  {/* Icon with animated glow */}
                  <div className="relative">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${gradient} blur-xl opacity-50`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                    <div className={`relative p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
                      {isCompleted ? (
                        <Icon className="w-5 h-5 text-white" />
                      ) : (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <motion.p 
                      className="text-sm font-medium text-white leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {log.message}
                    </motion.p>
                    
                    {/* Progress bar for loading logs */}
                    {!isCompleted && (
                      <motion.div
                        className="mt-2 h-1 bg-gray-700/50 rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div
                          className={`h-full bg-gradient-to-r ${gradient}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <motion.span
                    className="text-xs text-gray-500 font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </motion.span>
                </div>

                {/* Particle effects for completed logs */}
                {isCompleted && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${gradient}`}
                        initial={{ 
                          x: '50%', 
                          y: '50%',
                          scale: 0,
                          opacity: 1
                        }}
                        animate={{
                          x: `${50 + (Math.cos(i * 60 * Math.PI / 180) * 100)}%`,
                          y: `${50 + (Math.sin(i * 60 * Math.PI / 180) * 100)}%`,
                          scale: [0, 1, 0],
                          opacity: [1, 1, 0]
                        }}
                        transition={{
                          duration: 1,
                          delay: 0.1
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
