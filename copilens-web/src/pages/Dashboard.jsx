import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatsCards from '../components/Dashboard/StatsCards';
import CommitTimeline from '../components/Dashboard/CommitTimeline';
import AIDetectionChart from '../components/Dashboard/AIDetectionChart';
import FileExplorer from '../components/Dashboard/FileExplorer';
import { BarChart3, GitBranch, Sparkles, FolderTree, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import githubService from '../services/github';
import geminiService from '../services/gemini';

export default function Dashboard() {
  const [repoUrl, setRepoUrl] = useState(localStorage.getItem('currentRepo') || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load cached analysis if available
    const cached = localStorage.getItem('analysisData');
    const cachedUrl = localStorage.getItem('currentRepo');
    if (cached && cachedUrl === repoUrl) {
      setAnalysisData(JSON.parse(cached));
    }
  }, []);

  const analyzeRepo = async () => {
    if (!repoUrl) {
      setError('Please enter a repository URL');
      return;
    }

    if (!repoUrl.includes('github.com')) {
      setError('Currently only GitHub repositories are supported');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    setAnalysisData(null);
    
    try {
      // Step 1: Fetch repository data from GitHub
      setCurrentStep('Fetching repository data from GitHub...');
      setProgress(20);
      
      const repoData = await githubService.analyzeRepository(repoUrl);
      
      setProgress(40);
      setCurrentStep('Analyzing code with AI...');

      // Step 2: Analyze with Gemini
      const aiAnalysis = await geminiService.analyzeRepository(repoData);
      
      setProgress(70);
      setCurrentStep('Processing results...');

      // Step 3: Calculate additional metrics
      const totalLines = repoData.codeFiles.reduce((sum, file) => sum + (file.size || 0), 0);
      const languageStats = Object.entries(repoData.languages).map(([name, bytes]) => ({
        name,
        value: Math.round((bytes / Object.values(repoData.languages).reduce((a, b) => a + b, 0)) * 100)
      }));

      // Build commit timeline
      const commitTimeline = repoData.commits.reduce((acc, commit) => {
        const date = new Date(commit.commit.author.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = { date: monthYear, count: 0, aiDetected: 0 };
        }
        acc[monthYear].count++;
        
        // Estimate AI detection based on commit message patterns
        const message = commit.commit.message.toLowerCase();
        if (message.includes('copilot') || message.includes('ai') || 
            message.includes('auto') || message.length < 20) {
          acc[monthYear].aiDetected++;
        }
        
        return acc;
      }, {});

      const timelineData = Object.values(commitTimeline).sort((a, b) => 
        a.date.localeCompare(b.date)
      );

      // Build file tree
      const fileTree = githubService.buildFileTree(
        repoData.tree.filter(t => t.type === 'blob').slice(0, 100)
      );

      const finalData = {
        repoUrl,
        repoName: repoData.repoInfo.name,
        description: repoData.repoInfo.description,
        totalCommits: repoData.stats.totalCommits,
        aiDetectedCommits: Math.round(repoData.stats.totalCommits * (aiAnalysis.aiDetection.percentage / 100)),
        filesChanged: repoData.stats.totalCodeFiles,
        linesAnalyzed: Math.round(totalLines / 100), // Rough estimate
        contributors: repoData.stats.totalContributors,
        branches: repoData.stats.totalBranches,
        stars: repoData.stats.stars,
        forks: repoData.stats.forks,
        languages: languageStats,
        commits: timelineData,
        files: fileTree,
        aiAnalysis: aiAnalysis,
        lastUpdated: new Date().toISOString(),
        rawData: repoData
      };

      setProgress(100);
      setCurrentStep('Analysis complete!');
      
      setTimeout(() => {
        setAnalysisData(finalData);
        localStorage.setItem('analysisData', JSON.stringify(finalData));
        localStorage.setItem('currentRepo', repoUrl);
        setIsAnalyzing(false);
      }, 500);

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.message || 'Failed to analyze repository. Please try again.');
      setIsAnalyzing(false);
      setProgress(0);
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

        {/* Analysis Form or Progress */}
        {!analysisData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-2xl mb-8"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border-2 border-red-500 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Enter GitHub repository URL..."
                disabled={isAnalyzing}
                className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 border-2 border-primary-200 dark:border-primary-500/30 rounded-xl focus:outline-none focus:border-primary-500 transition-all disabled:opacity-50 cursor-text"
              />
              <button
                onClick={analyzeRepo}
                disabled={!repoUrl || isAnalyzing}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover-lift"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 inline mr-2" />
                    Analyze Repository
                  </>
                )}
              </button>
            </div>

            {isAnalyzing && (
              <div className="space-y-4 mt-6">
                {/* Progress Bar */}
                <div className="relative">
                  <div className="overflow-hidden h-3 flex rounded-full bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary-500 to-cyber-500"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{currentStep}</span>
                    <span className="text-sm font-semibold text-primary-500">{progress}%</span>
                  </div>
                </div>

                {/* Analysis Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className={`p-4 rounded-lg border-2 ${progress >= 20 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      {progress >= 20 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                      )}
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Fetching Data
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${progress >= 70 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      {progress >= 70 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : progress >= 20 ? (
                        <Loader className="w-5 h-5 text-primary-500 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        AI Analysis
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${progress >= 100 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      {progress >= 100 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : progress >= 70 ? (
                        <Loader className="w-5 h-5 text-primary-500 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Processing
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
