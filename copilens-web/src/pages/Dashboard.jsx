import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, BarChart3, Loader } from 'lucide-react';
import StatsCards from '../components/Dashboard/StatsCards';
import AIDetectionChart from '../components/Dashboard/AIDetectionChart';
import CommitTimeline from '../components/Dashboard/CommitTimeline';
import FileExplorer from '../components/Dashboard/FileExplorer';
import ErrorBoundary from '../components/ErrorBoundary';
import githubService from '../services/github';
import geminiService from '../services/gemini';
import { analyzeRepositoryComplexity } from '../utils/complexity';
import { analyzeSystemStructure, generateSystemsInsights } from '../utils/systemsThinking';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const repoUrl = searchParams.get('url');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeRepo = async (url) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting repository analysis for:', url);

      // Step 1: Fetch GitHub data
      console.log('📊 Fetching GitHub repository data...');
      const githubData = await githubService.analyzeRepository(url);
      console.log('✅ GitHub data fetched successfully:', {
        commits: githubData.stats.totalCommits,
        contributors: githubData.stats.totalContributors,
        branches: githubData.stats.totalBranches,
        files: githubData.stats.totalFiles,
      });

      // Step 2: Analyze code complexity
      console.log('🔍 Analyzing code complexity...');
      const complexityData = analyzeRepositoryComplexity(githubData.fileContents);
      console.log('✅ Complexity analysis complete:', {
        totalLines: complexityData.totalLines,
        averageCyclomatic: complexityData.averageCyclomatic,
        highRiskFiles: complexityData.highRiskFileCount,
      });

      // Step 3: Analyze system structure
      console.log('🏗️ Analyzing system architecture...');
      const systemsAnalysis = analyzeSystemStructure(githubData.tree, githubData.languages);
      console.log('✅ Systems analysis complete:', {
        patterns: systemsAnalysis.patterns.length,
        recommendations: systemsAnalysis.recommendations.length,
      });

      // Step 4: Run Gemini AI analysis
      console.log('🤖 Running Gemini AI analysis...');
      const aiAnalysis = await geminiService.analyzeRepository(githubData);
      console.log('✅ AI analysis complete:', {
        aiPercentage: aiAnalysis?.aiDetection?.percentage,
        confidence: aiAnalysis?.aiDetection?.confidence,
        codeQualityScore: aiAnalysis?.codeQuality?.score,
      });

      // Step 5: Generate systems insights
      console.log('💡 Generating systems thinking insights...');
      const systemsInsights = generateSystemsInsights(githubData, complexityData);
      console.log('✅ Systems insights generated:', {
        insightCount: systemsInsights.length,
      });

      // Step 6: Calculate lines changed
      console.log('📝 Calculating lines changed statistics...');
      const totalLines = complexityData.totalLines;
      const linesAdded = Math.round(totalLines * 0.6);
      const linesDeleted = Math.round(totalLines * 0.3);
      console.log('✅ Lines statistics calculated:', {
        totalLines,
        estimated_linesAdded: linesAdded,
        estimated_linesDeleted: linesDeleted,
      });

      // Step 7: Construct final data with safe access
      console.log('🔨 Constructing final data structure...');
      
      // Transform languages for chart (expects array with name/value)
      const languageChartData = Object.entries(githubData.languages).map(([name, bytes]) => ({
        name,
        value: bytes
      }));
      
      // Build commit timeline with dates (expects array with date/count/aiDetected)
      const commitTimeline = {};
      githubData.commits.forEach(commit => {
        const date = new Date(commit.commit.author.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!commitTimeline[monthYear]) {
          commitTimeline[monthYear] = { date: monthYear, count: 0, aiDetected: 0 };
        }
        commitTimeline[monthYear].count++;
        
        // Simple AI detection heuristic based on commit message
        const message = commit.commit.message.toLowerCase();
        if (message.includes('copilot') || message.includes('ai-generated') || 
            message.includes('auto-generated') || message.length < 20) {
          commitTimeline[monthYear].aiDetected++;
        }
      });
      
      const timelineData = Object.values(commitTimeline).sort((a, b) => 
        a.date.localeCompare(b.date)
      );
      
      // Build file tree structure (expects array with name/type/children/size)
      const buildFileTree = (files) => {
        const root = {};
        
        files.forEach(file => {
          const parts = file.path.split('/');
          let current = root;
          
          parts.forEach((part, index) => {
            if (!current[part]) {
              current[part] = {
                name: part,
                type: index === parts.length - 1 ? 'file' : 'folder',
                path: parts.slice(0, index + 1).join('/'),
                children: {},
                size: index === parts.length - 1 ? file.size : null
              };
            }
            current = current[part].children;
          });
        });
        
        const flatten = (obj) => {
          return Object.values(obj).map(item => ({
            name: item.name,
            type: item.type,
            path: item.path,
            size: item.size,
            children: Object.keys(item.children).length > 0 ? flatten(item.children) : undefined
          }));
        };
        
        return flatten(root);
      };
      
      const fileTreeStructure = buildFileTree(githubData.tree.slice(0, 100));
      
      const finalData = {
        // Basic stats
        totalCommits: githubData.stats.totalCommits || 0,
        aiDetectedCommits: Math.round(
          (githubData.stats.totalCommits * (aiAnalysis?.aiDetection?.percentage || 0)) / 100
        ),
        filesChanged: githubData.stats.totalCodeFiles || 0,
        linesAdded,
        linesDeleted,
        contributors: githubData.stats.totalContributors || 0,
        branches: githubData.stats.totalBranches || 0,

        // Additional data
        repoInfo: githubData.repoInfo,
        commits: timelineData, // Formatted timeline data
        tree: fileTreeStructure, // Formatted tree structure
        fileContents: githubData.fileContents,
        languages: languageChartData, // Formatted for pie chart
        
        // Analysis data
        aiAnalysis: {
          ...aiAnalysis,
          languages: languageChartData // For AIDetectionChart
        },
        complexityData,
        systemsAnalysis,
        systemsInsights,
      };

      console.log('✅ Final data structure constructed successfully:', {
        totalCommits: finalData.totalCommits,
        aiDetectedCommits: finalData.aiDetectedCommits,
        filesChanged: finalData.filesChanged,
        linesAdded: finalData.linesAdded,
        linesDeleted: finalData.linesDeleted,
        contributors: finalData.contributors,
        branches: finalData.branches,
        hasCommitTimeline: finalData.commits?.length > 0,
        hasFileTree: finalData.tree?.length > 0,
        hasLanguageData: finalData.languages?.length > 0,
        hasAIAnalysis: !!finalData.aiAnalysis,
      });
      
      console.log('📊 Chart Data Preview:');
      console.log('  - Languages:', finalData.languages?.slice(0, 3));
      console.log('  - Timeline:', finalData.commits?.slice(0, 3));
      console.log('  - File Tree:', finalData.tree?.slice(0, 2));

      setData(finalData);
      console.log('✨ Repository analysis completed successfully!');

    } catch (err) {
      const errorMessage = err.message || 'Failed to analyze repository';
      console.error('❌ Analysis failed with error:', {
        message: errorMessage,
        stack: err.stack,
        url: url,
      });
      console.error('Full error object:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoUrl) {
      analyzeRepo(repoUrl);
    }
  }, [repoUrl]);

  if (!repoUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              No Repository Specified
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Please provide a repository URL to analyze
            </p>
            <a
              href="/"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-105"
            >
              Go Home
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Loader className="w-16 h-16 text-primary-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analyzing Repository
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This may take a moment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Analysis Failed
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {error}
            </p>
            <a
              href="/"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary-500 to-cyber-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-105"
            >
              Try Another Repository
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary-500 to-cyber-500">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {data.repoInfo?.name || 'Repository'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {data.repoInfo?.description || 'Repository Analysis'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Repository Statistics
            </h2>
            <StatsCards data={data} />
          </motion.div>

          {/* AI Detection Analysis */}
          {data.aiAnalysis && data.aiAnalysis.languages && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                AI Detection Analysis
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Detection Summary */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    AI Detection Score
                  </h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-40 h-40">
                      <svg className="transform -rotate-90 w-40 h-40">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 70}`}
                          strokeDashoffset={`${2 * Math.PI * 70 * (1 - (data.aiAnalysis.aiDetection?.percentage || 0) / 100)}`}
                          className="text-purple-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900 dark:text-white">
                            {data.aiAnalysis.aiDetection?.percentage || 0}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            AI Detected
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {data.aiAnalysis.aiDetection?.confidence || 'Medium'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Code Quality:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {data.aiAnalysis.codeQuality?.score || 0}/10
                      </span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Language Distribution */}
                <AIDetectionChart data={data.aiAnalysis.languages} />
              </div>
            </motion.div>
          )}

          {/* Commit Timeline */}
          {data.commits && data.commits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Commit Activity Timeline
              </h2>
              <CommitTimeline data={data.commits} />
            </motion.div>
          )}

          {/* File Explorer */}
          {data.tree && data.tree.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Project Structure
              </h2>
              <FileExplorer files={data.tree} />
            </motion.div>
          )}

        </div>
      </div>
    </ErrorBoundary>
  );
}
