/**
 * Generates the master prompt for Gemini API code analysis.
 * Instructs the AI to analyze the code and return a structured JSON response.
 */
function buildAnalysisPrompt(code, language) {
  return `You are an expert AI code analyst and senior engineer. Analyze the following code snippet written in ${language}.
Provide a comprehensive, deep analysis in a strict JSON format matching the schema specified below.
Do not include any explanation, backticks, or markdown formatting outside of the JSON object. Return ONLY the raw JSON string.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

JSON Schema to follow strictly:
{
  "summary": {
    "oneLine": "A clear, concise one-line summary of what the code does.",
    "detailed": "A detailed explanation of the logic, mechanisms, and functionality.",
    "beginner": "An explanation designed for a beginner developer, using analogies and simple terminology.",
    "intermediate": "An explanation designed for an intermediate developer, explaining classes, methods, libraries.",
    "expert": "An explanation designed for a senior/expert developer, discussing performance, concurrency, architecture, patterns, or language-specific nuances."
  },
  "executionSteps": [
    {
      "step": 1,
      "name": "Step title or action",
      "description": "Explanation of what happens in this step, e.g. variable initialization, loop setup, return value."
    }
  ],
  "functions": [
    {
      "name": "Function or method name",
      "purpose": "What this function does",
      "parameters": "Comma-separated list of parameter names and types",
      "returnType": "The type of data returned, or void/None",
      "timeComplexity": "Big-O time complexity, e.g. O(n)",
      "spaceComplexity": "Big-O space complexity, e.g. O(1)"
    }
  ],
  "variables": [
    {
      "name": "Variable name",
      "dataType": "Data type, e.g. integer, array, string, object",
      "scope": "Variable scope, e.g. local, global, class-level",
      "initialValue": "Initial value if visible, or N/A",
      "purpose": "What the variable represents and how it is used"
    }
  ],
  "codingPatterns": [
    "Array of detected patterns: e.g. Recursion, Dynamic Programming, Greedy Algorithm, Divide & Conquer, Sliding Window, Two Pointer, Graph Algorithms, BFS, DFS, OOP, Functional Programming"
  ],
  "designPatterns": [
    {
      "name": "Name of pattern: e.g. Singleton, Factory, Builder, Observer, Strategy, MVC",
      "location": "Where it is implemented in the code",
      "description": "Explanation of how it is implemented and why"
    }
  ],
  "flowchart": "Mermaid.js flowchart code representing the control flow. Use flow direction graph TD or graph LR. Example syntax: graph TD; A[Start] --> B{Is x > 0}; B -- Yes --> C[Do something]; B -- No --> D[Do something else]; C --> E[End]; D --> E;. Make sure to use standard double quotes inside brackets if needed like A[\"Text\"]. DO NOT use any markdown backticks in this flowchart field, just raw mermaid syntax text.",
  "pseudocode": "A highly readable, clean, language-agnostic pseudocode representing this snippet.",
  "algorithm": {
    "name": "Primary algorithm used, e.g. Binary Search, Quicksort, Dijkstra, custom loop",
    "whyUsed": "Why this algorithm was chosen or is suitable here",
    "complexity": "Algorithmic complexity summary",
    "realWorldApplications": "Real-world systems or cases where this algorithm is commonly used"
  },
  "bugs": [
    {
      "type": "Logical Error / Runtime Error / Null Pointer Issue / Infinite Loop / Dead Code / Duplicate Code",
      "description": "Description of the bug or potential issue",
      "suggestion": "How to fix the bug"
    }
  ],
  "securityIssues": [
    {
      "type": "SQL Injection / XSS / CSRF / Hardcoded Secret / Unsafe File Upload / Authentication Issue / Weak Password Logic",
      "severity": "Low / Medium / High / Critical",
      "description": "Description of the vulnerability or risk",
      "suggestion": "How to mitigate the risk"
    }
  ],
  "qualityScore": {
    "score": 85, // Overall score out of 100 based on readability, maintainability, naming, complexity, documentation, and security
    "readability": 80, // score out of 100
    "maintainability": 85, // score out of 100
    "naming": 90, // score out of 100
    "complexity": 75, // score out of 100
    "documentation": 70, // score out of 100
    "security": 95 // score out of 100
  },
  "complexity": {
    "time": "O(n log n)", // e.g., O(n)
    "timeReason": "Why the time complexity is as stated, explaining loops or recursive calls",
    "space": "O(n)", // e.g., O(1)
    "spaceReason": "Why the space complexity is as stated, explaining memory allocation"
  },
  "optimizedCode": "An optimized, clean, formatted version of the code that improves performance, readability, naming, or security.",
  "refactoringExplanation": {
    "whyOptimized": "Detailed explanation of why these refactoring changes were made.",
    "performanceImprovements": "Performance benefits achieved (e.g. fewer iterations, lower memory footprint).",
    "readabilityImprovements": "Readability or maintainability enhancements (e.g. modularized functions, better variable names)."
  },
  "bestPractices": [
    "List of best practice improvements based on modern standards of the programming language."
  ],
  "codeSmells": [
    {
      "name": "Long Method / Large Class / Duplicate Code / God Object / Dead Code / Magic Number",
      "description": "Where it is located and why it is considered a code smell."
    }
  ],
  "performanceIssues": [
    {
      "name": "Nested Loop / Unnecessary Computation / Redundant Variable / Slow Algorithm / Expensive Database Call",
      "description": "Detailed explanation of the performance issue and its effect."
    }
  ],
  "memoryEstimation": {
    "consumption": "Estimated memory consumption footprint, e.g. Low, Medium, High or approximate bytes/words per item",
    "dataStructuresUsed": "List of primary data structures holding data in memory, e.g. Array, Hash Map, Set, Call Stack frames",
    "optimizations": "Memory optimization recommendations (e.g. use generators, clear variables, pre-allocate space)"
  }
}

Remember to return only the raw JSON. Do not wrap the JSON output in markdown blocks like \`\`\`json ... \`\`\`. Your output must start with '{' and end with '}'.`;
}

module.exports = buildAnalysisPrompt;
