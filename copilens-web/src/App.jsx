import { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles, BarChart3, Rocket, Home, Terminal, Menu, X, Zap, Info } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { ENV } from './config/env';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CLIPage = lazy(() => import('./pages/CLIPage'));
const DeployPage = lazy(() => import('./pages/DeployPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const FloatingChatButton = lazy(() => import('./components/Chat/FloatingChatButton'));

function LandingPage() {
  const [repoUrl, setRepoUrl] = useState('');

  useEffect(() => {
    // Set page title and meta
    document.title = `${ENV.APP_NAME} - AI-Powered Repository Analysis`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', ENV.APP_DESCRIPTION);
    }
  }, []);

  const handleAnalyze = () => {
    if (repoUrl.trim()) {
      window.location.href = `/dashboard?url=${encodeURIComponent(repoUrl.trim())}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyber-500 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-6xl md:text-8xl font-bold flex items-center justify-center gap-4">
            <Zap className="w-16 h-16 md:w-20 md:h-20 text-primary-500 animate-pulse" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-cyan-500 to-purple-600">
              COPILENS
            </span>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 font-light"
        >
          AI-Powered Repository Analysis & Deployment
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg border-2 border-primary-500/50 rounded-2xl p-2 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover-glow">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Paste repository URL (GitHub/GitLab/Bitbucket)..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-6 py-4 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 cursor-text"
              />
              <button 
                onClick={handleAnalyze}
                disabled={!repoUrl.trim()}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-105 w-full sm:w-auto cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                Analyze
              </button>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Sparkles,
              title: 'AI Detection',
              description: 'Detect AI-generated code with advanced ML models',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: BarChart3,
              title: 'Deep Analytics',
              description: 'Comprehensive insights into your codebase',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Rocket,
              title: 'Auto Deploy',
              description: 'Deploy to cloud platforms with one click',
              gradient: 'from-orange-500 to-red-500'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 p-6 rounded-xl cursor-pointer hover:border-primary-500/50 transition-all"
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
        </motion.div>

      </div>
    </div>
  );
}

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/deploy', label: 'Deploy', icon: Rocket },
    { to: '/cli', label: 'CLI', icon: Terminal },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-cyan-500 to-purple-600">
              COPILENS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  location.pathname === link.to
                    ? 'bg-gradient-to-r from-primary-500 to-cyber-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
          

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      location.pathname === link.to
                        ? 'bg-gradient-to-r from-primary-500 to-cyber-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function App() {
  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
          
          <Navigation />
          
          <div className="pt-16">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/deploy" element={<DeployPage />} />
                <Route path="/cli" element={<CLIPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>

          {ENV.ENABLE_CHAT && (
            <Suspense fallback={null}>
              <FloatingChatButton />
            </Suspense>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

