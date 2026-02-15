import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Sparkles } from 'lucide-react';

export default function AIDetectionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 text-center text-gray-500 dark:text-gray-400">
        No language data available
      </div>
    );
  }

  const chartData = data;

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Language Distribution
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Code breakdown by language
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
