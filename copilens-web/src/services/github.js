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
    return response.data;
  }

  async getCommits(owner, repo, perPage = 100) {
    try {
      // Fetch ALL commits by paginating through all pages
      const commits = [];
      let page = 1;
      let hasMore = true;
      
      console.log('📥 Fetching commits (this may take a moment)...');
      
      while (hasMore && commits.length < 10000) { // Increased limit: 10000 commits max
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`,
          { headers: this.headers }
        );
        
        commits.push(...response.data);
        
        // Log progress every 5 pages
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
      return commits;
    } catch (error) {
      console.error('Error fetching commits:', error);
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

  async getContributors(owner, repo) {
    try {
      // Fetch ALL contributors by paginating
      const contributors = [];
      let page = 1;
      let hasMore = true;
      
      console.log('👥 Fetching contributors...');
      
      while (hasMore && contributors.length < 5000) { // Increased limit: 5000
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/contributors?per_page=100&page=${page}`,
          { headers: this.headers }
        );
        
        contributors.push(...response.data);
        
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
      return contributors;
    } catch (error) {
      console.error('Error fetching contributors:', error);
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

  async getPullRequests(owner, repo) {
    try {
      // Fetch ALL pull requests
      const pullRequests = [];
      let page = 1;
      let hasMore = true;
      
      console.log('🔀 Fetching pull requests...');
      
      while (hasMore && pullRequests.length < 10000) { // Increased limit: 10000
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}`,
          { headers: this.headers }
        );
        
        pullRequests.push(...response.data);
        
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
      return pullRequests;
    } catch (error) {
      console.warn('Could not fetch pull requests:', error.message);
      return [];
    }
  }

  async getIssues(owner, repo) {
    try {
      // Fetch ALL issues (NOTE: GitHub API returns both issues AND PRs in this endpoint)
      const issues = [];
      let page = 1;
      let hasMore = true;
      
      console.log('⚠️  Fetching issues...');
      
      while (hasMore && issues.length < 15000) { // Increased limit: 15000 (for repos with many issues)
        const response = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`,
          { headers: this.headers }
        );
        
        issues.push(...response.data);
        
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
      return issues;
    } catch (error) {
      console.warn('Could not fetch issues:', error.message);
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

  async analyzeRepository(repoUrl) {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);

    // Check rate limit first
    await this.checkRateLimit();

    console.log('📥 Fetching comprehensive GitHub data...');
    
    // Fetch core data in parallel
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
      this.getCommits(owner, repo),
      this.getContributors(owner, repo),
      this.getBranches(owner, repo),
      this.getLanguages(owner, repo),
      this.getRepoTree(owner, repo),
      this.getCodeFrequency(owner, repo),
      this.getCommitStats(owner, repo),
      this.getPullRequests(owner, repo),
      this.getIssues(owner, repo),
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

    // Get sample files for AI analysis (prioritize smaller files)
    const sortedFiles = codeFiles
      .filter(f => f.size < 100000) // Skip very large files
      .sort((a, b) => a.size - b.size)
      .slice(0, 15); // Get 15 files for better analysis

    const fileContents = [];
    console.log(`📂 Fetching content from ${sortedFiles.length} files for analysis...`);

    for (const file of sortedFiles) {
      const content = await this.getFileContent(owner, repo, file.path);
      if (content) {
        fileContents.push({
          path: file.path,
          content: content.substring(0, 5000), // Limit to 5000 chars per file
          size: file.size
        });
      }
    }

    console.log(`✅ Fetched content from ${fileContents.length} files`);

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
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        watchers: repoInfo.subscribers_count, // CORRECT field for watchers!
        openIssues: repoInfo.open_issues_count,
        
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
