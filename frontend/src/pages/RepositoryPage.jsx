import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { GitBranch, ExternalLink, Code2, FileText, Globe, FolderOpen, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingOverlay from '../components/common/LoadingOverlay';

// Simple recursive directory tree component
function FileTree({ nodes, onFileClick, depth = 0 }) {
  if (!nodes || nodes.length === 0) return null;
  return (
    <div className={`${depth > 0 ? 'ml-4 border-l pl-3 border-muted' : ''}`}>
      {nodes.map((node, idx) => (
        <div key={idx} className="my-0.5">
          <div className="flex items-center gap-1.5 py-0.5 text-xs font-medium">
            {node.type === 'dir' ? (
              <>
                <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="font-bold text-foreground/80">{node.name}</span>
              </>
            ) : (
              <button
                onClick={() => onFileClick && onFileClick(node)}
                className="flex items-center gap-1.5 text-left text-muted-foreground hover:text-primary transition font-semibold"
              >
                <FileText className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                <span>{node.name}</span>
              </button>
            )}
          </div>
          {node.type === 'dir' && node.children && (
            <FileTree nodes={node.children.slice(0, 20)} onFileClick={onFileClick} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

// Repository detail page
function RepositoryDetailPage({ repoId }) {
  const { showToast } = useToast();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const navigate = useNavigate();

  const handleExplainFile = async () => {
    if (!selectedFile) return;
    setExplaining(true);
    try {
      const res = await api.post('/analysis/github-file', {
        repoUrl: repo.url,
        filePath: selectedFile.path,
      });
      if (res.data.success) {
        showToast('File code imported and explained!', 'success');
        navigate(`/analyzer/${res.data.analysis._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to explain code.', 'error');
    } finally {
      setExplaining(false);
    }
  };

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        // Fetch from the repositories list and find by id
        const res = await api.get('/history/repositories');
        if (res.data.success) {
          const found = res.data.repositories.find(r => r._id === repoId);
          setRepo(found || null);
        }
      } catch (err) {
        showToast('Failed to load repository data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [repoId]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
        <LoadingSkeleton className="h-12 w-64 rounded-2xl" />
        <LoadingSkeleton className="h-40 w-full rounded-2xl" />
        <LoadingSkeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="font-bold text-lg">Repository not found</p>
        <Link to="/repositories" className="text-primary hover:underline text-sm font-bold">Back to repositories</Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
      <LoadingOverlay isVisible={explaining} />
      <div className="flex items-center gap-4">
        <Link to="/repositories" className="p-2 border rounded-xl hover:bg-muted transition text-sm font-bold text-muted-foreground">
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{repo.name}</h1>
          <p className="text-xs text-muted-foreground font-semibold">{repo.owner} — imported {new Date(repo.createdAt).toLocaleDateString()}</p>
        </div>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto px-4 py-2 border rounded-xl hover:bg-muted transition text-xs font-bold flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Open on GitHub
        </a>
      </div>

      {/* Overview card */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Project Overview</h2>
        <p className="text-sm text-muted-foreground font-semibold leading-relaxed">{repo.description}</p>
        <p className="text-sm font-medium leading-relaxed">{repo.overview}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {[
            { label: 'Framework', value: repo.framework || 'Vanilla' },
            { label: 'Files Analyzed', value: repo.filesAnalyzed },
            { label: 'Languages', value: repo.languages?.join(', ') || 'N/A' },
            { label: 'Imported', value: new Date(repo.createdAt).toLocaleDateString() },
          ].map(m => (
            <div key={m.label} className="bg-muted/20 rounded-xl p-3 border text-center">
              <p className="text-base font-black text-primary truncate">{m.value}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dependency graph nodes */}
      {repo.dependencyGraph?.nodes?.length > 0 && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Dependency Architecture
          </h2>
          <div className="flex flex-wrap gap-3">
            {repo.dependencyGraph.nodes.map(node => (
              <div key={node.id} className="px-4 py-2 border rounded-xl bg-muted/20 text-xs font-bold space-y-0.5 min-w-[120px] text-center">
                <p className="text-foreground">{node.label}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{node.type}</p>
              </div>
            ))}
          </div>
          {repo.dependencyGraph.links?.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Dependencies</p>
              {repo.dependencyGraph.links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="font-bold text-foreground/80">{link.source}</span>
                  <span>→</span>
                  <span className="font-bold text-primary">{link.target}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* File Tree & File Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File tree */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-amber-500" />
            Repository Structure
          </h2>
          <div className="max-h-96 overflow-y-auto bg-muted/10 rounded-xl p-4 border text-xs">
            {repo.structure ? (
              <FileTree 
                nodes={Array.isArray(repo.structure) ? repo.structure : [repo.structure]} 
                onFileClick={(fileNode) => setSelectedFile(fileNode)}
              />
            ) : (
              <p className="text-muted-foreground font-semibold">No structure available</p>
            )}
          </div>
        </div>

        {/* Selected File Analysis Info Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          {selectedFile ? (
            <div className="space-y-4 flex flex-col h-full justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky-500" />
                    <div>
                      <p className="font-extrabold text-sm text-foreground">{selectedFile.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground select-all">{selectedFile.path}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-semibold leading-relaxed space-y-2">
                  <p>Ready to extract and explain this code file using Gemini AI.</p>
                  <p className="text-[11px] text-primary bg-primary/5 border border-primary/10 rounded-lg p-2.5">
                    Click the button below to fetch the content directly from GitHub, run static detection, and generate complete code logic explanations.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExplainFile}
                disabled={explaining}
                className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {explaining ? 'Fetching & Explaining...' : (
                  <>
                    <Cpu className="h-4.5 w-4.5" />
                    Explain Code with AI
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground font-semibold py-12">
              <FileText className="h-10 w-10 text-muted-foreground/35 mb-3" />
              <p className="text-xs max-w-[240px] leading-relaxed">Select any code file from the tree structure on the left to start explanations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Repository List page
export default function RepositoryPage() {
  const { id } = useParams();

  if (id) {
    return <RepositoryDetailPage repoId={id} />;
  }

  return <RepositoryListPage />;
}

function RepositoryListPage() {
  const { showToast } = useToast();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get('/history/repositories');
        if (res.data.success) {
          setRepositories(res.data.repositories);
        }
      } catch (err) {
        showToast('Failed to load repositories', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <GitBranch className="h-7 w-7 text-primary" />
            Imported Repositories
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">GitHub repositories you have analyzed</p>
        </div>
        <Link
          to="/analyzer"
          className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition shadow-md shadow-primary/10 flex items-center gap-2"
        >
          <GitBranch className="h-4 w-4" />
          Import Repository
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : repositories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <GitBranch className="h-12 w-12 text-muted-foreground" />
          <p className="font-bold text-lg">No repositories imported</p>
          <p className="text-sm text-muted-foreground font-semibold">Import a GitHub repository from the Code Explainer page.</p>
          <Link to="/analyzer" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition">
            Import Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {repositories.map((repo, idx) => (
            <motion.div
              key={repo._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Link
                to={`/repositories/${repo._id}`}
                className="block p-5 bg-card border rounded-2xl hover:shadow-md transition group space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 text-primary flex items-center justify-center">
                      <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm group-hover:text-primary transition">{repo.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">{repo.owner}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>

                <p className="text-xs text-muted-foreground font-semibold line-clamp-2 leading-relaxed">
                  {repo.description}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted">
                    {repo.framework || 'Vanilla'}
                  </span>
                  {repo.languages?.slice(0, 3).map(lang => (
                    <span key={lang} className="text-[10px] font-bold text-primary">{lang}</span>
                  ))}
                  <span className="text-[10px] text-muted-foreground font-semibold ml-auto">
                    {new Date(repo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
