import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please provide your email', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        showToast('Password reset link sent to your email.', 'success');
        setSubmitted(true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6 bg-gradient-to-b from-transparent to-primary/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-lg space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Forgot Password</h2>
          <p className="text-sm font-medium text-muted-foreground">
            We will send you instructions to reset your password
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : (
                <>
                  <Send className="h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/15 p-4 rounded-xl text-center space-y-2">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Reset instructions sent!</p>
            <p className="text-xs text-muted-foreground font-medium">
              Please check your inbox. If the email doesn't arrive within 2 minutes, check your spam folder.
            </p>
          </div>
        )}

        <div className="text-center font-semibold text-sm">
          <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
