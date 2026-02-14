import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatsCards from '../components/Dashboard/StatsCards';
import CommitTimeline from '../components/Dashboard/CommitTimeline';
import AIDetectionChart from '../components/Dashboard/AIDetectionChart';
import FileExplorer from '../components/Dashboard/FileExplorer';
import { BarChart3, GitBranch, Sparkles, FolderTree } from 'lucide-react';

export default function Dashboard() {
  const [repoUrl, setRepoUrl] = useState(localStorage.getItem('currentRepo') || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    // Load cached analysis if available
    const cached = localStorage.getItem('analysisData');
    if (cached) {
      setAnalysisData(JSON.parse(cached));
    }
  }, []);

  const analyzeRepo = async () => {
    if (!repoUrl) return;

    setIsAnalyzing(true);
    
    try {
      // TODO: Replace with actual API call
      // Simulated data for now
      const mockData = {
        totalCommits: 247,
        aiDetectedCommits: 89,
        filesChanged: 156,
        linesAdded: 8934,
        linesDeleted: 2341,
        contributors: 12,
        branches: 8,
        languages: {
          Python: 45,
          JavaScript: 30,
          TypeScript: 15,
          CSS: 10
        },
        commits: [
          { date: '2024-01', count: 45, aiDetected: 15 },
          { date: '2024-02', count: 67, aiDetected: 24 },
          { date: '2024-03', count: 89, aiDetected: 32 },
          { date: '2024-04', count: 46, aiDetected: 18 }
        ],
        files: [
          { name: 'src', type: 'folder', children: [
            { name: 'components', type: 'folder', children: [
              { name: 'Header.jsx', type: 'file', size: '2.3 KB' },
              { name: 'Footer.jsx', type: 'file', size: '1.8 KB' }
            ]},
            { name: 'App.jsx', type: 'file', size: '5.4 KB' }
          ]},
          { name: 'README.md', type: 'file', size: '3.2 KB' },
          { name: 'package.json', type: 'file', size: '1.5 KB' }
        ]
      };

      setTimeout(() => {
        setAnalysisData(mockData);
        localStorage.setItem('analysisData', JSON.stringify(mockData));
        localStorage.setItem('currentRepo', repoUrl);
        setIsAnalyzing(false);
      }, 2000);

    } catch (error) {
      if (!import.meta.env.PROD) {
        console.error('Analysis failed:', error);
      }
      // Show error to user
      alert('Failed to analyze repository. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze and monitor your repository
          </p>
        </motion.div>

        {/* Search Bar */}
        {!analysisData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-2xl mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Enter GitHub/GitLab repository URL..."
                className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-500/30 rounded-xl focus:outline-none focus:border-primary-500 transition-all"
              />
              <button
                onClick={analyzeRepo}
                disabled={!repoUrl || isAnalyzing}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Repository'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysisData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <StatsCards data={analysisData} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CommitTimeline data={analysisData.commits} />
              <AIDetectionChart data={analysisData.languages} />
            </div>

            {/* File Explorer */}
            <FileExplorer files={analysisData.files} />

            {/* Re-analyze Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setAnalysisData(null);
                  localStorage.removeItem('analysisData');
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Analyze Different Repository
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
