import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { SUPPORTED_LANGUAGES, getLanguageTemplate } from '../utils/languageMap';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import { Code2, Upload, GitFork, ArrowRight, FileCode, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyzerPage() {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload' | 'github'
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(getLanguageTemplate('javascript'));
  const [githubUrl, setGithubUrl] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
    if (activeTab === 'paste') {
      setCode(getLanguageTemplate(langId));
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      showToast(`Selected file: ${e.dataTransfer.files[0].name}`, 'info');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      if (activeTab === 'paste') {
        if (!code.trim()) {
          showToast('Please enter some code to analyze', 'warning');
          setIsAnalyzing(false);
          return;
        }

        const res = await api.post('/analysis/explain', {
          code,
          language: selectedLanguage,
        });

        if (res.data.success) {
          showToast('Analysis completed successfully!', 'success');
          navigate(`/analyzer/${res.data.analysis._id}`);
        }
      } else if (activeTab === 'upload') {
        if (!file) {
          showToast('Please select or upload a file first', 'warning');
          setIsAnalyzing(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/analysis/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (res.data.success) {
          showToast('File analyzed successfully!', 'success');
          navigate(`/analyzer/${res.data.analysis._id}`);
        }
      } else if (activeTab === 'github') {
        if (!githubUrl) {
          showToast('Please enter a GitHub repository URL', 'warning');
          setIsAnalyzing(false);
          return;
        }

        const res = await api.post('/analysis/github', {
          url: githubUrl,
        });

        if (res.data.success) {
          showToast('GitHub repository imported and analyzed!', 'success');
          navigate(`/repositories/${res.data.repository._id}`);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Analysis failed. Please check parameters and try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-black tracking-tight">AI Code Explainer</h1>
        <p className="text-sm font-semibold text-muted-foreground">Select an entry method and run intelligence scans</p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b">
        <button
          onClick={() => { setActiveTab('paste'); setFile(null); }}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition duration-150 flex items-center gap-2 ${
            activeTab === 'paste' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Code2 className="h-4 w-4" />
          Paste Code
        </button>
        <button
          onClick={() => { setActiveTab('upload'); }}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition duration-150 flex items-center gap-2 ${
            activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
        <button
          onClick={() => { setActiveTab('github'); setFile(null); }}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition duration-150 flex items-center gap-2 ${
            activeTab === 'github' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitFork className="h-4 w-4" />
          GitHub Repository
        </button>
      </div>

      {/* Inputs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Tab 1: Paste Code (Monaco Editor) */}
          {activeTab === 'paste' && (
            <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
              <div className="flex justify-between items-center p-3 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Monaco Code Editor
                </span>
              </div>
              <Editor
                height="450px"
                language={SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.monaco || 'javascript'}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                  fontFamily: 'Fira Code, Menlo, Monaco, Consolas, Courier New, monospace',
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          )}

          {/* Tab 2: Upload File (Drag & Drop) */}
          {activeTab === 'upload' && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-16 text-center transition bg-card shadow-sm flex flex-col items-center justify-center space-y-4 ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/5 border border-primary/10 text-primary flex items-center justify-center shadow-inner">
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-extrabold">Drag and drop code file here</p>
                <p className="text-xs text-muted-foreground font-semibold">Supports JS, PY, C, CPP, JAVA, RS, GO, TS, HTML, CSS, SQL, Kotlin, Swift, PHP, C#</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="px-4 py-2 border rounded-xl hover:bg-muted text-xs font-bold transition duration-200 cursor-pointer block"
                >
                  Browse File
                </label>
              </div>

              {file && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/40 text-xs font-bold text-emerald-600 border-emerald-500/20">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: GitHub Repo */}
          {activeTab === 'github' && (
            <div className="border rounded-2xl p-8 bg-card shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/5 border border-primary/10 text-primary flex items-center justify-center">
                  <GitFork className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold">Import GitHub Repository</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Analyze codebase architecture and dependency maps</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GitHub URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/owner/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg">Configuration</h3>

            {/* Language Selector */}
            {activeTab !== 'github' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="auto">Auto-detect Language</option>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-4 bg-primary text-primary-foreground font-bold hover:bg-primary/95 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <span>Analyzing Code...</span>
              ) : (
                <>
                  <span>Run Explanation</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
