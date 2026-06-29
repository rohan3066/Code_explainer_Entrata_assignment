const { GoogleGenerativeAI } = require('@google/generative-ai');
const buildAnalysisPrompt = require('../utils/promptBuilder');
const parseAIResponse = require('../utils/responseParser');

/**
 * Service to analyze code using Google Gemini API.
 */
const analyzeCode = async (code, language) => {
  // Check if Gemini API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined. Please add it to your backend .env file.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use gemini-2.5-flash as the primary, high-speed, cost-effective model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const prompt = buildAnalysisPrompt(code, language);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return parseAIResponse(text);
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
};

/**
 * Returns premium mock data if no API key is provided or if the API call fails during testing.
 */
function getMockAnalysis(code, language) {
  return {
    summary: {
      oneLine: `A standard implementation written in ${language} demonstrating common programming patterns.`,
      detailed: `This snippet implements standard algorithm logic. It processes input variables, handles control flow structures, and evaluates conditions. It is optimized for basic use cases but could benefit from proper handling of edge cases.`,
      beginner: `Think of this code like a recipe in a kitchen. It takes some raw ingredients (inputs), goes through steps like stirring and heating (loops and conditions), and serves a finished dish (the output).`,
      intermediate: `This code uses structures like variables, conditional paths, and iteration to perform sequential evaluations. It maintains state throughout the method execution and returns a structured output.`,
      expert: `This is a procedural execution flow written in ${language}. It is executed sequentially on the single main thread. It holds variables on the stack and references object structures. Space complexity is low, but care must be taken to avoid nested execution overhead.`,
    },
    executionSteps: [
      { step: 1, name: 'Setup', description: 'Initialize local variables and read parameter arguments.' },
      { step: 2, name: 'Condition check', description: 'Evaluate criteria and decide branching logic.' },
      { step: 3, name: 'Execution / Loop', description: 'Iterate over elements or perform calculations.' },
      { step: 4, name: 'Return Output', description: 'Return final result to the caller.' }
    ],
    functions: [
      {
        name: 'mainProcess',
        purpose: 'Executes core logical operations on the input parameters.',
        parameters: 'data (Object), options (Array)',
        returnType: 'Boolean',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      }
    ],
    variables: [
      {
        name: 'result',
        dataType: 'Boolean',
        scope: 'Local',
        initialValue: 'false',
        purpose: 'Tracks the outcome status of the conditions.'
      }
    ],
    codingPatterns: ['OOP', 'Procedural Programming'],
    designPatterns: [
      {
        name: 'Strategy Pattern',
        location: 'Conditional branching functions',
        description: 'Dynamically selects behavior at runtime based on parameters.'
      }
    ],
    flowchart: 'graph TD;\n  A[Start] --> B[Read Variables];\n  B --> C{Verify Condition};\n  C -- Match --> D[Execute Main Logic];\n  C -- No Match --> E[Exit with Error];\n  D --> F[Return Result];\n  E --> F;\n  F --> G[End];',
    pseudocode: `FUNCTION analyze(code, options)\n  DECLARE result = FALSE\n  IF code IS NOT EMPTY THEN\n    SET result = TRUE\n    PRINT "Code analysis complete"\n  END IF\n  RETURN result\nEND FUNCTION`,
    algorithm: {
      name: 'Linear Scan',
      whyUsed: 'Chosen because it needs to inspect each element exactly once in a sequence.',
      complexity: 'O(n) time and O(1) auxiliary space.',
      realWorldApplications: 'Array searching, linear validation, basic stream processing.'
    },
    bugs: [
      {
        type: 'Potential Null Pointer Issue',
        description: 'Input parameter is not checked for null before accessing its properties.',
        suggestion: 'Add an early exit guard statement: if (!input) return null;'
      }
    ],
    securityIssues: [
      {
        type: 'SQL Injection Vulnerability',
        severity: 'Critical',
        description: 'Concatenating variables directly into raw query strings.',
        suggestion: 'Use parameterized queries or prepared statements.'
      }
    ],
    qualityScore: {
      score: 75,
      readability: 80,
      maintainability: 70,
      naming: 85,
      complexity: 65,
      documentation: 60,
      security: 90,
    },
    complexity: {
      time: 'O(n)',
      timeReason: 'The code iterates through the items exactly once, resulting in linear execution time relative to input size.',
      space: 'O(1)',
      spaceReason: 'Only simple local variables are declared, which occupy a fixed amount of additional stack space.'
    },
    optimizedCode: `// Optimized version of code\n// Added null checks and parameterized logic\n\nfunction processData(data) {\n  if (!data) return null;\n  \n  return data.map(item => {\n    // Streamlined execution\n    return item.value || 0;\n  });\n}`,
    refactoringExplanation: {
      whyOptimized: 'Refactored code handles null inputs, preventing sudden application crashes, and uses built-in optimized functional mapping.',
      performanceImprovements: 'Reduces runtime check allocations and speeds up iteration via optimized JS runtimes.',
      readabilityImprovements: 'Uses clear, standard, compact functional code instead of verbose loops.'
    },
    bestPractices: [
      'Always add guard clauses at the beginning of functions to handle empty/null inputs.',
      'Use const and let instead of obsolete var variables.',
      'Follow camelCase naming conventions for functions and variables.'
    ],
    codeSmells: [
      {
        name: 'Magic Numbers',
        description: 'Literal values used directly in comparisons. Consider declaring them as constants.'
      }
    ],
    performanceIssues: [
      {
        name: 'Nested Iteration',
        description: 'Multiple loops over the same set of elements can increase complexity to O(n²).'
      }
    ],
    memoryEstimation: {
      consumption: 'Low',
      dataStructuresUsed: 'Array, Stack Frame',
      optimizations: 'Avoid copying collections. Modify arrays in-place or use iteration generators.'
    }
  };
}

module.exports = { analyzeCode };
