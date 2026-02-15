import axios from 'axios';

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.token = import.meta.env.VITE_GITHUB_TOKEN;
    
    // Set up headers with or without authentication
    this.headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (this.token && this.token.trim() !== '') {
      this.headers['Authorization'] = `token ${this.token}`;
      console.log('✅ GitHub API: Using authenticated requests (5,000/hour)');
    } else {
      console.warn('⚠️  GitHub API: Using unauthenticated requests (60/hour)');
      console.warn('   Add VITE_GITHUB_TOKEN to .env for better rate limits');
    }
  }

  parseGitHubUrl(url) {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (!match) throw new Error('Invalid GitHub URL');
    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  }

  async checkRateLimit() {
    try {
      const response = await axios.get(`${this.baseURL}/rate_limit`, {
        headers: this.headers
      });
      console.log('📊 GitHub API Rate Limit:', {
        remaining: response.data.rate.remaining,
        limit: response.data.rate.limit,
        reset: new Date(response.data.rate.reset * 1000).toLocaleTimeString()
      });
      return response.data.rate;
    } catch (error) {
      console.warn('Could not check rate limit:', error.message);
      return null;
    }
  }

  async getRepoInfo(owner, repo) {
    const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, {
      headers: this.headers
    });
    console.log('📦 RepoInfo fetched:', {
      name: response.data.name,
      stars: response.data.stargazers_count,
      forks: response.data.forks_count,
      watchers: response.data.subscribers_count,
      openIssues: response.data.open_issues_count
    });
    return response.data;
  }

  async getCommits(owner, repo, perPage = 100, onProgress) {
    try {
      // Fetch ALL commits by paginating through all pages
      const commits = [];
      let page = 1;
      let hasMore = true;
      
      console.log('📥 Fetching commits (this may take a moment)...');
      if (onProgress) onProgress({ type: 'commits', status: 'fetching', current: 0, page: 0 });
      
      while (hasMore && commits.length < 10000) { // Increased limit: 10000 commits max
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`,
          { headers: this.headers }
        );
        
        commits.push(...response.data);
        
        // Log progress every page
        if (onProgress) {
          onProgress({ 
            type: 'commits', 
            status: 'fetching', 
            current: commits.length, 
            page,
            hasMore: response.data.length >= perPage
          });
        }
        
        // Log to console every 5 pages
        if (page % 5 === 0) {
          console.log(`   📊 Commits: ${commits.length} fetched (page ${page})...`);
        }
        
        // Check if there are more pages
        if (response.data.length < perPage) {
          hasMore = false; // Last page
        } else {
          page++;
        }
      }
      
      console.log(`✅ Fetched ${commits.length} commits from GitHub API`);
      if (onProgress) onProgress({ type: 'commits', status: 'complete', current: commits.length, total: commits.length });
      return commits;
    } catch (error) {
      console.error('Error fetching commits:', error);
      if (onProgress) onProgress({ type: 'commits', status: 'error', error: error.message });
      return [];
    }
  }

  async getCommitStats(owner, repo) {
    try {
      // Get commit activity stats
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/stats/commit_activity`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.warn('Could not fetch commit stats:', error.message);
      return [];
    }
  }

  async getCodeFrequency(owner, repo) {
    try {
      // Get weekly additions/deletions
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/stats/code_frequency`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.warn('Could not fetch code frequency:', error.message);
      return [];
    }
  }

  async getContributors(owner, repo, onProgress) {
    try {
      // Fetch ALL contributors by paginating
      const contributors = [];
      let page = 1;
      let hasMore = true;
      
      console.log('👥 Fetching contributors...');
      if (onProgress) onProgress({ type: 'contributors', status: 'fetching', current: 0, page: 0 });
      
      while (hasMore && contributors.length < 10000) { // Safety limit: 10000 contributors
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/contributors?per_page=100&page=${page}`,
          { headers: this.headers }
        );
        
        contributors.push(...response.data);
        
        // Report progress every page
        if (onProgress) {
          onProgress({ 
            type: 'contributors', 
            status: 'fetching', 
            current: contributors.length, 
            page,
            hasMore: response.data.length >= 100
          });
        }
        
        // Log progress every 5 pages
        if (page % 5 === 0) {
          console.log(`   📊 Contributors: ${contributors.length} fetched (page ${page})...`);
        }
        
        if (response.data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      console.log(`✅ Fetched ${contributors.length} contributors`);
      if (onProgress) onProgress({ type: 'contributors', status: 'complete', current: contributors.length, total: contributors.length });
      return contributors;
    } catch (error) {
      console.error('Error fetching contributors:', error);
      if (onProgress) onProgress({ type: 'contributors', status: 'error', error: error.message });
      return [];
    }
  }

  async getBranches(owner, repo) {
    try {
      // Fetch ALL branches
      const branches = [];
      let page = 1;
      let hasMore = true;
      
      console.log('🌿 Fetching branches...');
      
      while (hasMore && branches.length < 1000) { // Increased limit: 1000
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/branches?per_page=100&page=${page}`,
          { headers: this.headers }
        );
        
        branches.push(...response.data);
        
        if (response.data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      console.log(`✅ Fetched ${branches.length} branches`);
      return branches;
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  }

  async getLanguages(owner, repo) {
    const response = await axios.get(
      `${this.baseURL}/repos/${owner}/${repo}/languages`,
      { headers: this.headers }
    );
    return response.data;
  }

  async getRepoTree(owner, repo, sha = 'HEAD') {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`,
        { headers: this.headers }
      );
      console.log(`✅ Fetched repository tree: ${response.data.tree.length} items`);
      return response.data.tree;
    } catch (error) {
      console.error('Error fetching tree:', error);
      return [];
    }
  }

  async getFileContent(owner, repo, path) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`,
        { headers: this.headers }
      );
      if (response.data.content) {
        return atob(response.data.content);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${path}:`, error.message);
      return null;
    }
  }

  async getPullRequests(owner, repo, onProgress) {
    try {
      // Fetch ALL pull requests
      const pullRequests = [];
      let page = 1;
      let hasMore = true;
      
      console.log('🔀 Fetching pull requests...');
      if (onProgress) onProgress({ type: 'pull requests', status: 'fetching', current: 0, page: 0 });
      
      while (hasMore && pullRequests.length < 10000) { // Increased limit: 10000
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}`,
          { headers: this.headers }
        );
        
        pullRequests.push(...response.data);
        
        // Report progress
        if (onProgress) {
          onProgress({ 
            type: 'pull requests', 
            status: 'fetching', 
            current: pullRequests.length, 
            page,
            hasMore: response.data.length >= 100
          });
        }
        
        // Log progress every 10 pages
        if (page % 10 === 0) {
          console.log(`   📊 Pull Requests: ${pullRequests.length} fetched (page ${page})...`);
        }
        
        if (response.data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      console.log(`✅ Fetched ${pullRequests.length} pull requests`);
      if (onProgress) onProgress({ type: 'pull requests', status: 'complete', current: pullRequests.length, total: pullRequests.length });
      return pullRequests;
    } catch (error) {
      console.warn('Could not fetch pull requests:', error.message);
      if (onProgress) onProgress({ type: 'pull requests', status: 'error', error: error.message });
      return [];
    }
  }

  async getIssues(owner, repo, onProgress) {
    try {
      // Fetch ALL issues (NOTE: GitHub API returns both issues AND PRs in this endpoint)
      const issues = [];
      let page = 1;
      let hasMore = true;
      
      console.log('⚠️  Fetching issues...');
      if (onProgress) onProgress({ type: 'issues', status: 'fetching', current: 0, page: 0 });
      
      while (hasMore && issues.length < 15000) { // Increased limit: 15000 (for repos with many issues)
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`,
          { headers: this.headers }
        );
        
        issues.push(...response.data);
        
        // Report progress
        if (onProgress) {
          onProgress({ 
            type: 'issues', 
            status: 'fetching', 
            current: issues.length, 
            page,
            hasMore: response.data.length >= 100
          });
        }
        
        // Log progress every 10 pages
        if (page % 10 === 0) {
          console.log(`   📊 Issues: ${issues.length} fetched (page ${page})...`);
        }
        
        if (response.data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      console.log(`✅ Fetched ${issues.length} issues (includes PRs)`);
      if (onProgress) onProgress({ type: 'issues', status: 'complete', current: issues.length, total: issues.length });
      return issues;
    } catch (error) {
      console.warn('Could not fetch issues:', error.message);
      if (onProgress) onProgress({ type: 'issues', status: 'error', error: error.message });
      return [];
    }
  }

  async getReleases(owner, repo) {
    try {
      // Fetch ALL releases
      const releases = [];
      let page = 1;
      let hasMore = true;
      
      console.log('🏷️  Fetching releases...');
      
      while (hasMore && releases.length < 1000) { // Increased limit: 1000
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/releases?per_page=100&page=${page}`,
          { headers: this.headers }
        );
        
        releases.push(...response.data);
        
        if (response.data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      console.log(`✅ Fetched ${releases.length} releases`);
      return releases;
    } catch (error) {
      console.warn('Could not fetch releases:', error.message);
      return [];
    }
  }

  async analyzeRepository(repoUrl, onProgress) {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);

    // Check rate limit first
    await this.checkRateLimit();

    console.log('📥 Fetching comprehensive GitHub data...');
    
    // Fetch core data in parallel with progress tracking
    const [
      repoInfo, 
      commits, 
      contributors, 
      branches, 
      languages, 
      tree,
      codeFrequency,
      commitStats,
      pullRequests,
      issues,
      releases
    ] = await Promise.all([
      this.getRepoInfo(owner, repo),
      this.getCommits(owner, repo, 100, onProgress),
      this.getContributors(owner, repo, onProgress),
      this.getBranches(owner, repo),
      this.getLanguages(owner, repo),
      this.getRepoTree(owner, repo),
      this.getCodeFrequency(owner, repo),
      this.getCommitStats(owner, repo),
      this.getPullRequests(owner, repo, onProgress),
      this.getIssues(owner, repo, onProgress),
      this.getReleases(owner, repo)
    ]);

    // Calculate stats
    const codeFiles = tree.filter(item => 
      item.type === 'blob' && 
      /\.(js|jsx|ts|tsx|py|java|cpp|c|go|rb|php|cs|swift|kt|rs|html|css|scss|sass|vue|svelte)$/i.test(item.path)
    );

    // Calculate actual lines added/deleted from code frequency data
    let totalLinesAdded = 0;
    let totalLinesDeleted = 0;
    
    if (codeFrequency && codeFrequency.length > 0) {
      codeFrequency.forEach(week => {
        totalLinesAdded += week[1]; // Additions
        totalLinesDeleted += Math.abs(week[2]); // Deletions (absolute value)
      });
      console.log(`✅ Actual lines from GitHub: +${totalLinesAdded} -${totalLinesDeleted}`);
    }

    // Get ALL code files for comprehensive analysis
    console.log(`📂 Fetching content from ALL ${codeFiles.length} code files for comprehensive analysis...`);
    
    const fileContents = [];
    let totalLinesAnalyzed = 0;
    let filesProcessed = 0;
    
    // Process files in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < codeFiles.length; i += batchSize) {
      const batch = codeFiles.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (file) => {
        try {
          // Skip extremely large files (>1MB) to avoid memory issues
          if (file.size > 1000000) {
            console.log(`   ⏭️  Skipping large file: ${file.path} (${(file.size / 1024).toFixed(0)}KB)`);
            return null;
          }
          
          const content = await this.getFileContent(owner, repo, file.path);
          if (content) {
            const lines = content.split('\n').length;
            totalLinesAnalyzed += lines;
            filesProcessed++;
            
            // Log progress every 10 files
            if (filesProcessed % 10 === 0) {
              console.log(`   📄 Progress: ${filesProcessed}/${codeFiles.length} files (${totalLinesAnalyzed.toLocaleString()} lines analyzed)`);
            }
            
            return {
              path: file.path,
              content: content, // Full content, no truncation
              size: file.size,
              lines: lines
            };
          }
        } catch (error) {
          console.warn(`   ⚠️  Could not fetch ${file.path}:`, error.message);
          return null;
        }
        return null;
      });
      
      const batchResults = await Promise.all(batchPromises);
      fileContents.push(...batchResults.filter(f => f !== null));
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < codeFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Fetched content from ${fileContents.length} files (${totalLinesAnalyzed.toLocaleString()} total lines analyzed)`);
    console.log(`📊 Coverage: ${((fileContents.length / codeFiles.length) * 100).toFixed(1)}% of code files analyzed`);

    // Calculate additional metrics
    const openPRs = pullRequests.filter(pr => pr.state === 'open').length;
    const closedPRs = pullRequests.filter(pr => pr.state === 'closed').length;
    const mergedPRs = pullRequests.filter(pr => pr.merged_at !== null).length;
    
    const openIssuesCount = issues.filter(issue => issue.state === 'open' && !issue.pull_request).length;
    const closedIssuesCount = issues.filter(issue => issue.state === 'closed' && !issue.pull_request).length;

    console.log('📊 Final counts:', {
      commits: commits.length,
      contributors: contributors.length,
      branches: branches.length,
      pullRequests: pullRequests.length,
      issues: issues.length,
      releases: releases.length,
      watchers: repoInfo.subscribers_count
    });

    return {
      repoInfo,
      commits,
      contributors,
      branches,
      languages,
      tree,
      codeFiles,
      fileContents,
      pullRequests,
      issues,
      releases,
      stats: {
        // Core metrics (ACTUAL from API)
        totalCommits: commits.length, // ACTUAL count from pagination
        totalContributors: contributors.length, // ACTUAL count from pagination
        totalBranches: branches.length, // ACTUAL count from pagination
        totalFiles: tree.filter(t => t.type === 'blob').length,
        totalCodeFiles: codeFiles.length,
        totalSize: tree.reduce((sum, item) => sum + (item.size || 0), 0),
        
        // Repository info (from repoInfo object)
        stars: repoInfo?.stargazers_count || 0,
        forks: repoInfo?.forks_count || 0,
        watchers: repoInfo?.subscribers_count || 0, // CORRECT field for watchers!
        openIssues: repoInfo?.open_issues_count || 0,
        
        // Pull requests (ACTUAL from pagination)
        totalPRs: pullRequests.length, // ACTUAL count
        openPRs,
        closedPRs,
        mergedPRs,
        
        // Issues (ACTUAL from pagination, excluding PRs)
        totalIssues: issues.filter(i => !i.pull_request).length, // ACTUAL count
        openIssuesCount,
        closedIssuesCount,
        
        // Releases (ACTUAL from pagination)
        totalReleases: releases.length, // ACTUAL count
        latestRelease: releases[0]?.tag_name || 'None',
        
        // Code metrics
        linesAdded: totalLinesAdded,
        linesDeleted: totalLinesDeleted,
        netLinesChanged: totalLinesAdded - totalLinesDeleted,
        
        // Dates
        lastUpdated: repoInfo.updated_at,
        lastPushed: repoInfo.pushed_at,
        createdAt: repoInfo.created_at,
        
        // Other
        defaultBranch: repoInfo.default_branch,
        description: repoInfo.description,
        license: repoInfo.license?.name || 'None',
        homepage: repoInfo.homepage || null,
        topics: repoInfo.topics || []
      }
    };
    
    // Debug logging
    console.log('📊 GitHub Stats Created:', {
      stars: returnData.stats.stars,
      forks: returnData.stats.forks,
      watchers: returnData.stats.watchers,
      totalPRs: returnData.stats.totalPRs,
      totalIssues: returnData.stats.totalIssues,
      totalReleases: returnData.stats.totalReleases
    });
    
    return returnData;
  }

  buildFileTree(files) {
    const tree = [];
    const map = {};

    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const path = parts.slice(0, index + 1).join('/');

        if (!map[path]) {
          const node = {
            name: part,
            type: isLast ? 'file' : 'folder',
            path: path,
            size: isLast ? file.size : undefined,
            children: isLast ? undefined : []
          };
          map[path] = node;
          current.push(node);
          if (!isLast) current = node.children;
        } else if (!isLast) {
          current = map[path].children;
        }
      });
    });

    return tree;
  }
}

export default new GitHubService();
