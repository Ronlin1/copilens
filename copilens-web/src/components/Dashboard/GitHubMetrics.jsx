import { motion } from 'framer-motion';
import { GitPullRequest, AlertCircle, Tag, Star, GitFork, Eye } from 'lucide-react';

export default function GitHubMetrics({ stats, repoInfo }) {
  console.log('📊 GitHubMetrics received:', { stats, repoInfo });
  
  if (!stats || !repoInfo) {
    console.warn('⚠️ GitHubMetrics missing data:', { stats, repoInfo });
    return null;
  }

  const metrics = [
    {
      icon: Star,
      label: 'Stars',
      value: stats.stars?.toLocaleString() || '0',
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      icon: GitFork,
      label: 'Forks',
      value: stats.forks?.toLocaleString() || '0',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Eye,
      label: 'Watchers',
      value: stats.watchers?.toLocaleString() || '0',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: GitPullRequest,
      label: 'Pull Requests',
      value: stats.totalPRs?.toLocaleString() || '0',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      details: `${stats.openPRs || 0} open, ${stats.mergedPRs || 0} merged`
    },
    {
      icon: AlertCircle,
      label: 'Issues',
      value: stats.totalIssues?.toLocaleString() || '0',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      details: `${stats.openIssuesCount || 0} open, ${stats.closedIssuesCount || 0} closed`
    },
    {
      icon: Tag,
      label: 'Releases',
      value: stats.totalReleases?.toLocaleString() || '0',
      color: 'from-cyan-500 to-teal-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      details: stats.latestRelease !== 'None' ? `Latest: ${stats.latestRelease}` : 'No releases'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          GitHub Repository Metrics
        </h3>
        {stats.license && (
          <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
            License: {stats.license}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03 }}
            className={`${metric.bgColor} p-4 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden cursor-pointer`}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`}></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                  <metric.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
              </div>
              {metric.details && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metric.details}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Repository topics */}
      {stats.topics && stats.topics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Topics:</p>
          <div className="flex flex-wrap gap-2">
            {stats.topics.slice(0, 10).map((topic, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-full border border-blue-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
