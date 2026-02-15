# GitHub REST API Integration - Complete Guide

## Overview
Copilens Web now uses **13 GitHub REST API endpoints** to fetch real repository data, which is then analyzed by Gemini AI for comprehensive insights.

## API Integration Flow

```
GitHub API → Fetch Raw Data → Gemini AI Analysis → Dashboard Display
```

### 1. GitHub API Fetches Raw Data
- Repository information (stars, forks, watchers)
- Commit history (up to 300 commits)
- Code frequency statistics (actual lines added/deleted)
- Contributors, branches, languages
- File tree and contents
- Pull requests, issues, releases
- Repository topics and license

### 2. Gemini AI Analyzes
- AI-generated code detection
- Code quality scoring
- Technology stack identification
- Project health assessment
- Architecture recommendations

### 3. Dashboard Displays
- Combined GitHub + Gemini insights
- Real-time visualizations
- Interactive charts and metrics

## GitHub API Endpoints Used

### Core Repository Data
```javascript
GET /repos/{owner}/{repo}
// Returns: stars, forks, watchers, description, license, topics, etc.
```

### Commit Data (Paginated)
```javascript
GET /repos/{owner}/{repo}/commits?per_page=100&page={1-3}
// Fetches up to 300 commits across 3 pages
```

### Actual Lines Statistics ⭐ NEW
```javascript
GET /repos/{owner}/{repo}/stats/code_frequency
// Returns: Weekly [timestamp, additions, deletions] data
// This gives ACTUAL lines added/deleted over time
```

### Commit Activity Stats
```javascript
GET /repos/{owner}/{repo}/stats/commit_activity
// Returns: Commit counts per week
```

### Contributors
```javascript
GET /repos/{owner}/{repo}/contributors?per_page=100
// Returns: List of contributors with commit counts
```

### Branches
```javascript
GET /repos/{owner}/{repo}/branches
// Returns: All repository branches
```

### Languages
```javascript
GET /repos/{owner}/{repo}/languages
// Returns: Language breakdown in bytes {TypeScript: 123456, ...}
```

### File Tree
```javascript
GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1
// Returns: Complete file structure recursively
```

### File Contents
```javascript
GET /repos/{owner}/{repo}/contents/{path}
// Returns: Base64-encoded file content
// Decoded with atob() for analysis
```

### Pull Requests ⭐ NEW
```javascript
GET /repos/{owner}/{repo}/pulls?state=all&per_page=100
// Returns: All PRs with open, closed, merged status
```

### Issues ⭐ NEW
```javascript
GET /repos/{owner}/{repo}/issues?state=all&per_page=100
// Returns: All issues (excludes PRs)
```

### Releases ⭐ NEW
```javascript
GET /repos/{owner}/{repo}/releases
// Returns: All releases with tags and versions
```

### Rate Limit Monitoring ⭐ NEW
```javascript
GET /rate_limit
// Returns: Current rate limit status
// { rate: { limit: 60, remaining: 58, reset: 1234567890 } }
```

## Rate Limiting

### Unauthenticated Requests
- **Limit**: 60 requests per hour
- **Reset**: Every hour on the clock
- **Used by**: Current implementation

### Authenticated Requests (Future Enhancement)
- **Limit**: 5,000 requests per hour
- **How to implement**: 
  ```javascript
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  }
  ```

### Rate Limit Checking
```javascript
await githubService.checkRateLimit();
// Console output:
// 📊 GitHub API Rate Limit: {
//   remaining: 58,
//   limit: 60,
//   reset: '3:45:00 PM'
// }
```

## Data Collection Improvements

### Before
- 100 commits
- 10 sample files
- 3000 chars per file
- Limited file types (.js, .ts, .py, .java, .cpp, etc.)

### After ⭐
- **300 commits** (3 pages)
- **15 sample files** (prioritizes smaller files)
- **5000 chars per file** (better analysis)
- **More file types**: HTML, CSS, SCSS, SASS, Vue, Svelte

## Actual vs Estimated Data

### Actual Data from GitHub API ✅
When `stats/code_frequency` is available:
```javascript
linesAdded: githubData.stats.linesAdded      // From API
linesDeleted: githubData.stats.linesDeleted  // From API
netChange: githubData.stats.netLinesChanged  // Calculated
```

Console output:
```
✅ Using ACTUAL GitHub API stats: {
  linesAdded: '12,345',
  linesDeleted: '5,678',
  netChange: '6,667'
}
```

### Fallback to Estimates ⚠️
When API stats are unavailable (new repos, private repos):
```javascript
linesAdded = Math.round(complexityData.totalLines * 0.6)
linesDeleted = Math.round(complexityData.totalLines * 0.3)
```

Console output:
```
⚠️ GitHub stats unavailable, using estimates from complexity analysis
```

## New GitHub Metrics Component

### Display Structure
```
GitHub Repository Metrics
┌─────────────────────────────────────────┐
│ ⭐ Stars        🔱 Forks       👁️ Watchers │
│ 🔀 Pull Requests ⚠️ Issues      🏷️ Releases │
│ License: MIT                             │
│ Topics: [react] [typescript] [nextjs]   │
└─────────────────────────────────────────┘
```

### Metrics Included
1. **Stars** - Total stargazers count
2. **Forks** - Repository forks
3. **Watchers** - People watching the repo
4. **Pull Requests** - Total, with open/merged breakdown
5. **Issues** - Total, with open/closed counts
6. **Releases** - Count + latest version tag

### Data Structure
```javascript
{
  stars: 1234,
  forks: 567,
  watchers: 890,
  totalPRs: 45,
  openPRs: 5,
  closedPRs: 30,
  mergedPRs: 40,
  totalIssues: 23,
  openIssuesCount: 8,
  closedIssuesCount: 15,
  totalReleases: 12,
  latestRelease: 'v2.5.0',
  license: 'MIT',
  topics: ['react', 'typescript', 'nextjs']
}
```

