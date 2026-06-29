/**
 * Exports analysis data as a Markdown file.
 */
export const exportToMarkdown = (analysis) => {
  if (!analysis) return;

  const { language, code, aiResponse } = analysis;
  const { summary, complexity, algorithm, bestPractices, bugs, securityIssues } = aiResponse;

  let md = `# AI Code Analysis Report - ${language.toUpperCase()}\n\n`;
  
  md += `## 1. Summary\n`;
  md += `**One Line:** ${summary.oneLine || 'N/A'}\n\n`;
  md += `### Detailed Explanation\n${summary.detailed || 'N/A'}\n\n`;
  md += `### Beginner Explanation\n${summary.beginner || 'N/A'}\n\n`;
  md += `### Expert Explanation\n${summary.expert || 'N/A'}\n\n`;

  md += `## 2. Source Code\n`;
  md += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;

  md += `## 3. Complexity Analysis\n`;
  md += `- **Time Complexity:** ${complexity.time || 'N/A'} (${complexity.timeReason || ''})\n`;
  md += `- **Space Complexity:** ${complexity.space || 'N/A'} (${complexity.spaceReason || ''})\n\n`;

  md += `## 4. Primary Algorithm\n`;
  md += `**Name:** ${algorithm.name || 'N/A'}\n`;
  md += `**Why Used:** ${algorithm.whyUsed || 'N/A'}\n`;
  md += `**Real-world Applications:** ${algorithm.realWorldApplications || 'N/A'}\n\n`;

  if (bugs && bugs.length > 0) {
    md += `## 5. Detected Bugs & Issues\n`;
    bugs.forEach((bug, index) => {
      md += `### Issue ${index + 1}: ${bug.type}\n`;
      md += `- **Description:** ${bug.description}\n`;
      md += `- **Suggestion:** ${bug.suggestion}\n\n`;
    });
  }

  if (securityIssues && securityIssues.length > 0) {
    md += `## 6. Security Analysis\n`;
    securityIssues.forEach((issue, index) => {
      md += `### Vulnerability ${index + 1}: ${issue.type} [Severity: ${issue.severity}]\n`;
      md += `- **Description:** ${issue.description}\n`;
      md += `- **Suggestion:** ${issue.suggestion}\n\n`;
    });
  }

  if (bestPractices && bestPractices.length > 0) {
    md += `## 7. Best Practices & Recommendations\n`;
    bestPractices.forEach((practice) => {
      md += `- ${practice}\n`;
    });
    md += `\n`;
  }

  if (aiResponse.optimizedCode) {
    md += `## 8. Refactored / Optimized Code\n`;
    md += `\`\`\`${language}\n${aiResponse.optimizedCode}\n\`\`\`\n\n`;
    md += `### Refactoring Details\n`;
    md += `- **Rationale:** ${aiResponse.refactoringExplanation?.whyOptimized || 'N/A'}\n`;
    md += `- **Performance Improvements:** ${aiResponse.refactoringExplanation?.performanceImprovements || 'N/A'}\n`;
    md += `- **Readability Improvements:** ${aiResponse.refactoringExplanation?.readabilityImprovements || 'N/A'}\n`;
  }

  // Create blob and trigger download
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `analysis_report_${analysis._id || 'code'}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates an elegant print window styled dynamically for PDF export.
 */
export const exportToPDF = (analysis) => {
  if (!analysis) return;

  const { language, code, aiResponse } = analysis;
  const { summary, complexity, algorithm, qualityScore } = aiResponse;

  const printWindow = window.open('', '_blank');
  
  // Build a beautiful styled HTML report layout
  const html = `
    <html>
      <head>
        <title>Code Explanation Report - ${language}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { font-size: 12px; color: #111; }
            .no-print { display: none; }
          }
          pre { background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; overflow-x: auto; }
        </style>
      </head>
      <body class="bg-gray-50 text-gray-800 p-8 font-sans">
        <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <div class="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h1 class="text-3xl font-extrabold text-indigo-700">AI Code Analysis Report</h1>
              <p class="text-sm text-gray-500 mt-1">Language: ${language.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="text-right">
              <span class="text-4xl font-black text-indigo-600">${qualityScore?.score || 'N/A'}</span>
              <p class="text-xs text-gray-400">Quality Score</p>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 border-b pb-1 mb-2">1. One-Line Summary</h2>
            <p class="italic text-gray-700 bg-indigo-50 p-3 rounded-md border-l-4 border-indigo-500">${summary.oneLine || 'N/A'}</p>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 border-b pb-1 mb-2">2. Detailed Logic</h2>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">${summary.detailed || 'N/A'}</p>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 border-b pb-1 mb-2">3. Complexity Analysis</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-3 rounded border">
                <span class="text-xs text-gray-400 block font-semibold uppercase">Time Complexity</span>
                <span class="text-lg font-bold text-indigo-600">${complexity.time || 'N/A'}</span>
                <p class="text-xs text-gray-500 mt-1">${complexity.timeReason || ''}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded border">
                <span class="text-xs text-gray-400 block font-semibold uppercase">Space Complexity</span>
                <span class="text-lg font-bold text-indigo-600">${complexity.space || 'N/A'}</span>
                <p class="text-xs text-gray-500 mt-1">${complexity.spaceReason || ''}</p>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 border-b pb-1 mb-2">4. Source Code</h2>
            <pre><code>${escapeHtml(code)}</code></pre>
          </div>

          ${aiResponse.optimizedCode ? `
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 border-b pb-1 mb-2">5. Optimized Refactoring</h2>
            <pre class="bg-emerald-50 border border-emerald-200"><code>${escapeHtml(aiResponse.optimizedCode)}</code></pre>
            <div class="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>Rationale:</strong> ${aiResponse.refactoringExplanation?.whyOptimized || 'N/A'}</p>
              <p class="mt-1"><strong>Speed benefits:</strong> ${aiResponse.refactoringExplanation?.performanceImprovements || 'N/A'}</p>
            </div>
          </div>
          ` : ''}

          <div class="no-print mt-8 flex justify-end gap-3">
            <button onclick="window.close()" class="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 transition">Cancel</button>
            <button onclick="window.print()" class="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-semibold shadow">Print / Save PDF</button>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
