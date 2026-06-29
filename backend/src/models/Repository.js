const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    description: String,
    languages: [String],
    framework: String,
    filesAnalyzed: {
      type: Number,
      default: 0,
    },
    structure: {
      type: mongoose.Schema.Types.Mixed, // Stores the directory structure tree
    },
    overview: String,
    dependencyGraph: {
      type: mongoose.Schema.Types.Mixed, // Stores graph nodes and links for display
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Repository', repositorySchema);
