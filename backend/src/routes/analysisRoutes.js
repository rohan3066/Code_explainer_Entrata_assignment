const express = require('express');
const {
  explainCode,
  uploadFileAnalysis,
  importGithubRepo,
  explainGithubFile,
  getAnalysis,
  deleteAnalysis,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // Apply JWT protection to all analysis endpoints

router.post('/explain', explainCode);
router.post('/upload', uploadMiddleware.single('file'), uploadFileAnalysis);
router.post('/github', importGithubRepo);
router.post('/github-file', explainGithubFile);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;
