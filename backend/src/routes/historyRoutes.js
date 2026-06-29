const express = require('express');
const {
  getHistory,
  getFavorites,
  toggleFavorite,
  getRepositories,
  getUserStats,
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Apply JWT protection to all history/stats endpoints

router.get('/', getHistory);
router.get('/favorites', getFavorites);
router.post('/favorites/:analysisId', toggleFavorite);
router.get('/repositories', getRepositories);
router.get('/stats', getUserStats);

module.exports = router;
