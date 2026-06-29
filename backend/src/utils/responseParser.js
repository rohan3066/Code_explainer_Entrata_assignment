/**
 * Parses AI text responses, extracting and cleaning JSON from optional markdown wrappers.
 */
function parseAIResponse(text) {
  if (!text) {
    throw new Error('AI response is empty');
  }

  let cleanedText = text.trim();

  // Remove markdown JSON code block formatting if present
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }

  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }

  cleanedText = cleanedText.trim();

  // Locate the actual JSON object bounds if there's text surrounding it
  const startIdx = cleanedText.indexOf('{');
  const endIdx = cleanedText.lastIndexOf('}');

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleanedText = cleanedText.substring(startIdx, endIdx + 1);
  }

  try {
    const parsed = JSON.parse(cleanedText);
    return sanitizeParsedData(parsed);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    console.log('Original Text Snippet:', text.substring(0, 200));
    throw new Error('Invalid JSON response returned by AI. Please try again.');
  }
}

/**
 * Normalizes and sets defaults for all expected JSON fields to prevent UI runtime crashes.
 */
function sanitizeParsedData(data) {
  const defaultResponse = {
    summary: {
      oneLine: 'Unable to generate summary.',
      detailed: 'No detailed explanation available.',
      beginner: 'No explanation available.',
      intermediate: 'No explanation available.',
      expert: 'No explanation available.',
    },
    executionSteps: [],
    functions: [],
    variables: [],
    codingPatterns: [],
    designPatterns: [],
    flowchart: 'graph TD;\n  A[Start] --> B[Code Processed] --> C[End];',
    pseudocode: '// Pseudocode unavailable',
    algorithm: {
      name: 'Custom Procedure',
      whyUsed: 'Not specified',
      complexity: 'Not specified',
      realWorldApplications: 'Not specified',
    },
    bugs: [],
    securityIssues: [],
    qualityScore: {
      score: 50,
      readability: 50,
      maintainability: 50,
      naming: 50,
      complexity: 50,
      documentation: 50,
      security: 50,
    },
    complexity: {
      time: 'N/A',
      timeReason: 'Not specified',
      space: 'N/A',
      spaceReason: 'Not specified',
    },
    optimizedCode: '',
    refactoringExplanation: {
      whyOptimized: 'Not specified',
      performanceImprovements: 'Not specified',
      readabilityImprovements: 'Not specified',
    },
    bestPractices: [],
    codeSmells: [],
    performanceIssues: [],
    memoryEstimation: {
      consumption: 'N/A',
      dataStructuresUsed: 'N/A',
      optimizations: 'Not specified',
    },
  };

  // Shallow merge
  return {
    summary: { ...defaultResponse.summary, ...data.summary },
    executionSteps: Array.isArray(data.executionSteps) ? data.executionSteps : defaultResponse.executionSteps,
    functions: Array.isArray(data.functions) ? data.functions : defaultResponse.functions,
    variables: Array.isArray(data.variables) ? data.variables : defaultResponse.variables,
    codingPatterns: Array.isArray(data.codingPatterns) ? data.codingPatterns : defaultResponse.codingPatterns,
    designPatterns: Array.isArray(data.designPatterns) ? data.designPatterns : defaultResponse.designPatterns,
    flowchart: typeof data.flowchart === 'string' ? data.flowchart : defaultResponse.flowchart,
    pseudocode: typeof data.pseudocode === 'string' ? data.pseudocode : defaultResponse.pseudocode,
    algorithm: { ...defaultResponse.algorithm, ...data.algorithm },
    bugs: Array.isArray(data.bugs) ? data.bugs : defaultResponse.bugs,
    securityIssues: Array.isArray(data.securityIssues) ? data.securityIssues : defaultResponse.securityIssues,
    qualityScore: { ...defaultResponse.qualityScore, ...data.qualityScore },
    complexity: { ...defaultResponse.complexity, ...data.complexity },
    optimizedCode: typeof data.optimizedCode === 'string' ? data.optimizedCode : defaultResponse.optimizedCode,
    refactoringExplanation: { ...defaultResponse.refactoringExplanation, ...data.refactoringExplanation },
    bestPractices: Array.isArray(data.bestPractices) ? data.bestPractices : defaultResponse.bestPractices,
    codeSmells: Array.isArray(data.codeSmells) ? data.codeSmells : defaultResponse.codeSmells,
    performanceIssues: Array.isArray(data.performanceIssues) ? data.performanceIssues : defaultResponse.performanceIssues,
    memoryEstimation: { ...defaultResponse.memoryEstimation, ...data.memoryEstimation },
  };
}

module.exports = parseAIResponse;
