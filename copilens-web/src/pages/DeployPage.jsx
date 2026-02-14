import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Cloud, Server, Code, PlayCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function DeployPage() {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);
  const [logs, setLogs] = useState([]);

  const platforms = [
    {
      id: 'vercel',
      name: 'Vercel',
      icon: '▲',
      color: 'from-black to-gray-800',
      desc: 'Perfect for Next.js and React apps'
    },
    {
      id: 'netlify',
      name: 'Netlify',
      icon: '◆',
      color: 'from-cyan-500 to-teal-500',
      desc: 'Ideal for static sites and JAMstack'
    },
    {
      id: 'railway',
      name: 'Railway',
      icon: '🚂',
      color: 'from-purple-500 to-pink-500',
      desc: 'Great for full-stack applications'
    },
    {
      id: 'heroku',
      name: 'Heroku',
      icon: '⬢',
      color: 'from-purple-600 to-indigo-600',
      desc: 'Classic PaaS for any language'
    }
  ];

  const handleDeploy = async () => {
    if (!selectedPlatform) return;

    setIsDeploying(true);
    setDeployStatus('deploying');
    setLogs([]);

    const platform = platforms.find(p => p.id === selectedPlatform);
    const deploymentSteps = [
      { msg: '🔍 Analyzing repository structure...', delay: 800 },
      { msg: '📦 Installing dependencies with npm...', delay: 1200 },
      { msg: '🔨 Building production bundle...', delay: 1800 },
      { msg: `🚀 Deploying to ${platform.name}...`, delay: 2200 },
      { msg: '⚙️ Configuring environment...', delay: 2800 },
      { msg: '✅ Deployment successful!', delay: 3200 },
      { msg: `🌐 Live at: https://your-app-${selectedPlatform}.app`, delay: 3500 }
    ];

    for (const step of deploymentSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setLogs(prev => [...prev, step.msg]);
    }

    setDeployStatus('success');
    setIsDeploying(false);
  };

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
            Deploy Your App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            One-click deployment to your favorite platform
          </p>
        </motion.div>

        {/* Platform Selection */}
        {!deployStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedPlatform(platform.name)}
                className={`glass p-6 rounded-xl border-2 cursor-pointer transition-all hover-lift ${
                  selectedPlatform === platform.name
                    ? 'border-primary-500 shadow-lg shadow-primary-500/50'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
              >
                <div className={`text-4xl mb-4 text-center p-4 rounded-lg bg-gradient-to-r ${platform.color} text-white`}>
                  {platform.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {platform.desc}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Deploy Button */}
        {!deployStatus && selectedPlatform && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-12 py-4 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3 cursor-pointer hover-lift"
            >
              <Rocket className="w-6 h-6" />
              Deploy to {selectedPlatform}
            </button>
          </motion.div>
        )}

        {/* Deployment Logs */}
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                <Server className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Deployment Logs
              </h3>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-green-400 mb-2"
                >
                  {log}
                </motion.div>
              ))}
              {isDeploying && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Deploying...</span>
                </div>
              )}
            </div>

            {deployStatus === 'success' && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setDeployStatus(null);
                    setSelectedPlatform(null);
                    setLogs([]);
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Deploy Another
                </button>
                <a
                  href="https://your-app.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all inline-flex items-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  View Live Site
                </a>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
