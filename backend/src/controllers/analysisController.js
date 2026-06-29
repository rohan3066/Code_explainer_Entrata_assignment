const Analysis = require('../models/Analysis');
const History = require('../models/History');
const Favorite = require('../models/Favorite');
const Repository = require('../models/Repository');
const { analyzeCode } = require('../services/aiService');
const { analyzeGithubRepo, fetchGithubFileContent } = require('../services/githubService');
const detectLanguage = require('../utils/languageDetector');

// @desc    Analyze code snippet
// @route   POST /api/analysis/explain
// @access  Private
exports.explainCode = async (req, res, next) => {
  try {
    let { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide code to analyze' });
    }

    // Auto-detect language if specified or blank
    if (!language || language.toLowerCase() === 'auto' || language.toLowerCase() === 'detect') {
      language = detectLanguage(code);
    }

    // Call AI service to get full structured JSON response
    const aiResponse = await analyzeCode(code, language);

    // Save to Analysis collection
    const analysis = await Analysis.create({
      userId: req.user.id,
      code,
      language,
      aiResponse,
    });

    // Create history item
    const summaryTitle = aiResponse.summary?.oneLine || 'Code Explanation';
    // Limit summary title length for display
    const title = summaryTitle.length > 50 ? summaryTitle.substring(0, 47) + '...' : summaryTitle;

    await History.create({
      userId: req.user.id,
      analysisId: analysis._id,
      title,
      language,
    });

    res.status(201).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze uploaded source file
// @route   POST /api/analysis/upload
// @access  Private
exports.uploadFileAnalysis = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const code = req.file.buffer.toString('utf8');
    
    // Simple extension to language mapper
    const filename = req.file.originalname.toLowerCase();
    let language = 'javascript';
    if (filename.endsWith('.py')) language = 'python';
    else if (filename.endsWith('.java')) language = 'java';
    else if (filename.endsWith('.cpp') || filename.endsWith('.cc') || filename.endsWith('.h')) language = 'cpp';
    else if (filename.endsWith('.c')) language = 'c';
    else if (filename.endsWith('.ts') || filename.endsWith('.tsx')) language = 'typescript';
    else if (filename.endsWith('.go')) language = 'go';
    else if (filename.endsWith('.rs')) language = 'rust';
    else if (filename.endsWith('.php')) language = 'php';
    else if (filename.endsWith('.kt')) language = 'kotlin';
    else if (filename.endsWith('.swift')) language = 'swift';
    else if (filename.endsWith('.cs')) language = 'csharp';
    else if (filename.endsWith('.html') || filename.endsWith('.htm')) language = 'html';
    else if (filename.endsWith('.css')) language = 'css';
    else if (filename.endsWith('.sql')) language = 'sql';
    else {
      // Fallback to auto-detection from content
      language = detectLanguage(code);
    }

    const aiResponse = await analyzeCode(code, language);

    const analysis = await Analysis.create({
      userId: req.user.id,
      code,
      language,
      aiResponse,
    });

    await History.create({
      userId: req.user.id,
      analysisId: analysis._id,
      title: req.file.originalname,
      language,
    });

    res.status(201).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import and analyze GitHub Repository
// @route   POST /api/analysis/github
// @access  Private
exports.importGithubRepo = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'Please provide a GitHub Repository URL' });
    }

    // Call GitHub analysis service
    const repoAnalysis = await analyzeGithubRepo(url);

    // Save to Repositories collection
    const repository = await Repository.create({
      userId: req.user.id,
      url: repoAnalysis.url,
      name: repoAnalysis.name,
      owner: repoAnalysis.owner,
      description: repoAnalysis.description,
      languages: repoAnalysis.languages,
      framework: repoAnalysis.framework,
      filesAnalyzed: repoAnalysis.filesAnalyzed,
      structure: repoAnalysis.structure,
      overview: repoAnalysis.overview,
      dependencyGraph: repoAnalysis.dependencyGraph,
    });

    res.status(201).json({
      success: true,
      repository,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single analysis details
// @route   GET /api/analysis/:id
// @access  Private
exports.getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // Check ownership
    if (analysis.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this analysis' });
    }

    // Check if it is favorited
    const favorite = await Favorite.findOne({
      userId: req.user.id,
      analysisId: analysis._id,
    });
    
    // Add dynamically
    const analysisObj = analysis.toObject();
    analysisObj.isFavorite = !!favorite;

    res.status(200).json({
      success: true,
      analysis: analysisObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete analysis
// @route   DELETE /api/analysis/:id
// @access  Private
exports.deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    if (analysis.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this analysis' });
    }

    // Delete corresponding history and favorites entries
    await History.deleteMany({ analysisId: analysis._id });
    await Favorite.deleteMany({ analysisId: analysis._id });
    await Analysis.findByIdAndDelete(analysis._id);

    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch and analyze a specific file from a GitHub repository
// @route   POST /api/analysis/github-file
// @access  Private
exports.explainGithubFile = async (req, res, next) => {
  try {
    const { repoUrl, filePath, language } = req.body;

    if (!repoUrl || !filePath) {
      return res.status(400).json({ success: false, message: 'Please provide repository URL and file path' });
    }

    // 1. Fetch file content
    const code = await fetchGithubFileContent(repoUrl, filePath);

    // 2. Determine language (fallback to detect if auto/unspecified)
    let detectedLang = language;
    if (!detectedLang || detectedLang.toLowerCase() === 'auto' || detectedLang.toLowerCase() === 'detect') {
      const filename = filePath.toLowerCase();
      if (filename.endsWith('.py')) detectedLang = 'python';
      else if (filename.endsWith('.java')) detectedLang = 'java';
      else if (filename.endsWith('.cpp') || filename.endsWith('.cc') || filename.endsWith('.h')) detectedLang = 'cpp';
      else if (filename.endsWith('.c')) detectedLang = 'c';
      else if (filename.endsWith('.ts') || filename.endsWith('.tsx')) detectedLang = 'typescript';
      else if (filename.endsWith('.go')) detectedLang = 'go';
      else if (filename.endsWith('.rs')) detectedLang = 'rust';
      else if (filename.endsWith('.php')) detectedLang = 'php';
      else if (filename.endsWith('.kt')) detectedLang = 'kotlin';
      else if (filename.endsWith('.swift')) detectedLang = 'swift';
      else if (filename.endsWith('.cs')) detectedLang = 'csharp';
      else if (filename.endsWith('.html') || filename.endsWith('.htm')) detectedLang = 'html';
      else if (filename.endsWith('.css')) detectedLang = 'css';
      else if (filename.endsWith('.sql')) detectedLang = 'sql';
      else {
        detectedLang = detectLanguage(code);
      }
    }

    // 3. Analyze code using Gemini API
    const aiResponse = await analyzeCode(code, detectedLang);

    // 4. Save to Analysis collection
    const analysis = await Analysis.create({
      userId: req.user.id,
      code,
      language: detectedLang,
      aiResponse,
    });

    // 5. Create history item
    const summaryTitle = aiResponse.summary?.oneLine || 'Code Explanation';
    const title = summaryTitle.length > 50 ? summaryTitle.substring(0, 47) + '...' : summaryTitle;

    await History.create({
      userId: req.user.id,
      analysisId: analysis._id,
      title: `${filePath.split('/').pop()} (${title})`,
      language: detectedLang,
    });

    res.status(201).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};
