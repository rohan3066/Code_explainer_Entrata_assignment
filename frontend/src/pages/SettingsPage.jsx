import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Settings, User, Sun, Moon, Key, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [geminiKey, setGeminiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async () => {
    if (!name.trim()) {
      showToast('Name cannot be empty', 'warning');
      return;
    }
    setSaving(true);
    const res = await updateProfile(name, user?.avatar);
    setSaving(false);
    if (res.success) {
      showToast('Profile updated successfully', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Settings className="h-7 w-7 text-primary" />
          Settings
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border rounded-2xl p-6 shadow-sm space-y-6"
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile
        </h2>

        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full border-2 border-primary/20 object-cover shadow" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl font-extrabold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className="font-bold">{user?.name}</p>
            <p className="text-sm text-muted-foreground font-semibold">{user?.email}</p>
            {user?.googleId && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mt-1 inline-block">
                Google Account
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border bg-muted/40 text-sm font-medium text-muted-foreground cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleProfileSave}
            disabled={saving}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition flex items-center gap-2 shadow-md shadow-primary/10 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      {/* Theme Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border rounded-2xl p-6 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-bold">Appearance</h2>

        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-indigo-500" />
            ) : (
              <Sun className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className="font-bold text-sm">Theme Mode</p>
              <p className="text-xs text-muted-foreground font-semibold capitalize">{theme} mode is active</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 border rounded-xl hover:bg-muted transition text-xs font-bold"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </motion.div>

      {/* API Keys Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border rounded-2xl p-6 shadow-sm space-y-5"
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          API Configuration
        </h2>
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          API keys are managed via environment variables on the backend server. To configure them, update the <code className="font-mono text-primary bg-muted/40 px-1 py-0.5 rounded">.env</code> file in the backend directory.
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-muted/20 rounded-xl border space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gemini API Key</p>
            <code className="text-xs font-mono text-muted-foreground">GEMINI_API_KEY=your_gemini_api_key_here</code>
            <p className="text-[10px] text-muted-foreground font-semibold">Get it at: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aistudio.google.com</a></p>
          </div>

          <div className="p-4 bg-muted/20 rounded-xl border space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GitHub Personal Access Token</p>
            <code className="text-xs font-mono text-muted-foreground">GITHUB_TOKEN=your_github_token_here</code>
            <p className="text-[10px] text-muted-foreground font-semibold">Get it at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/settings/tokens</a></p>
          </div>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border rounded-2xl p-6 shadow-sm space-y-2"
      >
        <h2 className="text-lg font-bold">About</h2>
        <div className="space-y-1 text-xs font-semibold text-muted-foreground">
          <p>DeCode AI — AI-Powered Code Explainer</p>
          <p>Version 1.0.0</p>
          <p>Powered by Google Gemini API</p>
        </div>
      </motion.div>
    </div>
  );
}
