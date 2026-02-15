import { motion } from 'framer-motion';
import { GitCommit, Sparkles, FileText, Users, GitBranch, Code } from 'lucide-react';

export default function StatsCards({ data }) {
  const stats = [
    {
      icon: GitCommit,
      label: 'Total Commits',
      value: data.totalCommits.toLocaleString(),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Sparkles,
      label: 'AI Detected',
      value: data.aiDetectedCommits.toLocaleString(),
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      badge: `${Math.round((data.aiDetectedCommits / data.totalCommits) * 100)}%`
    },
    {
      icon: FileText,
      label: 'Files Changed',
      value: data.filesChanged.toLocaleString(),
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Code,
      label: 'Lines Changed',
      value: `+${data.linesAdded.toLocaleString()} -${data.linesDeleted.toLocaleString()}`,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      icon: Users,
      label: 'Contributors',
      value: data.contributors.toLocaleString(),
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
    {
      icon: GitBranch,
      label: 'Branches',
      value: data.branches.toLocaleString(),
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`glass ${stat.bgColor} p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden`}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.badge && (
                <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${stat.color} text-white text-sm font-semibold`}>
                  {stat.badge}
                </span>
              )}
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              {stat.label}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>

          {/* Animated Border */}
          <motion.div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} opacity-0`}
            whileHover={{ opacity: 0.1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      ))}
    </div>
  );
}
