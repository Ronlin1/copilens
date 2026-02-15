import { motion } from 'framer-motion';
import { Network, Layers, GitBranch, Zap, Shield, Scale } from 'lucide-react';

const SystemsThinkingAnalysis = ({ analysis, techStack }) => {
  if (!analysis) {
    return (
      <div className="text-center py-8 text-gray-400">
        No systems analysis available
      </div>
    );
  }

  const architecturePatterns = [
    {
      name: 'Modularity',
      score: analysis.modularity || 75,
      icon: Layers,
      description: 'How well code is organized into independent modules',
      color: 'text-blue-500'
    },
    {
      name: 'Coupling',
      score: analysis.coupling || 60,
      icon: GitBranch,
      description: 'Degree of interdependence between modules (lower is better)',
      color: 'text-purple-500',
      inverse: true
    },
    {
      name: 'Cohesion',
      score: analysis.cohesion || 80,
      icon: Network,
      description: 'How focused each module is on a single responsibility',
      color: 'text-green-500'
    },
    {
      name: 'Scalability',
      score: analysis.scalability || 70,
      icon: Zap,
      description: 'Ability to handle growth in users or data',
      color: 'text-yellow-500'
    },
    {
      name: 'Resilience',
      score: analysis.resilience || 65,
      icon: Shield,
      description: 'System ability to recover from failures',
      color: 'text-red-500'
    },
    {
      name: 'Maintainability',
      score: analysis.maintainability || 72,
      icon: Scale,
      description: 'Ease of making changes and updates',
      color: 'text-indigo-500'
    }
  ];

  const getScoreColor = (score, inverse = false) => {
    const effectiveScore = inverse ? 100 - score : score;
    if (effectiveScore >= 80) return 'bg-green-500';
    if (effectiveScore >= 60) return 'bg-yellow-500';
    if (effectiveScore >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score, inverse = false) => {
    const effectiveScore = inverse ? 100 - score : score;
    if (effectiveScore >= 80) return 'Excellent';
    if (effectiveScore >= 60) return 'Good';
    if (effectiveScore >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Architecture Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {architecturePatterns.map((pattern, idx) => {
          const Icon = pattern.icon;
          return (
            <motion.div
              key={pattern.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-700 ${pattern.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{pattern.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{pattern.description}</p>
                  </div>
                </div>
              </div>

              {/* Score Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-white">{pattern.score}%</span>
                  <span className={`text-sm font-medium ${
                    pattern.score >= 80 ? 'text-green-400' :
                    pattern.score >= 60 ? 'text-yellow-400' :
                    pattern.score >= 40 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {getScoreLabel(pattern.score, pattern.inverse)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pattern.score}%` }}
                    transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }}
                    className={`h-2 rounded-full ${getScoreColor(pattern.score, pattern.inverse)}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Architecture Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Network className="text-blue-400" size={20} />
            Architecture Insights
          </h4>
          <div className="space-y-3">
            {analysis.insights.slice(0, 5).map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 text-gray-300">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tech Stack Summary */}
      {techStack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Technology Stack</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.primary && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Primary Language{Array.isArray(techStack.primary) && techStack.primary.length > 1 ? 's' : ''}</p>
                <p className="text-white font-medium">
                  {Array.isArray(techStack.primary) 
                    ? techStack.primary.join(', ') 
                    : techStack.primary}
                </p>
              </div>
            )}
            {techStack.frameworks && techStack.frameworks.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Frameworks</p>
                <p className="text-white font-medium">{techStack.frameworks.slice(0, 2).join(', ')}</p>
              </div>
            )}
            {techStack.buildTools && techStack.buildTools.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Build Tools</p>
                <p className="text-white font-medium">{techStack.buildTools.slice(0, 2).join(', ')}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SystemsThinkingAnalysis;
