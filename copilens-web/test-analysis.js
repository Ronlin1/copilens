// Test script for Copilens analysis
// Run with: node test-analysis.js

import https from 'https';
import { GoogleGenAI } from '@google/genai';

const GITHUB_URL = 'https://github.com/Tech-Atlas-Uganda/tech_atlas';
const API_KEY = 'AIzaSyCtqEETE38ipKKVQmMuncoRvw2wOp5SnxY';

console.log('🧪 Testing Copilens Analysis Pipeline\n');

// Parse GitHub URL
function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

// Fetch from GitHub API
function fetchGitHub(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path,
      headers: { 'User-Agent': 'Copilens-Test' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function testAnalysis() {
  try {
    // Step 1: Parse URL
    console.log('📌 Step 1: Parsing GitHub URL...');
    const { owner, repo } = parseGitHubUrl(GITHUB_URL);
    console.log(`   ✅ Owner: ${owner}, Repo: ${repo}\n`);

    // Step 2: Fetch repo info
    console.log('📊 Step 2: Fetching repository info...');
    const repoInfo = await fetchGitHub(`/repos/${owner}/${repo}`);
    console.log(`   ✅ Name: ${repoInfo.name}`);
    console.log(`   ✅ Description: ${repoInfo.description || 'N/A'}`);
    console.log(`   ✅ Stars: ${repoInfo.stargazers_count}`);
    console.log(`   ✅ Language: ${repoInfo.language}\n`);

    // Step 3: Fetch commits
    console.log('📝 Step 3: Fetching commits...');
    const commits = await fetchGitHub(`/repos/${owner}/${repo}/commits?per_page=10`);
    console.log(`   ✅ Fetched ${commits.length} commits`);
    console.log(`   Latest: ${commits[0].commit.message.split('\n')[0]}\n`);

    // Step 4: Fetch languages
    console.log('🔤 Step 4: Fetching languages...');
    const languages = await fetchGitHub(`/repos/${owner}/${repo}/languages`);
    console.log(`   ✅ Languages:`, Object.keys(languages).join(', '), '\n');

    // Step 5: Test Gemini API
    console.log('🤖 Step 5: Testing Gemini API...');
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [{
        role: 'user',
        parts: [{ text: 'Say "Gemini API working!" in exactly 3 words.' }]
      }],
      config: { temperature: 0.3, maxOutputTokens: 20 }
    });

    let text = '';
    for await (const chunk of response) {
      if (chunk.text) text += chunk.text;
    }
    console.log(`   ✅ Gemini response: ${text.trim()}\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log(`Repository: ${repoInfo.full_name}`);
    console.log(`Stars: ${repoInfo.stargazers_count}`);
    console.log(`Commits: ${commits.length} fetched`);
    console.log(`Languages: ${Object.keys(languages).length}`);
    console.log(`Gemini API: ✓ Working`);
    console.log('═══════════════════════════════════════\n');
    console.log('🚀 Ready to test in browser!');
    console.log('   Open: http://localhost:5173');
    console.log('   Paste: https://github.com/Tech-Atlas-Uganda/tech_atlas');
    console.log('   Click: Analyze\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testAnalysis();
