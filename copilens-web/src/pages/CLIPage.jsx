import { motion } from 'framer-motion';
import { Terminal, Download, BookOpen, Zap, CheckCircle } from 'lucide-react';

export default function CLIPage() {
  const installSteps = [
    {
      title: '1. Clone Repository',
      description: 'Get the latest version from GitHub',
      command: 'git clone https://github.com/yourusername/copilens.git'
    },
    {
      title: '2. Navigate to CLI',
      description: 'Enter the CLI directory',
      command: 'cd copilens/copilens_cli'
    },
    {
      title: '3. Install Dependencies',
      description: 'Install required Python packages',
      command: 'pip install -r requirements.txt'
    },
    {
      title: '4. Install Copilens',
      description: 'Install in editable mode for development',
      command: 'pip install -e .'
    }
  ];

  const commands = [
    { cmd: 'copilens stats', desc: 'Show repository statistics and AI detection' },
    { cmd: 'copilens chat', desc: 'Interactive chat with AI about your code' },
    { cmd: 'copilens deploy', desc: 'Auto-deploy to cloud platforms' },
    { cmd: 'copilens analyze', desc: 'Deep code analysis and insights' },
    { cmd: 'copilens config setup', desc: 'Configure API keys and settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gradient mb-4">
            Copilens CLI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Powerful AI-powered code analysis from your terminal
          </p>
        </motion.div>

        {/* Installation Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {installSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-primary-500 to-cyber-500">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {step.description}
                  </p>
                  <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-green-400">
                    $ {step.command}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Command Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-8 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Command Reference
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Essential commands to get started
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {commands.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <code className="flex-shrink-0 px-3 py-1 bg-gray-900 text-green-400 rounded font-mono text-sm">
                  {item.cmd}
                </code>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              desc: 'Analyze repositories in seconds',
              color: 'from-yellow-500 to-orange-500'
            },
            {
              icon: BookOpen,
              title: 'AI-Powered',
              desc: 'Gemini AI integration for insights',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Download,
              title: 'Easy Deploy',
              desc: 'One command to deploy anywhere',
              color: 'from-green-500 to-emerald-500'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 text-center"
            >
              <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${feature.color} mb-4`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
