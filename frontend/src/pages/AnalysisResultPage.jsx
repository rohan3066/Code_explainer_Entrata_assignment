import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import CopyButton from '../components/common/CopyButton';
import { PanelSkeleton } from '../components/common/LoadingSkeleton';
import { exportToMarkdown, exportToPDF } from '../utils/exportUtils';
import {
  BookOpen, Cpu, Shield, Bug, Zap, Code2, BarChart2,
  Layers, ArrowLeft, Heart, Download, FileText, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, XCircle, Info, Clock, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components ---

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 text-primary flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <span className="font-bold text-base">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QualityBar({ label, value }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-foreground/80">{label}</span>
        <span className={`${value >= 75 ? 'text-emerald-500' : value >= 50 ? 'text-amber-500' : 'text-destructive'}`}>
          {value}/100
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${
            value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-destructive'
          }`}
        />
      </div>
    </div>
  );
}

// --- Main Analysis Result Page ---
export default function AnalysisResultPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const { theme } = useTheme();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryTab, setSummaryTab] = useState('detailed');
  const [diffTab, setDiffTab] = useState('original');
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/analysis/${id}`);
        if (res.data.success) {
          setAnalysis(res.data.analysis);
        }
      } catch (err) {
        showToast('Failed to load analysis results', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAnalysis();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!analysis || favoriting) return;
    setFavoriting(true);
    try {
      const res = await api.post(`/history/favorites/${analysis._id}`);
      if (res.data.success) {
        setAnalysis(prev => ({ ...prev, isFavorite: res.data.favorited }));
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast('Failed to toggle favorite', 'error');
    } finally {
      setFavoriting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
        <PanelSkeleton />
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="font-bold text-lg">Analysis not found</p>
        <Link to="/analyzer" className="text-primary hover:underline text-sm font-bold">
          Run a new analysis
        </Link>
      </div>
    );
  }

  const { code, language, aiResponse, isFavorite } = analysis;
  const ai = aiResponse;
  const monacoLang = language === 'csharp' ? 'csharp' : language;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/analyzer" className="p-2 border rounded-xl hover:bg-muted transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Analysis Results</h1>
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 rounded bg-muted uppercase tracking-wider text-[10px]">{language}</span>
              {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleToggleFavorite}
            disabled={favoriting}
            className={`p-2.5 border rounded-xl transition flex items-center gap-1.5 text-xs font-bold ${
              isFavorite ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-400/30 text-rose-500' : 'hover:bg-muted'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => exportToMarkdown(analysis)}
            className="px-3 py-2.5 border rounded-xl hover:bg-muted transition flex items-center gap-1.5 text-xs font-bold"
          >
            <FileText className="h-4 w-4" />
            Export MD
          </button>
          <button
            onClick={() => exportToPDF(analysis)}
            className="px-3 py-2.5 border rounded-xl hover:bg-muted transition flex items-center gap-1.5 text-xs font-bold"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* One-Line Summary Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/15 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase text-primary tracking-wider mb-1">One-Line Summary</p>
            <p className="font-bold text-base leading-relaxed">{ai.summary.oneLine}</p>
          </div>
        </div>
      </div>

      {/* Quality Score Badge Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quality Score', value: `${ai.qualityScore?.score || 0}/100`, color: 'text-primary' },
          { label: 'Time Complexity', value: ai.complexity?.time || 'N/A', color: 'text-amber-500' },
          { label: 'Space Complexity', value: ai.complexity?.space || 'N/A', color: 'text-sky-500' },
          { label: 'Algorithm', value: ai.algorithm?.name || 'Custom', color: 'text-emerald-500' },
        ].map(m => (
          <div key={m.label} className="bg-card border rounded-xl p-4 text-center shadow-sm">
            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── SECTION 1: AI Summary ── */}
      <SectionCard title="AI Explanation" icon={BookOpen}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['oneLine', 'detailed'].map(tab => (
              <TabButton key={tab} active={summaryTab === tab} onClick={() => setSummaryTab(tab)}>
                {tab === 'oneLine' ? 'One-Line' : 'Detailed'}
              </TabButton>
            ))}
          </div>
          <div className="relative">
            <CopyButton text={ai.summary[summaryTab]} className="absolute top-3 right-3 z-10" />
            <div className="bg-muted/20 rounded-xl p-4 pr-14 text-sm leading-relaxed font-medium min-h-[80px] border">
              <ReactMarkdown>{ai.summary[summaryTab] || 'N/A'}</ReactMarkdown>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION 2: Step-by-Step Execution ── */}
      <SectionCard title="Step-by-Step Execution" icon={Cpu}>
        <div className="space-y-3">
          {ai.executionSteps?.length > 0 ? (
            ai.executionSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black shrink-0 shadow-md shadow-primary/20">
                    {step.step}
                  </div>
                  {idx < ai.executionSteps.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1 min-h-[24px]" />
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <p className="text-sm font-extrabold">{step.name}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground font-semibold">No step-by-step data available.</p>
          )}
        </div>
      </SectionCard>



      {/* ── SECTION 4: Function & Variable Tables ── */}
      <SectionCard title="Function & Variable Analysis" icon={Code2}>
        <div className="space-y-6">
          {/* Functions Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Functions</h4>
            {ai.functions?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-xs min-w-[600px]">
                  <thead className="bg-muted/40">
                    <tr>
                      {['Name', 'Purpose', 'Parameters', 'Return Type', 'Time', 'Space'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-bold uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ai.functions.map((fn, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition">
                        <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">{fn.name}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs">{fn.purpose}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{fn.parameters}</td>
                        <td className="px-4 py-3 font-mono font-bold">{fn.returnType}</td>
                        <td className="px-4 py-3 font-bold text-amber-500">{fn.timeComplexity}</td>
                        <td className="px-4 py-3 font-bold text-sky-500">{fn.spaceComplexity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-semibold">No functions detected.</p>
            )}
          </div>

          {/* Variables Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Variables</h4>
            {ai.variables?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-xs min-w-[500px]">
                  <thead className="bg-muted/40">
                    <tr>
                      {['Name', 'Type', 'Scope', 'Initial Value', 'Purpose'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-bold uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ai.variables.map((v, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-500 whitespace-nowrap">{v.name}</td>
                        <td className="px-4 py-3 font-mono text-sky-500 font-bold">{v.dataType}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.scope}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{v.initialValue}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-semibold">No variables detected.</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION 5: Patterns Detected ── */}
      <SectionCard title="Patterns Detected" icon={Layers}>
        <div className="space-y-4">
          {ai.codingPatterns?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Coding Patterns</p>
              <div className="flex flex-wrap gap-2">
                {ai.codingPatterns.map((p, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/15">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ai.designPatterns?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Design Patterns</p>
              <div className="space-y-3">
                {ai.designPatterns.map((dp, idx) => (
                  <div key={idx} className="p-3 bg-muted/20 rounded-xl border text-xs space-y-1">
                    <p className="font-extrabold text-primary">{dp.name}</p>
                    <p className="text-muted-foreground font-semibold">{dp.location}</p>
                    <p className="text-muted-foreground leading-relaxed">{dp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!ai.codingPatterns?.length && !ai.designPatterns?.length && (
            <p className="text-xs text-muted-foreground font-semibold">No specific patterns detected.</p>
          )}
        </div>
      </SectionCard>

      {/* ── SECTION 6: Pseudocode ── */}
      <SectionCard title="Pseudocode" icon={FileText}>
        <div className="relative">
          <CopyButton text={ai.pseudocode} className="absolute top-3 right-3 z-10" />
          <pre className="bg-muted/20 rounded-xl p-4 pr-14 text-xs font-mono whitespace-pre-wrap leading-relaxed border overflow-x-auto">
            {ai.pseudocode || 'No pseudocode available.'}
          </pre>
        </div>
      </SectionCard>

      {/* ── SECTION 7: Algorithm Info ── */}
      <SectionCard title="Algorithm Explanation" icon={Clock}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Algorithm Name', value: ai.algorithm?.name },
            { label: 'Why Used', value: ai.algorithm?.whyUsed },
            { label: 'Complexity', value: ai.algorithm?.complexity },
            { label: 'Real-world Applications', value: ai.algorithm?.realWorldApplications },
          ].map(item => (
            <div key={item.label} className="p-4 bg-muted/20 rounded-xl border space-y-1">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{item.label}</p>
              <p className="text-sm font-semibold">{item.value || 'N/A'}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── SECTION 8: Code Quality Score ── */}
      <SectionCard title="Code Quality Analysis" icon={BarChart2}>
        <div className="space-y-4">
          <div className="text-center py-4">
            <span className={`text-5xl font-black ${
              ai.qualityScore?.score >= 75 ? 'text-emerald-500' :
              ai.qualityScore?.score >= 50 ? 'text-amber-500' : 'text-destructive'
            }`}>
              {ai.qualityScore?.score || 0}
            </span>
            <span className="text-muted-foreground font-bold text-lg">/100</span>
            <p className="text-xs text-muted-foreground font-semibold mt-1">Overall Quality Score</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <QualityBar label="Readability" value={ai.qualityScore?.readability || 0} />
            <QualityBar label="Maintainability" value={ai.qualityScore?.maintainability || 0} />
            <QualityBar label="Naming Conventions" value={ai.qualityScore?.naming || 0} />
            <QualityBar label="Complexity" value={ai.qualityScore?.complexity || 0} />
            <QualityBar label="Documentation" value={ai.qualityScore?.documentation || 0} />
            <QualityBar label="Security" value={ai.qualityScore?.security || 0} />
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION 9: Complexity Analysis ── */}
      <SectionCard title="Complexity Analysis" icon={Cpu}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Time Complexity</p>
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{ai.complexity?.time || 'N/A'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{ai.complexity?.timeReason}</p>
          </div>
          <div className="p-4 bg-sky-50 dark:bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-500" />
              <p className="text-xs font-bold uppercase text-sky-600 dark:text-sky-400">Space Complexity</p>
            </div>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400">{ai.complexity?.space || 'N/A'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{ai.complexity?.spaceReason}</p>
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION 10: Bugs & Code Smells ── */}
      <SectionCard title="Bug Detection & Code Smells" icon={Bug}>
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Detected Bugs & Issues</p>
            {ai.bugs?.length > 0 ? (
              <div className="space-y-3">
                {ai.bugs.map((bug, idx) => (
                  <div key={idx} className="p-4 bg-destructive/5 border border-destructive/15 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      <p className="text-xs font-extrabold text-destructive">{bug.type}</p>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">{bug.description}</p>
                    <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/15 rounded-lg p-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">{bug.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">No significant bugs detected</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Code Smells</p>
            {ai.codeSmells?.length > 0 ? (
              <div className="space-y-2">
                {ai.codeSmells.map((smell, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/15 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-amber-700 dark:text-amber-300">{smell.name}</p>
                      <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">{smell.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-semibold">No code smells detected.</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION 11: Security Analysis ── */}
      <SectionCard title="Security Analysis" icon={Shield}>
        {ai.securityIssues?.length > 0 ? (
          <div className="space-y-3">
            {ai.securityIssues.map((issue, idx) => {
              const severityColors = {
                critical: 'border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
                high: 'border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
                medium: 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
                low: 'border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
              };
              const clr = severityColors[(issue.severity || 'low').toLowerCase()] || severityColors.low;
              return (
                <div key={idx} className={`p-4 rounded-xl border space-y-2 ${clr}`}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 shrink-0" />
                    <p className="text-xs font-extrabold">{issue.type}</p>
                    <span className="ml-auto text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-current/10 border border-current/20">
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground/80">{issue.description}</p>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/15 rounded-lg p-2">
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">{issue.suggestion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">No security vulnerabilities detected</p>
          </div>
        )}
      </SectionCard>

      {/* ── SECTION 12: Performance Issues ── */}
      <SectionCard title="Performance Analysis" icon={Zap} defaultOpen={false}>
        <div className="space-y-4">
          {ai.performanceIssues?.length > 0 ? (
            <div className="space-y-3">
              {ai.performanceIssues.map((issue, idx) => (
                <div key={idx} className="p-4 bg-muted/20 rounded-xl border space-y-1.5">
                  <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">{issue.name}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{issue.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-semibold">No performance issues detected.</p>
          )}

          <div className="p-4 bg-muted/20 rounded-xl border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Memory Estimation</p>
            <div className="space-y-1.5 text-xs">
              <div><span className="font-bold">Consumption: </span><span className="text-muted-foreground font-semibold">{ai.memoryEstimation?.consumption || 'N/A'}</span></div>
              <div><span className="font-bold">Data Structures: </span><span className="text-muted-foreground font-semibold">{ai.memoryEstimation?.dataStructuresUsed || 'N/A'}</span></div>
              <div><span className="font-bold">Optimizations: </span><span className="text-muted-foreground font-semibold">{ai.memoryEstimation?.optimizations || 'N/A'}</span></div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION 13: Best Practices ── */}
      <SectionCard title="Best Practices & Recommendations" icon={CheckCircle2} defaultOpen={false}>
        {ai.bestPractices?.length > 0 ? (
          <ul className="space-y-2">
            {ai.bestPractices.map((practice, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs font-semibold leading-relaxed">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80">{practice}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground font-semibold">No specific recommendations available.</p>
        )}
      </SectionCard>

      {/* ── SECTION 14: Optimized Code (Side-by-Side) ── */}
      {ai.optimizedCode && (
        <SectionCard title="Optimized Code" icon={Code2} defaultOpen={false}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <TabButton active={diffTab === 'original'} onClick={() => setDiffTab('original')}>
                Original Code
              </TabButton>
              <TabButton active={diffTab === 'optimized'} onClick={() => setDiffTab('optimized')}>
                Optimized Code
              </TabButton>
            </div>

            <div className="relative border rounded-xl overflow-hidden">
              <div className="absolute top-2 right-2 z-10">
                <CopyButton text={diffTab === 'original' ? code : ai.optimizedCode} />
              </div>
              <Editor
                height="350px"
                language={monacoLang}
                value={diffTab === 'original' ? code : ai.optimizedCode}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  automaticLayout: true,
                  fontFamily: 'Fira Code, Menlo, Monaco, Consolas, monospace',
                  padding: { top: 12, bottom: 12 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            {/* Refactoring explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Why Optimized', value: ai.refactoringExplanation?.whyOptimized },
                { label: 'Performance Gains', value: ai.refactoringExplanation?.performanceImprovements },
                { label: 'Readability Gains', value: ai.refactoringExplanation?.readabilityImprovements },
              ].map(item => (
                <div key={item.label} className="p-3 bg-muted/20 rounded-xl border space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{item.label}</p>
                  <p className="text-xs text-muted-foreground font-semibold leading-relaxed">{item.value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
