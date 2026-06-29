const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: [true, 'Please add code to analyze'],
    },
    language: {
      type: String,
      required: true,
    },
    aiResponse: {
      summary: {
        oneLine: String,
        detailed: String,
        beginner: String,
        intermediate: String,
        expert: String,
      },
      executionSteps: [
        {
          step: Number,
          name: String,
          description: String,
        }
      ],
      functions: [
        {
          name: String,
          purpose: String,
          parameters: String,
          returnType: String,
          timeComplexity: String,
          spaceComplexity: String,
        }
      ],
      variables: [
        {
          name: String,
          dataType: String,
          scope: String,
          initialValue: String,
          purpose: String,
        }
      ],
      codingPatterns: [String],
      designPatterns: [
        {
          name: String,
          location: String,
          description: String,
        }
      ],
      flowchart: String, // Mermaid.js flowchart code
      pseudocode: String,
      algorithm: {
        name: String,
        whyUsed: String,
        complexity: String,
        realWorldApplications: String,
      },
      bugs: [
        {
          type: { type: String }, // e.g. Logical, Runtime, Null Pointer, etc.
          description: String,
          suggestion: String,
        }
      ],
      securityIssues: [
        {
          type: { type: String }, // e.g. SQL Injection, XSS, Hardcoded Secret, etc.
          severity: String,
          description: String,
          suggestion: String,
        }
      ],
      qualityScore: {
        score: Number,
        readability: Number,
        maintainability: Number,
        naming: Number,
        complexity: Number,
        documentation: Number,
        security: Number,
      },
      complexity: {
        time: String,
        timeReason: String,
        space: String,
        spaceReason: String,
      },
      optimizedCode: String,
      refactoringExplanation: {
        whyOptimized: String,
        performanceImprovements: String,
        readabilityImprovements: String,
      },
      bestPractices: [String],
      codeSmells: [
        {
          name: String,
          description: String,
        }
      ],
      performanceIssues: [
        {
          name: String,
          description: String,
        }
      ],
      memoryEstimation: {
        consumption: String,
        dataStructuresUsed: String,
        optimizations: String,
      },
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analysis', analysisSchema);
