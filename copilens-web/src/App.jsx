import { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, Rocket, Home, Terminal, Menu, X, Zap, Info } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import { ENV } from './config/env';
import { DashboardPreview } from './components/ui/DashboardPreview';
import { AnimatedButton } from './components/ui/AnimatedButton';
import { cn } from './utils/cn';

import { AnimatedGridPattern } from './components/ui/AnimatedGridPattern';

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
    <div className="relative w-full overflow-hidden font-light text-white antialiased">

      {/* Grid confined to hero viewport only */}
      <div className="absolute inset-x-0 top-0 h-screen pointer-events-none overflow-hidden">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.25}
          duration={3}
          repeatDelay={1}
          className={cn(
            'mask-[radial-gradient(600px_circle_at_50%_40%,white,transparent)]',
            'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
          )}
        />
      </div>

      {/* ── Hero text block ── */}
      <div className="container relative z-10 mx-auto max-w-2xl px-4 pt-24 pb-0 text-center md:max-w-5xl md:px-6 lg:max-w-7xl">

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center"
        >
          {/* Title - Widened container to prevent squeezing */}
          <h1 className="mx-auto mb-4 max-w-5xl text-4xl font-bold leading-tight md:text-6xl lg:text-7xl text-white tracking-tight">
            Analyze Smarter with <span className="text-brand">AI-Powered</span> Code Insights
          </h1>

          {/* Subtitle - More descriptive, readable width */}
          <p className="mx-auto mb-8 max-w-3xl text-lg font-medium text-white/60 md:text-xl leading-relaxed">
            Copilens acts as an AI accountability layer, bringing transparency and trust to your AI-generated code changes.
          </p>

          {/* Search bar */}
          <div id="repo-search" className="mb-8 max-w-3xl w-full">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-2 shadow-2xl shadow-brand/5">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Paste repository URL..."
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-6 py-4 bg-transparent outline-none text-white placeholder-white/30 cursor-text"
                />
                <AnimatedButton
                  label="Analyze"
                  labelActive="Analyzing..."
                  icon={Sparkles}
                  hue={200}
                  disabled={!repoUrl.trim()}
                  onClick={handleAnalyze}
                />
              </div>
            </div>
            
            {/* Progress Bar Detail */}
            <div className="mt-6 flex flex-col items-center">
              <div className="w-full max-w-xl h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full bg-brand"
                />
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
                System Status: Ready for Analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Dashboard screenshot ── */}
        <motion.div
          className="relative mb-24"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="relative z-10 mx-auto max-w-5xl px-4">
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-3xl shadow-[0_0_80px_-20px_rgba(30,58,138,0.4)]">
              <DashboardPreview />
            </div>
          </div>
        </motion.div>

        {/* ── Features Section (The "Details") ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          {[
            { 
              title: "Smart Patterns", 
              desc: "Automatically detect signature patterns of AI-generated code vs human contributions.",
              icon: Sparkles
            },
            { 
              title: "Risk Scoring", 
              desc: "Measure cyclomatic complexity shifts to identify potential technical debt introduced by LLMs.",
              icon: Zap
            },
            { 
              title: "Native Integration", 
              desc: "Works directly with your Git workflow to provide accountability inside your CI/CD pipeline.",
              icon: Terminal
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm text-left hover:bg-white/10 hover:border-white/10 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 shadow-xl shadow-brand/10 transition-transform group-hover:scale-110">
                <feature.icon className="w-7 h-7 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand transition-colors">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

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
                    ? 'bg-brand/10 text-brand border border-brand/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4 ml-4">
            <Link
                to="/about"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Learn how it works
            </Link>
            <button
                onClick={() => {
                  if (location.pathname === '/') {
                    document.getElementById('repo-search')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/#repo-search';
                  }
                }}
                className="bg-brand-br hover:opacity-90 text-white text-sm font-bold px-5 py-2 rounded-full transition-all active:scale-95 shadow-lg shadow-brand/20"
            >
              Get Started
            </button>
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
                        ? 'bg-brand/10 text-brand border border-brand/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
                
                <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center text-gray-400 font-medium py-2"
                  >
                    Learn how it works
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (location.pathname === '/') {
                        document.getElementById('repo-search')?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.href = '/#repo-search';
                      }
                    }}
                    className="w-full bg-brand-br text-white font-bold py-3 rounded-xl shadow-lg"
                  >
                    Get Started
                  </button>
                </div>
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

          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

