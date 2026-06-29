import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Heart, ExternalLink, Code2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FavoritesPage() {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/history/favorites');
      if (res.data.success) {
        setFavorites(res.data.favorites);
      }
    } catch (err) {
      showToast('Failed to load favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleUnfavorite = async (analysisId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/history/favorites/${analysisId}`);
      if (res.data.success) {
        showToast('Removed from favorites', 'info');
        fetchFavorites();
      }
    } catch (err) {
      showToast('Failed to update favorite', 'error');
    }
  };

  const filtered = favorites.filter(item => {
    const q = search.toLowerCase();
    const lang = item.analysisId?.language?.toLowerCase() || '';
    const summary = item.analysisId?.aiResponse?.summary?.oneLine?.toLowerCase() || '';
    return lang.includes(q) || summary.includes(q);
  });

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Heart className="h-7 w-7 text-rose-500" />
            Favorite Explanations
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">Your bookmarked code analyses</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border bg-card text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="font-bold text-lg">No favorites yet</p>
          <p className="text-sm text-muted-foreground font-semibold">
            {search ? 'No results match your search.' : "Save analyses using the ♥ button on any result page."}
          </p>
          <Link to="/analyzer" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition">
            Start Analyzing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item, idx) => {
            const a = item.analysisId;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link
                  to={`/analyzer/${a?._id}`}
                  className="block p-5 bg-card border rounded-2xl hover:shadow-md transition group space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                        <Code2 className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted">
                          {a?.language || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleUnfavorite(a?._id, e)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition opacity-0 group-hover:opacity-100 duration-150"
                        title="Remove from favorites"
                      >
                        <Heart className="h-4 w-4 fill-rose-500" />
                      </button>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <p className="text-sm font-bold leading-relaxed text-foreground/90 line-clamp-2 group-hover:text-primary transition">
                    {a?.aiResponse?.summary?.oneLine || 'View Analysis'}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    {a?.qualityScore?.score !== undefined && (
                      <span className="text-xs font-bold text-primary">Score: {a.qualityScore.score}/100</span>
                    )}
                    {a?.complexity?.time && (
                      <span className="text-xs font-bold text-amber-500">{a.complexity.time}</span>
                    )}
                    <span className="text-xs text-muted-foreground font-semibold ml-auto">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
