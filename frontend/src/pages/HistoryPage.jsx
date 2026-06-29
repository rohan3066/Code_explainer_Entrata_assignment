import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { History, Search, Trash2, ExternalLink, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history');
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      showToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (analysisId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this analysis from history?')) return;
    try {
      const res = await api.delete(`/analysis/${analysisId}`);
      if (res.data.success) {
        showToast('Analysis deleted', 'success');
        fetchHistory();
      }
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const filtered = history.filter(item => {
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.language?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <History className="h-7 w-7 text-primary" />
            Analysis History
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">All your past code explanations</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border bg-card text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground" />
          <p className="font-bold text-lg">No analyses found</p>
          <p className="text-sm text-muted-foreground font-semibold">
            {search ? 'No results match your search.' : "You haven't analyzed any code yet."}
          </p>
          <Link to="/analyzer" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition shadow-md shadow-primary/10">
            Start Analyzing
          </Link>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y">
            {filtered.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  to={`/analyzer/${item.analysisId?._id}`}
                  className="flex items-center justify-between p-5 hover:bg-muted/30 transition duration-150 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate group-hover:text-primary transition">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted">
                          {item.language}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        {item.analysisId?.qualityScore?.score !== undefined && (
                          <span className="text-xs font-bold text-primary">
                            Score: {item.analysisId.qualityScore.score}/100
                          </span>
                        )}
                        {item.analysisId?.complexity?.time && (
                          <span className="text-xs font-bold text-amber-500">
                            {item.analysisId.complexity.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={(e) => handleDelete(item.analysisId?._id, e)}
                      className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100 duration-150"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground font-semibold text-center">
        Showing {filtered.length} of {history.length} analysis records
      </p>
    </div>
  );
}
