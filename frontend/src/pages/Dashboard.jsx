import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatsCard from '../components/dashboard/StatsCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  Code,
  Heart,
  GitBranch,
  Terminal,
  Search,
  ExternalLink,
  Plus,
  BarChart2,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/history/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast('Failed to retrieve dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteAnalysis = async (id, e) => {
    e.preventDefault(); // Stop navigation
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const res = await api.delete(`/analysis/${id}`);
      if (res.data.success) {
        showToast('Analysis deleted', 'success');
        fetchDashboardData(); // Refresh
      }
    } catch (err) {
      showToast('Failed to delete analysis', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <LoadingSkeleton className="h-10 w-48" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-28 w-full rounded-2xl" />
          <LoadingSkeleton className="h-28 w-full rounded-2xl" />
          <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <LoadingSkeleton className="h-12 w-full" />
            <LoadingSkeleton className="h-[300px] w-full" />
          </div>
          <LoadingSkeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  const recentAnalysesFiltered = stats?.recentAnalyses?.filter(item => {
    const title = item.title?.toLowerCase() || '';
    const lang = item.language?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return title.includes(query) || lang.includes(query);
  }) || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-sm font-semibold text-muted-foreground">Monitor and access your code explanations</p>
        </div>
        <Link
          to="/analyzer"
          className="px-5 py-3 bg-primary text-primary-foreground font-bold hover:bg-primary/95 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-xl self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Explanation
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Explanations"
          value={stats?.totalExplanations || 0}
          icon={Code}
          delay={0}
        />
        <StatsCard
          title="Favorite Explanations"
          value={stats?.totalFavorites || 0}
          icon={Heart}
          delay={0.1}
        />
        <StatsCard
          title="Imported Repositories"
          value={stats?.totalRepos || 0}
          icon={GitBranch}
          delay={0.2}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Analyses with Search */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Recent Explanations</h2>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter by name or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border bg-card text-xs font-semibold rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            {recentAnalysesFiltered.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Terminal className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground">No analyses found</p>
                <Link to="/analyzer" className="text-xs font-bold text-primary hover:underline">
                  Analyze your first code snippet now
                </Link>
              </div>
            ) : (
              <div className="divide-y overflow-x-auto">
                {recentAnalysesFiltered.map((item) => (
                  <Link
                    key={item._id}
                    to={`/analyzer/${item.analysisId?._id || ''}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/40 transition duration-150 group min-w-[500px]"
                  >
                    <div className="space-y-1 pr-4 flex-1">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="px-2 py-0.5 rounded bg-muted font-bold text-[10px] uppercase">
                          {item.language}
                        </span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        {item.analysisId?.qualityScore && (
                          <span className="text-indigo-500 font-bold">
                            Score: {item.analysisId.qualityScore.score}/100
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleDeleteAnalysis(item.analysisId?._id, e)}
                        className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100 duration-150"
                        title="Delete explanation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Language Chart & Repos */}
        <div className="space-y-8">
          {/* Languages Used Chart */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Languages Used
            </h2>
            
            {stats?.languagesUsed?.length === 0 ? (
              <p className="text-xs text-muted-foreground font-semibold py-6 text-center">No languages recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {stats?.languagesUsed?.map((lang, idx) => (
                  <div key={lang.language} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-foreground/80">{lang.language}</span>
                      <span className="text-muted-foreground">{lang.count} scan(s)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(lang.count / stats.totalExplanations) * 100}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Repos */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Recent Repositories</h2>
            {stats?.recentRepos?.length === 0 ? (
              <p className="text-xs text-muted-foreground font-semibold py-6 text-center">No repositories imported.</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentRepos?.map(repo => (
                  <Link
                    key={repo._id}
                    to={`/repositories/${repo._id}`}
                    className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/40 transition duration-150 group"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <p className="text-xs font-bold truncate group-hover:text-primary transition">{repo.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{repo.owner} | {repo.framework || 'Vanilla'}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
