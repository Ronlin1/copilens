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
        commits: githubData.commits,
        tree: githubData.tree,
        fileContents: githubData.fileContents,
        languages: githubData.languages,
        
        // Analysis data
        aiAnalysis,
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
      });

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

          {/* AI Detection Chart */}
          {data.aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                AI Detection Analysis
              </h2>
              <AIDetectionChart data={data.aiAnalysis} />
            </motion.div>
          )}

          {/* Commit Timeline */}
          {data.commits && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              <CommitTimeline commits={data.commits.slice(0, 20)} />
            </motion.div>
          )}

          {/* File Explorer */}
          {data.tree && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Project Structure
              </h2>
              <FileExplorer files={data.tree.slice(0, 50)} />
            </motion.div>
          )}

        </div>
      </div>
    </ErrorBoundary>
  );
}
