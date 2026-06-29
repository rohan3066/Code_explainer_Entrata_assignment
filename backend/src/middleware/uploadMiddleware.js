const multer = require('multer');

// Store file in memory to retrieve code easily as strings
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept text files and code files
    // You can add list of allowed extensions if needed
    cb(null, true);
  },
});

module.exports = upload;
