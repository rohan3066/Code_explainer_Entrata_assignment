const axios = require('axios');

/**
 * Service to interact with the GitHub API to fetch repo metadata, file tree, and analyze project framework.
 */

// Helper to parse owner and repo from URL
function parseGithubUrl(repoUrl) {
  try {
    const cleaned = repoUrl.replace(/\.git$/, '').replace(/\/$/, '');
    const urlObj = new URL(cleaned);
    if (!urlObj.hostname.includes('github.com')) {
      return null;
    }
    const pathParts = urlObj.pathname.split('/').filter(part => part !== '');
    if (pathParts.length < 2) {
      return null;
    }
    return {
      owner: pathParts[0],
      repo: pathParts[1],
    };
  } catch (error) {
    return null;
  }
}

// Set up Axios instance with auth token if available
const getGithubClient = () => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  return axios.create({
    baseURL: 'https://api.github.com',
    headers,
  });
};

/**
 * Fetches and analyzes GitHub repository metadata, structure, and details.
 */
const analyzeGithubRepo = async (repoUrl) => {
  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub Repository URL. Use format: https://github.com/owner/repo');
  }

  const { owner, repo } = parsed;
  const client = getGithubClient();

  try {
    // 1. Fetch Repository Details
    const repoRes = await client.get(`/repos/${owner}/${repo}`);
    const repoData = repoRes.data;
    const defaultBranch = repoData.default_branch || 'main';

    // 2. Fetch Languages
    const langRes = await client.get(`/repos/${owner}/${repo}/languages`);
    const languages = Object.keys(langRes.data);

    // 3. Fetch File Tree (recursive)
    let fileTree = [];
    try {
      const treeRes = await client.get(`/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
      fileTree = treeRes.data.tree || [];
    } catch (treeErr) {
      // Fallback: fetch root contents if recursive tree fails
      const contentsRes = await client.get(`/repos/${owner}/${repo}/contents`);
      fileTree = contentsRes.data.map(item => ({
        path: item.name,
        type: item.type === 'dir' ? 'tree' : 'blob',
      }));
    }

    // 4. Perform architectural analysis based on files
    const filePaths = fileTree.map(f => f.path);
    const analysis = analyzeRepoArchitecture(filePaths, languages);

    return {
      name: repoData.name,
      owner: repoData.owner.login,
      description: repoData.description || 'No description available.',
      url: repoData.html_url,
      languages,
      framework: analysis.framework,
      filesAnalyzed: fileTree.filter(f => f.type === 'blob').length,
      structure: buildFolderTree(fileTree),
      overview: analysis.overview,
      dependencyGraph: analysis.dependencyGraph,
    };
  } catch (error) {
    console.error('GitHub API Error:', error.message);
    throw new Error(`Failed to import GitHub Repository: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Detects frameworks, APIs, and builds dependency graphs from file lists
 */
function analyzeRepoArchitecture(filePaths, languages) {
  let framework = 'Vanilla / Custom';
  let overview = 'This project uses standard language features to structure logic. ';
  const apis = [];
  const dependencies = [];

  // Common framework identifiers
  const frameworkChecks = [
    { name: 'React.js', files: ['package.json', 'src/App.jsx', 'src/App.tsx', 'vite.config.js'] },
    { name: 'Next.js', files: ['next.config.js', 'app/layout.js', 'pages/_app.js'] },
    { name: 'Express.js / Node', files: ['package.json', 'server.js', 'src/index.js', 'src/server.js', 'app.js'] },
    { name: 'Django', files: ['manage.py', 'settings.py', 'urls.py'] },
    { name: 'Flask', files: ['app.py', 'wsgi.py', 'requirements.txt'] },
    { name: 'Spring Boot', files: ['pom.xml', 'build.gradle', 'src/main/java'] },
    { name: 'Laravel', files: ['artisan', 'composer.json', 'config/app.php'] },
  ];

  for (const check of frameworkChecks) {
    const hasFiles = check.files.some(f => filePaths.some(p => p.endsWith(f)));
    if (hasFiles) {
      framework = check.name;
      break;
    }
  }

  // Generate dependency graph nodes based on directory layers
  const nodes = [
    { id: 'Root', label: 'Entry Point', type: 'entry' }
  ];
  const links = [];

  if (filePaths.some(p => p.startsWith('src/controllers') || p.startsWith('controllers/'))) {
    nodes.push({ id: 'Controllers', label: 'Controllers / Handlers', type: 'controller' });
    links.push({ source: 'Root', target: 'Controllers' });
  }
  if (filePaths.some(p => p.startsWith('src/routes') || p.startsWith('routes/'))) {
    nodes.push({ id: 'Routes', label: 'Routing Layer', type: 'router' });
    links.push({ source: 'Root', target: 'Routes' });
    if (nodes.some(n => n.id === 'Controllers')) {
      links.push({ source: 'Routes', target: 'Controllers' });
    }
  }
  if (filePaths.some(p => p.startsWith('src/models') || p.startsWith('models/'))) {
    nodes.push({ id: 'Models', label: 'Data Models / DB', type: 'model' });
    if (nodes.some(n => n.id === 'Controllers')) {
      links.push({ source: 'Controllers', target: 'Models' });
    }
  }
  if (filePaths.some(p => p.startsWith('src/components') || p.startsWith('components/'))) {
    nodes.push({ id: 'Components', label: 'UI Components', type: 'ui' });
    links.push({ source: 'Root', target: 'Components' });
  }

  // If the graph remains empty, create default nodes
  if (nodes.length === 1) {
    nodes.push({ id: 'Source', label: 'Source Directory', type: 'folder' });
    nodes.push({ id: 'Config', label: 'Config / Setup', type: 'config' });
    links.push({ source: 'Root', target: 'Source' });
    links.push({ source: 'Root', target: 'Config' });
  }

  overview = `This repository is structured around a ${framework} framework, using ${languages.join(', ') || 'common technologies'}. It features standard layout configurations including configuration files at the root level and module-specific structures.`;

  return {
    framework,
    overview,
    dependencyGraph: { nodes, links },
  };
}

/**
 * Builds a visual directory tree structure from flat file paths
 */
function buildFolderTree(fileTree) {
  const root = { name: 'Root', type: 'dir', children: {} };

  fileTree.forEach(file => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const type = isLast && file.type === 'blob' ? 'file' : 'dir';

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: type,
          path: parts.slice(0, index + 1).join('/'),
          children: type === 'dir' ? {} : null,
        };
      }
      current = current.children[part];
    });
  });

  // Convert map children to arrays recursively
  function convertToArray(node) {
    if (node.type === 'file') return { name: node.name, type: 'file', path: node.path };
    const childrenArray = Object.values(node.children).map(child => convertToArray(child));
    // Sort directories before files
    childrenArray.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });
    return {
      name: node.name,
      type: 'dir',
      path: node.path,
      children: childrenArray,
    };
  }

  return convertToArray(root).children || [];
}

/**
 * Fetches the raw content of a specific file from a GitHub repository.
 */
const fetchGithubFileContent = async (repoUrl, filePath) => {
  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub Repository URL.');
  }

  const { owner, repo } = parsed;
  const client = getGithubClient();

  try {
    const res = await client.get(`/repos/${owner}/${repo}/contents/${filePath}`);
    if (res.data && res.data.content) {
      // Content is usually base64 encoded
      const content = Buffer.from(res.data.content, 'base64').toString('utf8');
      return content;
    }
    throw new Error('File content not found or is in an unsupported format.');
  } catch (error) {
    console.error('GitHub File Fetch Error:', error.message);
    throw new Error(`Failed to fetch file from GitHub: ${error.response?.data?.message || error.message}`);
  }
};

module.exports = { analyzeGithubRepo, fetchGithubFileContent };
