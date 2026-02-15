import { motion } from 'framer-motion';
import { AlertTriangle, Shield, TrendingUp, Activity, Brain, Gauge } from 'lucide-react';

export default function ComplexityMetrics({ data }) {
  if (!data) {
    return null;
  }

  const { complexityData, aiAnalysis } = data;

  // Calculate overall scores
  const avgCyclomatic = complexityData?.averageCyclomatic || 0;
  const avgCognitive = complexityData?.averageCognitive || 0;
  const highRiskCount = complexityData?.highRiskFileCount || 0;
  const totalFiles = complexityData?.files?.length || 1;
  const riskPercentage = Math.round((highRiskCount / totalFiles) * 100);

  // Maintainability score (weighted average)
  const avgMaintainability = complexityData?.files?.reduce((sum, f) => 
    sum + (f.maintainability?.score || 50), 0) / totalFiles || 50;

  // Risk level determination
  const getRiskLevel = () => {
    if (riskPercentage > 30 || avgCyclomatic > 15) return { level: 'Critical', color: 'red', score: 85 };
    if (riskPercentage > 15 || avgCyclomatic > 10) return { level: 'High', color: 'orange', score: 65 };
    if (riskPercentage > 5 || avgCyclomatic > 7) return { level: 'Medium', color: 'yellow', score: 40 };
    return { level: 'Low', color: 'green', score: 20 };
  };

  const riskInfo = getRiskLevel();

  const metrics = [
    {
      icon: Activity,
      label: 'Cyclomatic Complexity',
      value: avgCyclomatic.toFixed(1),
      max: 20,
      description: 'Measures code paths (if/for/while)',
      interpretation: avgCyclomatic <= 5 ? 'Simple & Testable' : 
                      avgCyclomatic <= 10 ? 'Moderate Complexity' : 
                      avgCyclomatic <= 15 ? 'Complex - Needs Review' : 'Very Complex - Refactor!',
      color: avgCyclomatic <= 5 ? 'green' : avgCyclomatic <= 10 ? 'blue' : avgCyclomatic <= 15 ? 'yellow' : 'red',
      algorithm: 'M = E - N + 2P (edges - nodes + 2*components) = 1 + decision_points'
    },
    {
      icon: Brain,
      label: 'Cognitive Complexity',
      value: avgCognitive.toFixed(1),
      max: 30,
      description: 'How hard to understand (nesting-weighted)',
      interpretation: avgCognitive <= 10 ? 'Easy to Understand' : 
                      avgCognitive <= 20 ? 'Moderate Difficulty' : 
                      avgCognitive <= 30 ? 'Difficult to Grasp' : 'Very Difficult!',
      color: avgCognitive <= 10 ? 'green' : avgCognitive <= 20 ? 'blue' : avgCognitive <= 30 ? 'yellow' : 'red',
      algorithm: 'Σ(control_structures * nesting_level) + logical_operators'
    },
    {
      icon: Gauge,
      label: 'Maintainability Index',
      value: Math.round(avgMaintainability),
      max: 100,
      description: 'Microsoft maintainability formula',
      interpretation: avgMaintainability > 85 ? 'Highly Maintainable' : 
                      avgMaintainability > 65 ? 'Moderately Maintainable' : 
                      avgMaintainability > 50 ? 'Difficult to Maintain' : 'Critical - Hard to Maintain!',
      color: avgMaintainability > 85 ? 'green' : avgMaintainability > 65 ? 'blue' : avgMaintainability > 50 ? 'yellow' : 'red',
      algorithm: '171 - 5.2*ln(V) - 0.23*G - 16.2*ln(L) normalized to 0-100'
    },
    {
      icon: AlertTriangle,
      label: 'Risk Score',
      value: riskInfo.score,
      max: 100,
      description: `${highRiskCount} high-risk files (${riskPercentage}%)`,
      interpretation: `${riskInfo.level} Risk Level`,
      color: riskInfo.color,
      algorithm: 'complexity_risk + size_risk + doc_risk + bug_estimates'
    }
  ];

  const getColorClass = (color, type = 'bg') => {
    const colors = {
      green: type === 'bg' ? 'bg-green-500' : type === 'text' ? 'text-green-600 dark:text-green-400' : 'border-green-500',
      blue: type === 'bg' ? 'bg-blue-500' : type === 'text' ? 'text-blue-600 dark:text-blue-400' : 'border-blue-500',
      yellow: type === 'bg' ? 'bg-yellow-500' : type === 'text' ? 'text-yellow-600 dark:text-yellow-400' : 'border-yellow-500',
      orange: type === 'bg' ? 'bg-orange-500' : type === 'text' ? 'text-orange-600 dark:text-orange-400' : 'border-orange-500',
      red: type === 'bg' ? 'bg-red-500' : type === 'text' ? 'text-red-600 dark:text-red-400' : 'border-red-500',
    };
    return colors[color] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Code Complexity & Risk Analysis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all cursor-pointer group"
          >
            {/* Icon & Label */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClass(metric.color, 'bg')}`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${getColorClass(metric.color, 'text')} ${getColorClass(metric.color, 'border')} border-2 bg-opacity-10`}>
                {metric.interpretation.split(' ')[0]}
              </div>
            </div>

            {/* Metric Label */}
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {metric.label}
            </h3>

            {/* Value & Progress Bar */}
            <div className="mb-3">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </span>
                <span className="text-lg text-gray-500 dark:text-gray-400">
                  / {metric.max}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className={`h-full ${getColorClass(metric.color, 'bg')}`}
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {metric.description}
            </p>

            {/* Interpretation */}
            <p className={`text-sm font-semibold ${getColorClass(metric.color, 'text')}`}>
              {metric.interpretation}
            </p>

            {/* Algorithm (on hover) */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                Algorithm: {metric.algorithm}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Risky Files */}
      {complexityData?.topRiskyFiles && complexityData.topRiskyFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Top 5 High-Risk Files (Refactor Priority)
            </h3>
          </div>
          
          <div className="space-y-3">
            {complexityData.topRiskyFiles.slice(0, 5).map((file, index) => (
              <motion.div
                key={file.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-mono text-sm text-gray-900 dark:text-white font-semibold">
                      {file.path}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-semibold">
                        Risk: {file.risk.score}%
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                        Cyclomatic: {file.cyclomatic}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                        Cognitive: {file.cognitive}
                      </span>
                      {file.maintainability && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                          Maintainability: {file.maintainability.score}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      #{index + 1}
                    </div>
                  </div>
                </div>
                {file.risk.factors && file.risk.factors.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
                      Risk Factors:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                      {file.risk.factors.slice(0, 3).map((factor, i) => (
                        <li key={i}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
