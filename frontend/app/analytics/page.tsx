'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Filter,
  HeartPulse,
  LineChart,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';

export interface CallRecord {
  id: number;
  call_id: string;
  channel: 'browser' | 'sip' | string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  outcome: 'successful' | 'failed' | 'in_progress' | string;
  failure_reason: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  success_rate: number;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    total_calls: 0,
    successful_calls: 0,
    failed_calls: 0,
    success_rate: 0,
  });
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (selectedOutcome !== 'all') params.append('outcome', selectedOutcome);
      if (selectedChannel !== 'all') params.append('channel', selectedChannel);

      const res = await fetch(`/api/analytics?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        setRecentCalls(data.recent || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Live polling every 3 seconds for real-time dashboard updates
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedOutcome, selectedChannel]);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* BACKGROUND GRADIENT & GLOW */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 size-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 size-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Home</span>
            </Link>

            <div className="h-5 w-px bg-slate-800" />

            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20">
                <MessageSquare className="size-5" />
                <HeartPulse className="absolute size-3 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                    Jana Seva Analytics
                  </h1>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    Day 8 Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">Operational Call Performance & Metrics</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/escalations"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-amber-500/40 hover:text-white sm:flex"
            >
              <AlertTriangle className="size-3.5 text-amber-400" />
              <span>Human Escalations</span>
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">DB Sync:</span>
              <span className="font-semibold text-emerald-300">Live</span>
            </div>

            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`size-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* SECTION HEADER & PRIVACY BANNER */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 uppercase">
              <LineChart className="size-4" />
              <span>Voice Agent Operations</span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Call Performance Dashboard
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Real-time analytics collected from actual Jana Seva voice sessions. Performance
              metrics evaluate safe healthcare information delivery and escalation workflows.
            </p>
          </div>

          <div className="flex max-w-md items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-950/30 p-3.5 text-xs text-blue-300">
            <ShieldCheck className="size-5 shrink-0 text-blue-400" />
            <span>
              <strong>Healthcare Privacy Protection:</strong> Only operational logs are stored. No
              personal identity, medical notes, or conversation transcripts are displayed.
            </span>
          </div>
        </div>

        {/* METRIC CARDS GRID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL CALLS */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-lg shadow-black/40 backdrop-blur-sm transition-all hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Total Calls
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <PhoneCall className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight text-white">
                {summary.total_calls}
              </span>
              <span className="text-xs font-medium text-slate-400">recorded sessions</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
              <Activity className="size-3.5 text-blue-400" />
              <span>COUNT(all completed records)</span>
            </div>
          </div>

          {/* SUCCESSFUL CALLS */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-950/90 p-5 shadow-lg shadow-black/40 backdrop-blur-sm transition-all hover:border-emerald-500/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                Successful Calls
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight text-emerald-400">
                {summary.successful_calls}
              </span>
              <span className="text-xs font-medium text-emerald-500/80">task completed</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-emerald-900/40 pt-3 text-[11px] text-emerald-400/80">
              <Sparkles className="size-3.5 text-emerald-400" />
              <span>Info delivered / Human escalated</span>
            </div>
          </div>

          {/* FAILED CALLS */}
          <div className="group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-slate-950/90 p-5 shadow-lg shadow-black/40 backdrop-blur-sm transition-all hover:border-rose-500/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-rose-400 uppercase">
                Failed Calls
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                <XCircle className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight text-rose-400">
                {summary.failed_calls}
              </span>
              <span className="text-xs font-medium text-rose-500/80">incomplete / error</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-rose-900/40 pt-3 text-[11px] text-rose-400/80">
              <AlertCircle className="size-3.5 text-rose-400" />
              <span>Hangup / tool failure</span>
            </div>
          </div>

          {/* SUCCESS RATE */}
          <div className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-950/90 p-5 shadow-lg shadow-black/40 backdrop-blur-sm transition-all hover:border-amber-500/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                Success Rate
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <TrendingUp className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight text-amber-400">
                {summary.success_rate}%
              </span>
              <span className="text-xs font-medium text-amber-500/80">overall efficiency</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 space-y-1 border-t border-amber-900/40 pt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, summary.success_rate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS & TOOLBAR */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
              <Filter className="size-3.5 text-amber-400" />
              <span>Filter Outcome:</span>
            </div>
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
              {['all', 'successful', 'failed'].map((val) => (
                <button
                  key={val}
                  onClick={() => setSelectedOutcome(val)}
                  className={`rounded-md px-3 py-1 font-semibold capitalize transition-colors ${
                    selectedOutcome === val
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
              <span>Channel:</span>
            </div>
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
              {['all', 'browser', 'sip'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`rounded-md px-3 py-1 font-semibold capitalize transition-colors ${
                    selectedChannel === ch
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT CALL HISTORY TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/40 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Clock className="size-4 text-amber-400" />
                Recent Call History
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Displaying operational logs. Updated automatically.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Last synced: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-16 text-slate-400">
              <RefreshCw className="size-8 animate-spin text-amber-400" />
              <p className="text-sm font-medium">Fetching real-time call logs...</p>
            </div>
          ) : recentCalls.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center space-y-4 px-4 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80 text-slate-400">
                <PhoneCall className="size-8 text-amber-400" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-lg font-bold text-white">No calls recorded yet</h4>
                <p className="text-xs leading-relaxed text-slate-400">
                  Start a Jana Seva voice conversation to begin collecting analytics data in
                  real-time.
                </p>
              </div>
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-500"
              >
                <Sparkles className="size-4" />
                <span>Start Jana Seva Voice Session</span>
              </Link>
            </div>
          ) : (
            /* TABLE DISPLAY */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Call ID</th>
                    <th className="px-6 py-3.5">Time Started</th>
                    <th className="px-6 py-3.5">Channel</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Outcome</th>
                    <th className="px-6 py-3.5">Failure Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentCalls.map((call) => (
                    <tr
                      key={call.id || call.call_id}
                      className="group transition-colors hover:bg-slate-800/40"
                    >
                      {/* CALL ID */}
                      <td className="px-6 py-4 font-mono font-medium text-slate-200">
                        {call.call_id}
                      </td>

                      {/* TIME STARTED */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {formatTime(call.started_at)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatDate(call.started_at)}
                        </div>
                      </td>

                      {/* CHANNEL */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase ${
                            call.channel === 'sip'
                              ? 'border border-purple-800/50 bg-purple-950/60 text-purple-300'
                              : 'border border-blue-800/50 bg-blue-950/60 text-blue-300'
                          }`}
                        >
                          {call.channel || 'browser'}
                        </span>
                      </td>

                      {/* DURATION */}
                      <td className="px-6 py-4 font-mono font-semibold text-slate-300">
                        {formatDuration(call.duration_seconds)}
                      </td>

                      {/* OUTCOME */}
                      <td className="px-6 py-4">
                        {call.outcome === 'successful' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="size-3.5" />
                            <span>Successful</span>
                          </span>
                        ) : call.outcome === 'failed' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/40 px-2.5 py-1 text-xs font-bold text-rose-400">
                            <XCircle className="size-3.5" />
                            <span>Failed</span>
                          </span>
                        ) : (
                          <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-400">
                            <Activity className="size-3.5" />
                            <span>In Progress</span>
                          </span>
                        )}
                      </td>

                      {/* FAILURE REASON */}
                      <td className="px-6 py-4 text-slate-400">
                        {call.outcome === 'failed' ? (
                          <span className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-rose-300">
                            {call.failure_reason || 'Incomplete Task'}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
