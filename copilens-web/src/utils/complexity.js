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
 * Calculate Code Risk
 */
export function calculateCodeRisk(fileData) {
  let riskScore = 0;
  const factors = [];
  
  const code = fileData.content;
  const cyclomatic = calculateCyclomaticComplexity(code);
  const cognitive = calculateCognitiveComplexity(code);
  const halstead = calculateHalsteadMetrics(code);
  
  if (cyclomatic > 20) {
    riskScore += 30;
    factors.push('Very high cyclomatic complexity');
  } else if (cyclomatic > 10) {
    riskScore += 15;
    factors.push('High cyclomatic complexity');
  }
  
  if (cognitive > 30) {
    riskScore += 25;
    factors.push('Very difficult to understand');
  } else if (cognitive > 15) {
    riskScore += 10;
    factors.push('Moderately complex logic');
  }
  
  const lines = code.split('\n').length;
  if (lines > 500) {
    riskScore += 20;
    factors.push('Very large file (>500 lines)');
  } else if (lines > 300) {
    riskScore += 10;
    factors.push('Large file (>300 lines)');
  }
  
  const commentLines = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length;
  if (commentLines / lines < 0.05) {
    riskScore += 15;
    factors.push('Insufficient documentation');
  }
  
  if (halstead && halstead.bugsDelivered > 1) {
    riskScore += Math.min(20, halstead.bugsDelivered * 5);
    factors.push(`Estimated ${halstead.bugsDelivered} potential bugs`);
  }
  
  return {
    score: Math.min(100, riskScore),
    level: riskScore > 70 ? 'Critical' : riskScore > 40 ? 'High' : riskScore > 20 ? 'Medium' : 'Low',
    color: riskScore > 70 ? 'red' : riskScore > 40 ? 'orange' : riskScore > 20 ? 'yellow' : 'green',
    factors
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
    
    if (risk.score > 40) highRiskFiles++;
    
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
  
  analyses.sort((a, b) => b.risk.score - a.risk.score);
  
  return {
    files: analyses,
    topRiskyFiles: analyses.slice(0, 10),
    averageCyclomatic: files.length > 0 ? Math.round(totalCyclomatic / files.length) : 0,
    averageCognitive: files.length > 0 ? Math.round(totalCognitive / files.length) : 0,
    totalLines,
    highRiskFileCount: highRiskFiles,
    overallRisk: highRiskFiles > files.length * 0.3 ? 'High' : highRiskFiles > files.length * 0.1 ? 'Medium' : 'Low'
  };
}
