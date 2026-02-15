/**
 * Advanced Systems Thinking Analysis
 * Based on Donella Meadows' "Thinking in Systems" framework
 */

export function analyzeSystemStructure(fileTree, languages) {
  const patterns = [];
  const recommendations = [];
  const dependencies = analyzeDependencies(fileTree);
  const structure = analyzeProjectStructure(fileTree);
  
  // 1. ARCHITECTURE PATTERNS
  if (structure.hasMonorepo) {
    patterns.push({
      name: 'Monorepo Architecture',
      description: `${structure.packages.length} packages in single repository`,
      impact: 'High',
      benefits: ['Shared tooling', 'Atomic commits', 'Easy refactoring'],
      risks: ['Build complexity', 'Tight coupling']
    });
  }
  
  if (structure.hasMicroservices) {
    patterns.push({
      name: 'Microservices Pattern',
      description: 'Service-oriented containerized architecture',
      impact: 'High',
      benefits: ['Independent deployment', 'Technology flexibility', 'Fault isolation'],
      risks: ['Distributed complexity', 'Network overhead', 'Data consistency']
    });
  }
  
  if (structure.hasLayeredArchitecture) {
    patterns.push({
      name: 'Layered Architecture',
      description: `Separation into ${structure.layers.join(', ')} layers`,
      impact: 'Medium',
      benefits: ['Clear separation of concerns', 'Testable layers'],
      risks: ['Layer coupling', 'Performance overhead']
    });
  }
  
  if (structure.hasComponentBased) {
    patterns.push({
      name: 'Component-Based Architecture',
      description: `${structure.componentCount} reusable components detected`,
      impact: 'Medium',
      benefits: ['Code reuse', 'Maintainability', 'Composability'],
      risks: ['Prop drilling', 'Component bloat']
    });
  }
  
  // 2. QUALITY & RELIABILITY
  if (!structure.hasTests) {
    recommendations.push({
      priority: 'Critical',
      category: 'Quality Assurance',
      suggestion: 'Implement comprehensive test coverage',
      impact: 'Prevents regressions, enables confident refactoring',
      effort: 'High',
      leveragePoint: 'Foundation for code quality'
    });
  } else if (structure.testCoverage < 50) {
    recommendations.push({
      priority: 'High',
      category: 'Quality Assurance',
      suggestion: `Increase test coverage from ${structure.testCoverage}% to >80%`,
      impact: 'Reduces bugs, improves confidence',
      effort: 'Medium'
    });
  }
  
  // 3. CI/CD & AUTOMATION
  if (!structure.hasCI) {
    recommendations.push({
      priority: 'High',
      category: 'DevOps',
      suggestion: 'Implement CI/CD pipeline (GitHub Actions, GitLab CI)',
      impact: 'Automates testing, ensures consistency',
      effort: 'Medium',
      leveragePoint: 'Multiplier for all development work'
    });
  }
  
  // 4. DOCUMENTATION
  if (structure.docFiles < 3) {
    recommendations.push({
      priority: 'Medium',
      category: 'Documentation',
      suggestion: 'Add comprehensive documentation (README, API docs, architecture)',
      impact: 'Reduces onboarding time, improves collaboration',
      effort: 'Low'
    });
  }
  
  // 5. DEPENDENCY MANAGEMENT
  if (dependencies.outdatedCount > 10) {
    recommendations.push({
      priority: 'High',
      category: 'Security',
      suggestion: `Update ${dependencies.outdatedCount} outdated dependencies`,
      impact: 'Security patches, bug fixes, performance',
      effort: 'Medium',
      leveragePoint: 'Prevents security vulnerabilities'
    });
  }
  
  // 6. CODE ORGANIZATION
  if (structure.deepNesting > 6) {
    recommendations.push({
      priority: 'Medium',
      category: 'Code Organization',
      suggestion: 'Flatten directory structure (currently ${structure.deepNesting} levels deep)',
      impact: 'Easier navigation, simpler imports',
      effort: 'Low'
    });
  }
  
  return { 
    patterns, 
    recommendations,
    structure,
    dependencies
  };
}

