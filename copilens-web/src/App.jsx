import { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles, BarChart3, Rocket, Home, Terminal, Menu, X, Zap, Info } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { ENV } from './config/env';
import { AnimatedGridPattern } from './components/ui/AnimatedGridPattern';
import { cn } from './utils/cn';

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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">

      {/* Animated Grid Pattern Background */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.25}
        duration={3}
        repeatDelay={1}
        className={cn(
          '[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]',
          'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
        )}
      />



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
            <div className="p-3 md:p-4 rounded-2xl bg-brand">
              <Zap className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
            <span className="text-brand">
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
          <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-600/40 rounded-2xl p-2">
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
                className="px-8 py-4 bg-brand text-white rounded-xl font-semibold transition-all hover:scale-105 w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              gradient: 'from-brand-purple to-brand-violet'
            },
            {
              icon: BarChart3,
              title: 'Deep Analytics',
              description: 'Comprehensive insights into your codebase',
              gradient: 'from-brand-cyan to-brand-blue'
            },
            {
              icon: Rocket,
              title: 'Auto Deploy',
              description: 'Deploy to cloud platforms with one click',
              gradient: 'from-brand-blue to-brand-indigo'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg border border-gray-200/30 dark:border-gray-600/30 p-6 rounded-xl cursor-pointer transition-all"
            >
              <div className={`inline-flex p-3 rounded-lg bg-linear-to-r ${feature.gradient} mb-4`}>
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
            <div className="p-1 rounded-lg bg-brand">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-brand">
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
                    ? 'bg-brand text-white'
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
                        ? 'bg-brand text-white'
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
        <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
          
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

