/**
 * Systems Thinking Analysis
 */

export function analyzeSystemStructure(fileTree, languages) {
  const patterns = [];
  const recommendations = [];
  
  const hasPackages = fileTree.some(f => f.path.includes('packages/'));
  const hasApps = fileTree.some(f => f.path.includes('apps/'));
  if (hasPackages || hasApps) {
    patterns.push({
      name: 'Monorepo Architecture',
      description: 'Multiple packages/apps in single repository'
    });
  }
  
  const hasServices = fileTree.some(f => f.path.includes('services/'));
  const hasDocker = fileTree.some(f => f.path.includes('Dockerfile'));
  if (hasServices && hasDocker) {
    patterns.push({
      name: 'Microservices Pattern',
      description: 'Containerized service-oriented architecture'
    });
  }
  
  const hasComponents = fileTree.some(f => f.path.includes('components/'));
  if (hasComponents) {
    patterns.push({
      name: 'Component-Based Architecture',
      description: 'Modular code organization'
    });
  }
  
  const hasTests = fileTree.some(f => f.path.includes('test') || f.path.includes('spec'));
  if (!hasTests) {
    recommendations.push({
      priority: 'High',
      category: 'Quality',
      suggestion: 'Add comprehensive test coverage'
    });
  }
  
  const hasCI = fileTree.some(f => f.path.includes('.github/workflows'));
  if (!hasCI) {
    recommendations.push({
      priority: 'High',
      category: 'CI/CD',
      suggestion: 'Implement continuous integration'
    });
  }
  
  return { patterns, recommendations };
}

export function generateSystemsInsights(repoData, complexityData) {
  const insights = [];
  
  if (complexityData.highRiskFileCount > 0) {
    insights.push({
      type: 'Leverage Point',
      title: 'Focus Refactoring Efforts',
      description: `${complexityData.highRiskFileCount} files account for most technical debt`,
      effect: 'Refactoring these will have outsized impact'
    });
  }
  
  if (complexityData.averageCyclomatic > 15) {
    insights.push({
      type: 'Complexity Alert',
      title: 'High Average Complexity',
      description: 'Code is difficult to test and maintain',
      effect: 'Break down into smaller, focused functions'
    });
  }
  
  return insights;
}