function analyzeProjectStructure(fileTree) {
  const paths = fileTree.map(f => f.path || f);
  
  // Detect monorepo
  const packages = paths.filter(p => p.startsWith('packages/') || p.startsWith('apps/'));
  const hasMonorepo = packages.length > 0;
  
  // Detect microservices
  const hasServices = paths.some(p => p.includes('services/'));
  const hasDocker = paths.some(p => p.includes('Dockerfile') || p.includes('docker-compose'));
  const hasMicroservices = hasServices && hasDocker;
  
  // Detect layers
  const layers = [];
  if (paths.some(p => p.includes('controllers/'))) layers.push('Controllers');
  if (paths.some(p => p.includes('models/'))) layers.push('Models');
  if (paths.some(p => p.includes('views/') || p.includes('pages/'))) layers.push('Views');
  if (paths.some(p => p.includes('services/'))) layers.push('Services');
  if (paths.some(p => p.includes('utils/') || p.includes('helpers/'))) layers.push('Utilities');
  const hasLayeredArchitecture = layers.length >= 3;
  
  // Detect components
  const componentFiles = paths.filter(p => p.includes('components/'));
  const hasComponentBased = componentFiles.length > 5;
  const componentCount = componentFiles.length;
  
  // Detect tests
  const testFiles = paths.filter(p => /\.(test|spec)\.(js|ts|jsx|tsx|py)$/.test(p));
  const hasTests = testFiles.length > 0;
  const testCoverage = (testFiles.length / paths.length) * 100;
  
  // Detect CI/CD
  const hasCI = paths.some(p => 
    p.includes('.github/workflows') || 
    p.includes('.gitlab-ci') || 
    p.includes('Jenkinsfile') ||
    p.includes('.circleci')
  );
  
  // Documentation
  const docFiles = paths.filter(p => 
    /\.(md|txt|rst)$/i.test(p) && 
    !p.includes('node_modules') &&
    !p.includes('LICENSE')
  ).length;
  
  // Deep nesting
  const depths = paths.map(p => (p.match(/\//g) || []).length);
  const deepNesting = Math.max(...depths, 0);
  
  return {
    hasMonorepo,
    packages,
    hasMicroservices,
    hasLayeredArchitecture,
    layers,
    hasComponentBased,
    componentCount,
    hasTests,
    testCoverage: Math.round(testCoverage),
    hasCI,
    docFiles,
    deepNesting
  };
}

function analyzeDependencies(fileTree) {
  const paths = fileTree.map(f => f.path || f);
  
  // Look for package managers
  const hasPackageJson = paths.some(p => p.endsWith('package.json'));
  const hasRequirementsTxt = paths.some(p => p.endsWith('requirements.txt'));
  const hasGoMod = paths.some(p => p.endsWith('go.mod'));
  const hasCargoToml = paths.some(p => p.endsWith('Cargo.toml'));
  
  // Count lock files (indicator of dependency management)
  const lockFiles = paths.filter(p => 
    p.endsWith('package-lock.json') || 
    p.endsWith('yarn.lock') || 
    p.endsWith('pnpm-lock.yaml') ||
    p.endsWith('Pipfile.lock') ||
    p.endsWith('Cargo.lock')
  );
  
  return {
    hasPackageManager: hasPackageJson || hasRequirementsTxt || hasGoMod || hasCargoToml,
    lockFilesCount: lockFiles.length,
    outdatedCount: 0 // Would need actual dependency checking
  };
}

export function generateSystemsInsights(repoData, complexityData) {
  const insights = [];
  
  // LEVERAGE POINTS (High Impact, Strategic Interventions)
  if (complexityData.criticalRiskFileCount > 0) {
    insights.push({
      type: 'Leverage Point - Critical',
      title: '🎯 Critical Risk Files Identified',
      description: `${complexityData.criticalRiskFileCount} files with critical risk scores (>75)`,
      systemEffect: 'These files are leverage points - refactoring them creates cascading improvements',
      actionItems: [
        'Prioritize refactoring these files first',
        'Break down into smaller, focused modules',
        'Add comprehensive tests before refactoring',
        'Consider design patterns to reduce complexity'
      ],
      impact: 'High',
      effort: 'Medium-High'
    });
  }
  
  if (complexityData.highRiskFileCount > complexityData.totalFilesAnalyzed * 0.2) {
    insights.push({
      type: 'Leverage Point - System-Wide',
      title: '⚠️ Systemic Complexity Problem',
      description: `${((complexityData.highRiskFileCount / complexityData.totalFilesAnalyzed) * 100).toFixed(0)}% of files are high-risk`,
      systemEffect: 'This indicates a systemic issue, not isolated problems',
      actionItems: [
        'Establish code complexity budgets',
        'Implement automated complexity checking in CI',
        'Conduct architecture review',
        'Consider refactoring to cleaner architecture patterns'
      ],
      impact: 'Critical',
      effort: 'High'
    });
  }
  
  // FEEDBACK LOOPS (Virtuous and Vicious Cycles)
  if (complexityData.averageCyclomatic > 15) {
    insights.push({
      type: 'Feedback Loop - Vicious',
      title: '🔄 Complexity Spiral Detected',
      description: `Average complexity (${complexityData.averageCyclomatic}) indicates self-reinforcing complexity`,
      systemEffect: 'High complexity makes changes harder → developers add workarounds → complexity increases',
      breakTheLoop: [
        'Establish complexity limits (max 10 per function)',
        'Refactor worst offenders to demonstrate benefits',
        'Create coding standards with examples',
        'Use linting tools to prevent new complex code'
      ],
      impact: 'High',
      effort: 'Ongoing'
    });
  }
  
  // SYSTEM BOUNDARIES & INTERFACES
  insights.push({
    type: 'System Boundary',
    title: '🏗️ Architecture Clarity',
    description: 'Well-defined boundaries reduce coupling and enable independent evolution',
    systemEffect: 'Clear interfaces allow modules to evolve independently',
    actionItems: [
      'Define clear API contracts between modules',
      'Document component responsibilities',
      'Minimize cross-boundary dependencies',
      'Use dependency injection for flexibility'
    ],
    impact: 'Medium',
    effort: 'Medium'
  });
  
  // DELAYS (Hidden in the System)
  if (complexityData.totalLines > 100000) {
    insights.push({
      type: 'System Delay',
      title: '⏰ Codebase Size Lag',
      description: `${complexityData.totalLines.toLocaleString()} lines of code creates inherent delays`,
      systemEffect: 'Large codebases delay understanding, testing, and deployment',
      actionItems: [
        'Consider splitting into separate services/packages',
        'Archive or remove dead code',
        'Implement lazy loading where possible',
        'Optimize build and test pipelines'
      ],
      impact: 'Medium',
      effort: 'High'
    });
  }
  
  // RESILIENCE INDICATORS
  insights.push({
    type: 'Resilience Assessment',
    title: '🛡️ System Resilience',
    description: 'Ability to handle change and recover from errors',
    metrics: {
      testCoverage: `${((repoData.stats?.totalTests || 0) > 0 ? 'Yes' : 'Limited')}`,
      errorHandling: 'Review needed',
      documentation: `${repoData.tree?.filter(f => /\.md$/i.test(f.path || f)).length || 0} docs`,
      ciPipeline: repoData.tree?.some(f => (f.path || f).includes('.github/workflows')) ? 'Yes' : 'No'
    },
    actionItems: [
      'Ensure all critical paths have error handling',
      'Add integration and e2e tests',
      'Document recovery procedures',
      'Implement health checks and monitoring'
    ],
    impact: 'High',
    effort: 'Ongoing'
  });
  
  return insights;
}
