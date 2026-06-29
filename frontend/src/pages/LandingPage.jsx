import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, ArrowRight, Zap, Shield, Bug, GitBranch, Cpu, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      title: "AI Explanations",
      desc: "Receive instant explanations curated for different levels of developer expertise, from beginner to systems engineer.",
      icon: Cpu
    },
    {
      title: "Flowchart Generation",
      desc: "Automatically translate logic structure into visual diagrams utilizing Mermaid.js rendering panels.",
      icon: GitBranch
    },
    {
      title: "Bug & Smell Scanning",
      desc: "Uncover logical traps, memory allocation problems, runtime crashes, and syntax errors with recommended fixes.",
      icon: Bug
    },
    {
      title: "Security Assessment",
      desc: "Audit source files for hardcoded database secrets, CSRF exposures, and SQL injection flaws automatically.",
      icon: Shield
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero section */}
      <section className="relative overflow-hidden py-20 px-6 text-center space-y-8 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative">
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card text-sm font-semibold text-primary shadow-sm"
          >
            <Zap className="h-4 w-4" />
            <span>AI-powered Code Analysis Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-none"
          >
            Understand Any Codebase in{' '}
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Seconds
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Paste snippets, drop local file structures, or connect remote GitHub repositories. Get visual flowcharts, refactored variations, quality metrics, and performance optimizations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 pt-6"
          >
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold transition shadow-lg shadow-primary/20 flex items-center gap-2 group"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold transition shadow-lg shadow-primary/20 flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-card border hover:bg-muted rounded-xl font-bold transition flex items-center gap-2"
                >
                  Simulate Demo
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">Standard-setting AI Analysis Features</h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">
            Combines advanced static AST insights with modern generative capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition space-y-4 text-left"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
