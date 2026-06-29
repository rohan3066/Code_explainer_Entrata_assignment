const mongoose = require('mongoose');
const History = require('../models/History');
const Favorite = require('../models/Favorite');
const Repository = require('../models/Repository');
const Analysis = require('../models/Analysis');

// @desc    Get all analysis history for user
// @route   GET /api/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const history = await History.find({ userId: req.user.id })
      .populate({
        path: 'analysisId',
        select: 'qualityScore complexity language createdAt',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all favorite analyses for user
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .populate({
        path: 'analysisId',
        select: 'qualityScore complexity language code aiResponse.summary.oneLine createdAt',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite on an analysis
// @route   POST /api/favorites/:analysisId
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { analysisId } = req.params;

    // Verify analysis exists
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // Check ownership
    if (analysis.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to favorite this item' });
    }

    // Check if already favorited
    const existingFav = await Favorite.findOne({
      userId: req.user.id,
      analysisId,
    });

    let favorited = false;
    if (existingFav) {
      await Favorite.findByIdAndDelete(existingFav._id);
      analysis.isFavorite = false;
    } else {
      await Favorite.create({
        userId: req.user.id,
        analysisId,
      });
      analysis.isFavorite = true;
      favorited = true;
    }
    await analysis.save();

    res.status(200).json({
      success: true,
      favorited,
      message: favorited ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's imported repositories
// @route   GET /api/history/repositories
// @access  Private
exports.getRepositories = async (req, res, next) => {
  try {
    const repos = await Repository.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: repos.length,
      repositories: repos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/user/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Total Explanations count
    const totalExplanations = await Analysis.countDocuments({ userId });

    // 2. Favorites count
    const totalFavorites = await Favorite.countDocuments({ userId });

    // 3. GitHub Repos count
    const totalRepos = await Repository.countDocuments({ userId });

    // 4. Recent analyses list (last 5)
    const recentAnalyses = await History.find({ userId })
      .populate({
        path: 'analysisId',
        select: 'qualityScore complexity.time language createdAt aiResponse.summary.oneLine',
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Recent GitHub Repos (last 5)
    const recentRepos = await Repository.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Languages Used (aggregation for chart)
    const languageStats = await Analysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Format languages for frontend consumption
    const languagesUsed = languageStats.map(stat => ({
      language: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
      count: stat.count,
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalExplanations,
        totalFavorites,
        totalRepos,
        recentAnalyses,
        recentRepos,
        languagesUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};
