'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  PhoneCall,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';

export interface EscalationRecord {
  id: number;
  reference_id: str;
  reason: str;
  urgency: 'emergency' | 'high' | 'medium' | 'low' | string;
  user_name: string;
  summary: string;
  agent_checked: string;
  language: string;
  preferred_followup: string;
  permission_confirmed: boolean;
  status: 'open' | 'in_progress' | 'resolved' | string;
  created_at: string;
  updated_at: string;
}

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<EscalationRecord | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

  const fetchEscalations = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (selectedUrgency !== 'all') params.append('urgency', selectedUrgency);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/escalations?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEscalations(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching escalations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
    // Auto-poll every 5 seconds for live voice session escalations
    const interval = setInterval(() => {
      fetchEscalations();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedUrgency, selectedStatus, searchQuery]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/escalations/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchEscalations();
      }
    } catch (err) {
      console.error('Error seeding escalations:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleStatusChange = async (refId: string, newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/escalations/${refId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveItem(data.data);
        fetchEscalations();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: escalations.length,
      emergency: escalations.filter((e) => e.urgency.toLowerCase() === 'emergency').length,
      high: escalations.filter((e) => e.urgency.toLowerCase() === 'high').length,
      open: escalations.filter((e) => e.status.toLowerCase() === 'open').length,
      inProgress: escalations.filter((e) => e.status.toLowerCase() === 'in_progress').length,
      resolved: escalations.filter((e) => e.status.toLowerCase() === 'resolved').length,
    };
  }, [escalations]);

  const getUrgencyBadge = (urgency: string) => {
    const u = urgency.toLowerCase();
    if (u === 'emergency') {
      return (
        <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-red-800/80 bg-red-950/80 px-3 py-1 text-xs font-semibold text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <Flame className="h-3.5 w-3.5 text-red-400" />
          EMERGENCY
        </span>
      );
    }
    if (u === 'high') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800/80 bg-amber-950/80 px-3 py-1 text-xs font-semibold text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          HIGH
        </span>
      );
    }
    if (u === 'medium') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-800/80 bg-blue-950/80 px-3 py-1 text-xs font-semibold text-blue-400">
          <Activity className="h-3.5 w-3.5 text-blue-400" />
          MEDIUM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-400">
        LOW
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'open') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
          <Clock className="h-3 w-3" /> Open
        </span>
      );
    }
    if (s === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-400">
          <Activity className="h-3 w-3" /> In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> Resolved
      </span>
    );
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              title="Return to Voice App"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-lg shadow-cyan-500/20">
                <ShieldCheck className="h-5 w-5 stroke-[2.5] text-slate-950" />
              </div>
              <div>
                <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
                  JANA SEVA
                  <span className="rounded border border-cyan-800/60 bg-cyan-950 px-2 py-0.5 font-mono text-xs text-cyan-400">
                    Day 7 Escalations
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Human Support Command Center</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchEscalations(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`}
              />
              Refresh
            </button>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/10 transition-all hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {seeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Analytics & Counter Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
            <span className="text-xs font-medium tracking-wider text-slate-400 uppercase">
              Total Requests
            </span>
            <div className="mt-1 text-2xl font-bold text-white">{stats.total}</div>
          </div>

          <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 backdrop-blur-sm">
            <span className="flex items-center gap-1 text-xs font-medium tracking-wider text-red-400 uppercase">
              <Flame className="h-3 w-3" /> Emergency
            </span>
            <div className="mt-1 text-2xl font-bold text-red-400">{stats.emergency}</div>
          </div>

          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 backdrop-blur-sm">
            <span className="flex items-center gap-1 text-xs font-medium tracking-wider text-amber-400 uppercase">
              <AlertTriangle className="h-3 w-3" /> High Urgency
            </span>
            <div className="mt-1 text-2xl font-bold text-amber-400">{stats.high}</div>
          </div>

          <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 backdrop-blur-sm">
            <span className="flex items-center gap-1 text-xs font-medium tracking-wider text-blue-400 uppercase">
              <Clock className="h-3 w-3" /> Open
            </span>
            <div className="mt-1 text-2xl font-bold text-blue-400">{stats.open}</div>
          </div>

          <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-4 backdrop-blur-sm">
            <span className="flex items-center gap-1 text-xs font-medium tracking-wider text-purple-400 uppercase">
              <Activity className="h-3 w-3" /> In Progress
            </span>
            <div className="mt-1 text-2xl font-bold text-purple-400">{stats.inProgress}</div>
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 backdrop-blur-sm">
            <span className="flex items-center gap-1 text-xs font-medium tracking-wider text-emerald-400 uppercase">
              <CheckCircle2 className="h-3 w-3" /> Resolved
            </span>
            <div className="mt-1 text-2xl font-bold text-emerald-400">{stats.resolved}</div>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Filter className="h-3.5 w-3.5" /> Urgency:
            </div>
            {['all', 'emergency', 'high', 'medium', 'low'].map((urg) => (
              <button
                key={urg}
                onClick={() => setSelectedUrgency(urg)}
                className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  selectedUrgency === urg
                    ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {urg}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              Status:
            </div>
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  selectedStatus === st
                    ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}

            <div className="relative flex-1 md:w-64">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search reference, name, summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 pr-3 pl-9 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Escalation Grid / List */}
        {loading ? (
          <div className="space-y-3 py-20 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
            <p className="text-sm text-slate-400">Loading escalation records...</p>
          </div>
        ) : escalations.length === 0 ? (
          <div className="space-y-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-300">No Escalations Found</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                No human help requests match your active filters. Click "Seed Demo Data" to load
                realistic test cases.
              </p>
            </div>
            <button
              onClick={handleSeed}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-500"
            >
              <Sparkles className="h-4 w-4" /> Load Seed Records
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {escalations.map((item) => {
              const isEmergency = item.urgency.toLowerCase() === 'emergency';
              return (
                <div
                  key={item.reference_id}
                  onClick={() => setActiveItem(item)}
                  className={`group relative flex cursor-pointer flex-col justify-between space-y-4 rounded-2xl border p-5 transition-all ${
                    isEmergency
                      ? 'border-red-900/60 bg-gradient-to-b from-red-950/30 to-slate-900/60 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:border-red-500/80'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-cyan-400 group-hover:text-cyan-300">
                        {item.reference_id}
                      </span>
                      {getUrgencyBadge(item.urgency)}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white transition-colors group-hover:text-cyan-200">
                        {item.reason}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        <span className="font-medium text-slate-300">{item.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PhoneCall className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {item.preferred_followup} ({item.language})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {getStatusBadge(item.status)}
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 transition-colors group-hover:text-cyan-400">
                        View Details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Escalation Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-extrabold text-cyan-400">
                    {activeItem.reference_id}
                  </span>
                  {getUrgencyBadge(activeItem.urgency)}
                </div>
                <p className="text-xs text-slate-400">
                  Created {formatDate(activeItem.created_at)}
                </p>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="rounded-lg bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
              {/* Request Overview Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:grid-cols-4">
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    Caller Name
                  </span>
                  <p className="mt-0.5 text-sm font-medium text-white">{activeItem.user_name}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    Language
                  </span>
                  <p className="mt-0.5 text-sm font-medium text-white">{activeItem.language}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    Follow-up
                  </span>
                  <p className="mt-0.5 text-sm font-medium text-white">
                    {activeItem.preferred_followup}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    Permission
                  </span>
                  <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Granted
                  </p>
                </div>
              </div>

              {/* Reason Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Reason for Escalation
                </h4>
                <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-sm font-semibold text-cyan-200">
                  {activeItem.reason}
                </div>
              </div>

              {/* Summary Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Structured Human Summary
                </h4>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 font-sans text-sm leading-relaxed text-slate-200">
                  {activeItem.summary}
                </div>
              </div>

              {/* Agent Checked Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  What Agent Already Checked
                </h4>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-300">
                  {activeItem.agent_checked}
                </div>
              </div>

              {/* Status Change Control */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Change Case Status
                  </span>
                  {getStatusBadge(activeItem.status)}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    disabled={statusUpdating || activeItem.status.toLowerCase() === 'open'}
                    onClick={() => handleStatusChange(activeItem.reference_id, 'open')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      activeItem.status.toLowerCase() === 'open'
                        ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Open
                  </button>

                  <button
                    disabled={statusUpdating || activeItem.status.toLowerCase() === 'in_progress'}
                    onClick={() => handleStatusChange(activeItem.reference_id, 'in_progress')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      activeItem.status.toLowerCase() === 'in_progress'
                        ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    In Progress
                  </button>

                  <button
                    disabled={statusUpdating || activeItem.status.toLowerCase() === 'resolved'}
                    onClick={() => handleStatusChange(activeItem.reference_id, 'resolved')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      activeItem.status.toLowerCase() === 'resolved'
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
