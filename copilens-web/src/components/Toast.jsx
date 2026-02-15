import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, Rocket, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', recommendations = [], deploymentSuggestions = [], onClose, duration = 10000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    recommendation: Lightbulb,
  };

  const colors = {
    success: 'from-green-500 to-emerald-500',
    error: 'from-red-500 to-pink-500',
    info: 'from-blue-500 to-cyan-500',
    recommendation: 'from-purple-500 to-pink-500',
  };

  const Icon = icons[type] || Info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div className="glass border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${colors[type]} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-white" />
                <h3 className="text-lg font-bold text-white">
                  {type === 'recommendation' ? 'Analysis Complete!' : message}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            {(recommendations.length > 0 || deploymentSuggestions.length > 0) && (
              <div className="p-4 bg-white dark:bg-gray-800 max-h-96 overflow-y-auto">
                
                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        Top Recommendations
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {recommendations.slice(0, 5).map((rec, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2"
                        >
                          <div className={`mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                            rec.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {rec.priority}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                              {rec.suggestion}
                            </p>
                            {rec.rationale && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {rec.rationale}
                              </p>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Deployment Suggestions */}
                {deploymentSuggestions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket className="w-5 h-5 text-blue-500" />
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        Recommended Deployment Platforms
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {deploymentSuggestions.map((platform, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-900 dark:text-white">
                                {platform.name}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {platform.reason}
                              </p>
                              {platform.features && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {platform.features.map((feature, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                    >
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {platform.confidence && (
                              <div className="ml-3 text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {platform.confidence}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  Match
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
