import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Key, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login, guestLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide email and password', 'warning');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      showToast('Successfully logged in!', 'success');
      navigate('/dashboard');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    const res = await guestLogin();
    setIsLoading(false);

    if (res.success) {
      showToast('Logged in successfully as guest!', 'success');
      navigate('/dashboard');
    } else {
      showToast(res.message, 'error');
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
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-sm font-medium text-muted-foreground">Sign in to your DeCode AI account</p>
        </div>

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

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute w-full border-t" />
          <span className="relative bg-card px-4 text-xs font-bold uppercase text-muted-foreground">Or Connect With</span>
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full py-3 border bg-background hover:bg-muted text-foreground font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <User className="h-4 w-4 text-primary" />
          Login without Account
        </button>

        <p className="text-center text-sm font-medium text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
