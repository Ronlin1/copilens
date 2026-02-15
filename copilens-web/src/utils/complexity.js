/**
 * Code Complexity Analysis Utilities
 * Implements real algorithms for measuring code complexity
 */

/**
 * Calculate Cyclomatic Complexity
 * Measures the number of linearly independent paths through code
 */
export function calculateCyclomaticComplexity(code) {
  if (!code) return 0;
  
  const ifStatements = (code.match(/\bif\s*\(/g) || []).length;
  const forLoops = (code.match(/\bfor\s*\(/g) || []).length;
  const whileLoops = (code.match(/\bwhile\s*\(/g) || []).length;
  const caseStatements = (code.match(/\bcase\s+/g) || []).length;
  const catchBlocks = (code.match(/\bcatch\s*\(/g) || []).length;
  const ternary = (code.match(/\?[^:]+:/g) || []).length;
  const logicalAnd = (code.match(/&&/g) || []).length;
  const logicalOr = (code.match(/\|\|/g) || []).length;
  
  return 1 + ifStatements + forLoops + whileLoops + caseStatements + 
         catchBlocks + ternary + logicalAnd + logicalOr;
}

/**
 * Calculate Cognitive Complexity
 */
export function calculateCognitiveComplexity(code) {
  if (!code) return 0;
  
  let complexity = 0;
  let nestingLevel = 0;
  const lines = code.split('\n');
  
  for (const line of lines) {
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    nestingLevel += openBraces - closeBraces;
    
    if (/\b(if|for|while|switch|catch)\s*\(/.test(line)) {
      complexity += 1 + nestingLevel;
    }
    
    complexity += ((line.match(/&&|\|\|/g) || []).length) * (1 + nestingLevel);
  }
  
  return complexity;
}

/**
 * Calculate Halstead Metrics
 */
export function calculateHalsteadMetrics(code) {
  if (!code) return null;
  
  const operators = code.match(/[+\-*/%=<>!&|?:,;(){}\[\]]/g) || [];
  const uniqueOperators = new Set(operators);
  const operands = code.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|[0-9]+\.?[0-9]*/g) || [];
  const uniqueOperands = new Set(operands);
  
  const n1 = uniqueOperators.size;
  const n2 = uniqueOperands.size;
  const N1 = operators.length;
  const N2 = operands.length;
  
  const vocabulary = n1 + n2;
  const length = N1 + N2;
  const volume = length * Math.log2(vocabulary || 1);
  const difficulty = (n1 / 2) * (N2 / (n2 || 1));
  const effort = difficulty * volume;
  
  return {
    vocabulary,
    length,
    volume: Math.round(volume),
    difficulty: Math.round(difficulty * 100) / 100,
    effort: Math.round(effort),
    bugsDelivered: Math.round((volume / 3000) * 100) / 100
  };
}

/**
 * Calculate Maintainability Index
 */
export function calculateMaintainabilityIndex(code, cyclomatic, halstead) {
  if (!code || !halstead) return null;
  
  const lines = code.split('\n').filter(l => l.trim().length > 0).length;
  const commentLines = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length;
  const commentRatio = lines > 0 ? commentLines / lines : 0;
  
  const V = halstead.volume;
  const G = cyclomatic;
  const L = lines;
  
  let MI = 171 - 5.2 * Math.log(V || 1) - 0.23 * G - 16.2 * Math.log(L || 1);
  MI = Math.max(0, (MI * 100) / 171);
  MI = Math.min(100, MI + (commentRatio * 10));
  
  return {
    score: Math.round(MI),
    rating: MI > 85 ? 'Good' : MI > 65 ? 'Moderate' : 'Difficult',
    color: MI > 85 ? 'green' : MI > 65 ? 'yellow' : 'red'
  };
}

/**
 * Calculate Code Risk Score with Advanced Algorithm
 * Based on industry-standard metrics and empirical research
 */
export function calculateCodeRisk(fileData) {
  let riskScore = 0;
  const factors = [];
  const weights = {
    complexity: 0.3,
    maintainability: 0.25,
    size: 0.2,
    documentation: 0.15,
    bugPotential: 0.1
  };
  
  const code = fileData.content;
  const path = fileData.path;
  const lines = code.split('\n').length;
  
  // EXCLUDE configuration/initialization files from risk scoring
  const isConfigFile = /\.(config|rc|json|ya?ml|toml|lock|md|txt)$/i.test(path);
  const isInitFile = /(^|\/)(index\.(js|ts|jsx|tsx)|__init__\.py|setup\.py|package\.json)$/i.test(path);
  const isTestFile = /(test|spec|\.test\.|\.spec\.)/i.test(path);
  
  // Skip risk analysis for these file types
  if (isConfigFile || isTestFile) {
    return {
      score: 0,
      level: 'Low',
      color: 'green',
      factors: ['Configuration/Test file - excluded from risk analysis'],
      excluded: true
    };
  }
  
  // Init files get reduced scoring (they're typically simple)
  const isInitMultiplier = isInitFile ? 0.3 : 1.0;
  
  const cyclomatic = calculateCyclomaticComplexity(code);
  const cognitive = calculateCognitiveComplexity(code);
  const halstead = calculateHalsteadMetrics(code);
  const maintainability = calculateMaintainabilityIndex(code, cyclomatic, halstead);
  
  // 1. COMPLEXITY RISK (30% weight)
  let complexityRisk = 0;
  if (cyclomatic > 50) {
    complexityRisk = 100;
    factors.push(`Critical cyclomatic complexity: ${cyclomatic}`);
  } else if (cyclomatic > 30) {
    complexityRisk = 80;
    factors.push(`Very high cyclomatic complexity: ${cyclomatic}`);
  } else if (cyclomatic > 20) {
    complexityRisk = 60;
    factors.push(`High cyclomatic complexity: ${cyclomatic}`);
  } else if (cyclomatic > 10) {
    complexityRisk = 30;
    factors.push(`Moderate cyclomatic complexity: ${cyclomatic}`);
  }
  
  if (cognitive > 50) {
    complexityRisk = Math.max(complexityRisk, 90);
    factors.push(`Extremely difficult to understand (cognitive: ${cognitive})`);
  } else if (cognitive > 30) {
    complexityRisk = Math.max(complexityRisk, 70);
    factors.push(`Very difficult to understand (cognitive: ${cognitive})`);
  } else if (cognitive > 15) {
    complexityRisk = Math.max(complexityRisk, 40);
    factors.push(`Moderately complex logic (cognitive: ${cognitive})`);
  }
  
  riskScore += complexityRisk * weights.complexity * isInitMultiplier;
  
  // 2. MAINTAINABILITY RISK (25% weight)
  let maintainabilityRisk = 0;
  if (maintainability && maintainability.score < 20) {
    maintainabilityRisk = 100;
    factors.push(`Critical maintainability (${maintainability.score}/100)`);
  } else if (maintainability && maintainability.score < 40) {
    maintainabilityRisk = 70;
    factors.push(`Poor maintainability (${maintainability.score}/100)`);
  } else if (maintainability && maintainability.score < 65) {
    maintainabilityRisk = 40;
    factors.push(`Low maintainability (${maintainability.score}/100)`);
  }
  
  riskScore += maintainabilityRisk * weights.maintainability;
  
  // 3. SIZE RISK (20% weight)
  let sizeRisk = 0;
  if (lines > 1000) {
    sizeRisk = 100;
    factors.push(`Extremely large file: ${lines} lines (should be <300)`);
  } else if (lines > 500) {
    sizeRisk = 70;
    factors.push(`Very large file: ${lines} lines (should be <300)`);
  } else if (lines > 300) {
    sizeRisk = 40;
    factors.push(`Large file: ${lines} lines (recommended <300)`);
  }
  
  riskScore += sizeRisk * weights.size * isInitMultiplier;
  
  // 4. DOCUMENTATION RISK (15% weight)
  let docRisk = 0;
  const commentLines = (code.match(/\/\/|\/\*|\*\/|#|"""|'''/g) || []).length;
  const commentRatio = commentLines / lines;
  
  if (lines > 100 && commentRatio < 0.02) {
    docRisk = 80;
    factors.push(`Severely under-documented: ${(commentRatio * 100).toFixed(1)}% comments`);
  } else if (lines > 50 && commentRatio < 0.05) {
    docRisk = 50;
    factors.push(`Under-documented: ${(commentRatio * 100).toFixed(1)}% comments`);
  } else if (commentRatio < 0.1) {
    docRisk = 25;
    factors.push(`Low documentation: ${(commentRatio * 100).toFixed(1)}% comments`);
  }
  
  riskScore += docRisk * weights.documentation;
  
  // 5. BUG POTENTIAL (10% weight)
  let bugRisk = 0;
  if (halstead && halstead.bugsDelivered > 5) {
    bugRisk = 100;
    factors.push(`Very high bug potential: ${halstead.bugsDelivered.toFixed(2)} estimated bugs`);
  } else if (halstead && halstead.bugsDelivered > 2) {
    bugRisk = 60;
    factors.push(`High bug potential: ${halstead.bugsDelivered.toFixed(2)} estimated bugs`);
  } else if (halstead && halstead.bugsDelivered > 1) {
    bugRisk = 30;
    factors.push(`Moderate bug potential: ${halstead.bugsDelivered.toFixed(2)} estimated bugs`);
  }
  
  riskScore += bugRisk * weights.bugPotential;
  
  // Calculate final weighted score
  const finalScore = Math.min(100, Math.round(riskScore));
  
  return {
    score: finalScore,
    level: finalScore > 75 ? 'Critical' : finalScore > 50 ? 'High' : finalScore > 25 ? 'Medium' : 'Low',
    color: finalScore > 75 ? 'red' : finalScore > 50 ? 'orange' : finalScore > 25 ? 'yellow' : 'green',
    factors: factors.length > 0 ? factors : ['Code quality is acceptable'],
    metrics: {
      cyclomatic,
      cognitive,
      lines,
      commentRatio: (commentRatio * 100).toFixed(1) + '%',
      maintainabilityIndex: maintainability?.score || 0,
      estimatedBugs: halstead?.bugsDelivered?.toFixed(2) || 0
    },
    excluded: false
  };
}

/**
 * Analyze Repository Complexity
 */
export function analyzeRepositoryComplexity(files) {
  const analyses = [];
  let totalCyclomatic = 0;
  let totalCognitive = 0;
  let totalLines = 0;
  let highRiskFiles = 0;
  let criticalRiskFiles = 0;
  
  for (const file of files) {
    if (!file.content) continue;
    
    const cyclomatic = calculateCyclomaticComplexity(file.content);
    const cognitive = calculateCognitiveComplexity(file.content);
    const halstead = calculateHalsteadMetrics(file.content);
    const maintainability = calculateMaintainabilityIndex(file.content, cyclomatic, halstead);
    const risk = calculateCodeRisk(file);
    
    const lines = file.content.split('\n').length;
    totalCyclomatic += cyclomatic;
    totalCognitive += cognitive;
    totalLines += lines;
    
    if (!risk.excluded) {  // Only count non-excluded files
      if (risk.score > 75) criticalRiskFiles++;
      if (risk.score > 50) highRiskFiles++;
    }
    
    analyses.push({
      path: file.path,
      cyclomatic,
      cognitive,
      halstead,
      maintainability,
      risk,
      lines
    });
  }
  
  // Sort by risk score, but put excluded files at the end
  analyses.sort((a, b) => {
    if (a.risk.excluded && !b.risk.excluded) return 1;
    if (!a.risk.excluded && b.risk.excluded) return -1;
    return b.risk.score - a.risk.score;
  });
  
  // Get top risky files (excluding config/test files)
  const topRiskyFiles = analyses
    .filter(a => !a.risk.excluded)
    .slice(0, 15);
  
  const analyzedFiles = analyses.filter(a => !a.risk.excluded).length;
  
  return {
    files: analyses,
    topRiskyFiles,
    averageCyclomatic: analyzedFiles > 0 ? Math.round(totalCyclomatic / analyzedFiles) : 0,
    averageCognitive: analyzedFiles > 0 ? Math.round(totalCognitive / analyzedFiles) : 0,
    totalLines,
    highRiskFileCount: highRiskFiles,
    criticalRiskFileCount: criticalRiskFiles,
    totalFilesAnalyzed: analyzedFiles,
    overallRisk: criticalRiskFiles > 0 ? 'Critical' : highRiskFiles > analyzedFiles * 0.3 ? 'High' : highRiskFiles > analyzedFiles * 0.1 ? 'Medium' : 'Low'
  };
}
