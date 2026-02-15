import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function CommitTimeline({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 text-center text-gray-500 dark:text-gray-400">
        No commit timeline data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Commit Timeline
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Activity over time
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 8 }}
            name="Total Commits"
          />
          <Line
            type="monotone"
            dataKey="aiDetected"
            stroke="#a855f7"
            strokeWidth={3}
            dot={{ fill: '#a855f7', r: 5 }}
            activeDot={{ r: 8 }}
            name="AI Detected"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