## Error Handling

### Graceful Degradation
```javascript
async getCodeFrequency(owner, repo) {
  try {
    const response = await axios.get(...);
    return response.data;
  } catch (error) {
    console.warn('Could not fetch code frequency:', error.message);
    return []; // Empty array, won't break analysis
  }
}
```

### Fallback Values
```javascript
stats: {
  linesAdded: githubData.stats.linesAdded || estimatedLines,
  totalPRs: pullRequests?.length || 0,
  latestRelease: releases[0]?.tag_name || 'None'
}
```

## Integration with Gemini

### Data Flow
1. **GitHub API** fetches raw repository data
2. **github.js** processes and structures the data
3. **Gemini AI** analyzes file contents for:
   - AI-generated code detection (0-100%)
   - Code quality scoring (0-10)
   - Technology stack identification
   - Architecture recommendations
4. **Dashboard** combines both sources:
   - GitHub stats (stars, PRs, commits)
   - Gemini insights (AI detection, recommendations)

### Example Analysis Pipeline
```javascript
// 1. Fetch from GitHub
const githubData = await githubService.analyzeRepository(url);

// 2. Analyze with Gemini
const aiAnalysis = await geminiService.analyzeRepository(githubData);

// 3. Calculate complexity
const complexityData = analyzeRepositoryComplexity(githubData.fileContents);

// 4. Systems thinking
const systemsAnalysis = analyzeSystemStructure(githubData.tree, githubData.languages);

// 5. Combine everything
const finalData = {
  ...githubData.stats,        // GitHub API data
  aiAnalysis,                 // Gemini insights
  complexityData,             // Code complexity metrics
  systemsAnalysis             // Architecture analysis
};
```

## Console Logging

### Rate Limit Check
```
📊 GitHub API Rate Limit: {
  remaining: 58,
  limit: 60,
  reset: '3:45:00 PM'
}
```

### Data Fetching
```
📥 Fetching comprehensive GitHub data...
✅ Fetched 287 commits from GitHub API
✅ Fetched repository tree: 456 items
📂 Fetching content from 15 files for analysis...
✅ Fetched content from 15 files
```

### Actual vs Estimated
```
✅ Using ACTUAL GitHub API stats: {
  linesAdded: '45,678',
  linesDeleted: '12,345',
  netChange: '33,333'
}
```

OR

```
⚠️ GitHub stats unavailable, using estimates from complexity analysis
```

## Testing the Integration

### 1. Start Development Server
```bash
cd copilens-web
npm run dev
```

### 2. Analyze a Repository
- Go to http://localhost:5173
- Enter: `https://github.com/Tech-Atlas-Uganda/tech_atlas`
- Click "Analyze Repository"

### 3. Check Console Logs
Look for:
- ✅ Rate limit status
- ✅ Number of commits fetched
- ✅ "Using ACTUAL GitHub API stats" message
- ✅ File tree and content fetching logs

### 4. Verify Dashboard
- **GitHub Metrics section** appears after Stats Cards
- Stars, forks, watchers show real numbers
- PRs show open/merged breakdown
- Issues show open/closed counts
- Releases show latest version
- Topics appear as colored tags

## Future Enhancements

### 1. GitHub Token Authentication
```javascript
// Add to .env
VITE_GITHUB_TOKEN=your_personal_access_token

// Update github.js
this.headers = {
  'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json'
}
```

**Benefits:**
- 5,000 requests/hour instead of 60
- Access to private repositories
- Faster data fetching

### 2. GraphQL API Integration
```javascript
// Single query to fetch multiple resources
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    stargazerCount
    forkCount
    issues(first: 100) { ... }
    pullRequests(first: 100) { ... }
    releases(first: 10) { ... }
  }
}
```

**Benefits:**
- Fewer API calls
- Better rate limit usage
- More flexible queries

### 3. Caching Strategy
```javascript
// Cache GitHub data in localStorage
const cacheKey = `github_${owner}_${repo}_${Date.now()}`;
localStorage.setItem(cacheKey, JSON.stringify(data));

// Expire after 1 hour
const cacheAge = Date.now() - cacheTimestamp;
if (cacheAge < 3600000) {
  return cachedData;
}
```

**Benefits:**
- Reduce API calls
- Faster subsequent analyses
- Better user experience

## Troubleshooting

### Rate Limit Exceeded
**Error**: `API rate limit exceeded`

**Solution**:
1. Wait for rate limit reset (shown in console)
2. Add GitHub token for authentication
3. Reduce number of repositories analyzed

### Stats Not Available
**Warning**: `Could not fetch code frequency`

**Reason**: 
- New repository (< 1 week old)
- Private repository without auth
- GitHub still computing statistics

**Fallback**: App uses estimated values from complexity analysis

### File Content Too Large
**Error**: `Request Entity Too Large`

**Solution**: Already implemented - we skip files > 100KB

```javascript
const sortedFiles = codeFiles
  .filter(f => f.size < 100000) // Skip large files
  .sort((a, b) => a.size - b.size)
  .slice(0, 15);
```

## Summary

✅ **13 GitHub API endpoints** integrated
✅ **Actual data** from GitHub (not estimates)
✅ **Rate limit monitoring** before analysis
✅ **300 commits** analyzed (3x more)
✅ **15 files** sampled (50% more)
✅ **New metrics**: PRs, Issues, Releases, Topics
✅ **Graceful error handling** with fallbacks
✅ **Production ready** with comprehensive logging

The GitHub REST API integration is now complete and working alongside Gemini AI for comprehensive repository analysis!
