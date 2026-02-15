import { motion } from 'framer-motion';
import { Zap, Sparkles, BarChart3, Rocket, Code2, Shield, Cpu, Globe, Mail, ExternalLink, AlertCircle, Clock } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Code Detection',
      description: 'Advanced machine learning models detect AI-generated code patterns with high accuracy using Google Gemini 3 Pro.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Analytics',
      description: 'Deep insights into code complexity, maintainability, risk assessment, and systems thinking analysis.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Code2,
      title: 'Multi-Language Support',
      description: 'Analyzes JavaScript, TypeScript, Python, Java, Go, C++, and many more programming languages.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Rocket,
      title: 'Deployment Detection',
      description: 'Automatically detects deployment configurations for Vercel, Netlify, Railway, Heroku, and Docker.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'Security & Quality',
      description: 'Identifies high-risk files, code smells, and potential vulnerabilities in your codebase.',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: Cpu,
      title: 'Real-Time Processing',
      description: 'Live progress tracking during analysis with holographic notifications and detailed metrics.',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  const limitations = [
    {
      icon: Globe,
      title: 'Public Repositories Only',
      description: 'Currently supports only public GitHub repositories. Private repository support coming soon with authentication.'
    },
    {
      icon: Rocket,
      title: 'No One-Click Deploy (Yet)',
      description: 'Deployment detection is available, but actual one-click deployments to cloud platforms are in development.'
    },
    {
      icon: Code2,
      title: 'GitHub-Focused',
      description: 'GitLab and Bitbucket support is experimental. Full multi-platform support is on the roadmap.'
    },
    {
      icon: Clock,
      title: 'Rate Limits',
      description: 'GitHub API and Gemini API rate limits may affect analysis speed for very large repositories.'
    }
  ];

  const upcoming = [
    '🚀 One-click deployments to Vercel, Netlify, Railway, and Heroku',
    '🔐 Private repository support with GitHub OAuth authentication',
    '🔧 GitLab and Bitbucket full integration',
    '🤖 Custom deployment pipelines and CI/CD automation',
    '👥 Team collaboration features and shared analysis',
    '📊 Repository comparison and diff analysis',
    '🧪 Pull request analysis and automated code review',
    '📱 Mobile app for on-the-go repository insights'
  ];

  const techStack = [
    { name: 'Google Gemini 3 Pro', desc: 'AI-powered code analysis and insights' },
    { name: 'GitHub REST API', desc: 'Repository data and statistics' },
    { name: 'React 18', desc: 'Modern, fast user interface' },
    { name: 'Vite', desc: 'Lightning-fast development and builds' },
    { name: 'Framer Motion', desc: 'Smooth animations and transitions' },
    { name: 'Tailwind CSS', desc: 'Beautiful, responsive styling' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Zap className="w-16 h-16 text-primary-500 animate-pulse" />
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-cyan-500 to-purple-600">
              COPILENS
            </h1>
          </div>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4 font-light">
            AI-Powered Repository Analysis & Deployment Platform
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Copilens leverages advanced AI to analyze GitHub repositories, detect AI-generated code, assess complexity, identify risks, and provide actionable insights for developers and teams.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass p-6 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How It Works
          </h2>
          <div className="glass p-8 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { num: '1', title: 'Enter URL', desc: 'Paste any public GitHub repository URL' },
                { num: '2', title: 'AI Analysis', desc: 'Gemini 3 Pro analyzes code patterns and quality' },
                { num: '3', title: 'Get Insights', desc: 'View complexity, risks, and AI detection results' },
                { num: '4', title: 'Deploy', desc: 'See detected configs and deployment options' }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-cyber-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Powered By
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="glass p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                  {tech.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Current Limitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Current Limitations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {limitations.map((limitation, index) => (
              <div
                key={index}
                className="glass p-6 rounded-xl border border-yellow-500/30 dark:border-yellow-500/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <limitation.icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {limitation.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {limitation.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Coming Soon
          </h2>
          <div className="glass p-8 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-cyber-500" />
                  <p className="text-gray-700 dark:text-gray-300">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <div className="glass p-8 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Get In Touch
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Have questions, feedback, or want to collaborate? Connect with me to discuss Copilens, share ideas, or explore partnership opportunities.
            </p>
            <a
              href="https://atuhaire.com/connect"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-105"
            >
              <Mail className="w-6 h-6" />
              Connect with Me
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
