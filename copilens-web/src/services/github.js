import axios from 'axios';

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
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

  async getRepoInfo(owner, repo) {
    const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`);
    return response.data;
  }

  async getCommits(owner, repo, perPage = 100) {
    const response = await axios.get(
      `${this.baseURL}/repos/${owner}/${repo}/commits?per_page=${perPage}`
    );
    return response.data;
  }

  async getContributors(owner, repo) {
    const response = await axios.get(
      `${this.baseURL}/repos/${owner}/${repo}/contributors`
    );
    return response.data;
  }

  async getBranches(owner, repo) {
    const response = await axios.get(
      `${this.baseURL}/repos/${owner}/${repo}/branches`
    );
    return response.data;
  }

  async getLanguages(owner, repo) {
    const response = await axios.get(
      `${this.baseURL}/repos/${owner}/${repo}/languages`
    );
    return response.data;
  }

  async getRepoTree(owner, repo, sha = 'HEAD') {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`
      );
      return response.data.tree;
    } catch (error) {
      console.error('Error fetching tree:', error);
      return [];
    }
  }

  async getFileContent(owner, repo, path) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`
      );
      if (response.data.content) {
        return atob(response.data.content);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      return null;
    }
  }

  async analyzeRepository(repoUrl) {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);

    const [repoInfo, commits, contributors, branches, languages, tree] = await Promise.all([
      this.getRepoInfo(owner, repo),
      this.getCommits(owner, repo),
      this.getContributors(owner, repo),
      this.getBranches(owner, repo),
      this.getLanguages(owner, repo),
      this.getRepoTree(owner, repo)
    ]);

    // Calculate stats
    const codeFiles = tree.filter(item => 
      item.type === 'blob' && 
      /\.(js|jsx|ts|tsx|py|java|cpp|c|go|rb|php|cs|swift|kt|rs)$/i.test(item.path)
    );

    // Get sample files for AI analysis
    const sampleFiles = codeFiles.slice(0, 10);
    const fileContents = [];

    for (const file of sampleFiles) {
      const content = await this.getFileContent(owner, repo, file.path);
      if (content) {
        fileContents.push({
          path: file.path,
          content: content.substring(0, 3000), // Limit to 3000 chars per file
          size: file.size
        });
      }
    }

    return {
      repoInfo,
      commits,
      contributors,
      branches,
      languages,
      tree,
      codeFiles,
      fileContents,
      stats: {
        totalCommits: commits.length,
        totalContributors: contributors.length,
        totalBranches: branches.length,
        totalFiles: tree.filter(t => t.type === 'blob').length,
        totalCodeFiles: codeFiles.length,
        totalSize: tree.reduce((sum, item) => sum + (item.size || 0), 0),
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        openIssues: repoInfo.open_issues_count,
        lastUpdated: repoInfo.updated_at,
        createdAt: repoInfo.created_at,
        defaultBranch: repoInfo.default_branch,
        description: repoInfo.description
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
