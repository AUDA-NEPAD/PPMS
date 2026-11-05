import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DIRECTORATES,
  AFRICAN_REGIONS,
  AFRICAN_COUNTRIES,
  STRATEGIC_RESULT_AREAS,
  STRATEGIC_DELIVERY_PATHWAYS,
  PARTNERS_DATABASE
} from '../../data/mockData';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { StageProgressTracker } from '../common/StageProgressTracker';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import {
  calculateInitiativeLifecycleAge,
  getRAGConfig,
  GATE_SLAS
} from '../../utils/lifecycleAgeCalculations';
import {
  Layers,
  FileText,
  Clock,
  RotateCcw,
  Compass,
  ClipboardCheck,
  Award,
  CheckCircle2,
  FileSignature,
  PauseCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Building,
  Globe,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    initiatives,
    currentUser,
    tasks,
    auditLogs,
    dashboardFilters,
    setDashboardFilters,
    resetFilters,
    setSelectedInitiativeId,
    setSelectedProjectDevelopmentId,
    setSelectedAppraisalId,
    setSelectedCeoApprovalId,
    setSelectedContractingId,
    setSelectedAmendmentInitiativeId,
    setCurrentPage
  } = useApp();

  const [timelinessFilter, setTimelinessFilter] = React.useState<string>('all');

  // Apply dashboard filters
  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((item) => {
      if (
        dashboardFilters.search &&
        !item.title.toLowerCase().includes(dashboardFilters.search.toLowerCase()) &&
        !item.code.toLowerCase().includes(dashboardFilters.search.toLowerCase()) &&
        !item.problemStatement.toLowerCase().includes(dashboardFilters.search.toLowerCase()) &&
        !item.directorate.toLowerCase().includes(dashboardFilters.search.toLowerCase())
      ) {
        return false;
      }
      if (dashboardFilters.directorate && item.directorate !== dashboardFilters.directorate) {
        return false;
      }
      if (dashboardFilters.region && !item.regions.includes(dashboardFilters.region as any)) {
        return false;
      }
      if (dashboardFilters.country && !item.countries.includes(dashboardFilters.country)) {
        return false;
      }
      if (dashboardFilters.sra && !item.sras?.includes(dashboardFilters.sra as any)) {
        return false;
      }
      if (dashboardFilters.sdp && !item.sdps?.includes(dashboardFilters.sdp as any)) {
        return false;
      }
      if (dashboardFilters.status && item.status !== dashboardFilters.status) {
        return false;
      }
      if (dashboardFilters.stage && !item.stage.includes(dashboardFilters.stage)) {
        return false;
      }
      if (
        dashboardFilters.partner &&
        !item.possibleFundingPartners?.some((p) =>
          p.toLowerCase().includes(dashboardFilters.partner.toLowerCase())
        )
      ) {
        return false;
      }
      if (
        dashboardFilters.owner &&
        item.ownerName.toLowerCase() !== dashboardFilters.owner.toLowerCase()
      ) {
        return false;
      }

      // Timeliness RAG filter
      if (timelinessFilter !== 'all') {
        const age = calculateInitiativeLifecycleAge(item);
        if (timelinessFilter === 'ahead' && age.currentGateRagStatus !== 'ahead') {
          return false;
        }
        if (timelinessFilter === 'on_track' && age.currentGateRagStatus !== 'on_track' && age.currentGateRagStatus !== 'ahead') {
          return false;
        }
        if (timelinessFilter === 'at_risk' && age.currentGateRagStatus !== 'at_risk') {
          return false;
        }
        if (timelinessFilter === 'delayed' && age.currentGateRagStatus !== 'delayed') {
          return false;
        }
      }

      return true;
    });
  }, [initiatives, dashboardFilters, timelinessFilter]);

  // Process Timeliness & RAG metrics across all initiatives
  const timelinessMetrics = useMemo(() => {
    let aheadCount = 0;
    let onTrackCount = 0;
    let atRiskCount = 0;
    let delayedCount = 0;
    let totalDays = 0;

    initiatives.forEach((init) => {
      const age = calculateInitiativeLifecycleAge(init);
      totalDays += age.totalDaysElapsed;
      if (age.currentGateRagStatus === 'ahead') aheadCount++;
      else if (age.currentGateRagStatus === 'on_track') onTrackCount++;
      else if (age.currentGateRagStatus === 'at_risk') atRiskCount++;
      else if (age.currentGateRagStatus === 'delayed') delayedCount++;
    });

    const avgDays = initiatives.length > 0 ? Math.round(totalDays / initiatives.length) : 0;

    return {
      aheadCount,
      onTrackCount,
      onTimeTotal: aheadCount + onTrackCount,
      atRiskCount,
      delayedCount,
      avgDays
    };
  }, [initiatives]);

  // Specific KPI counts requested in Section 5
  const totalInitiatives = filteredInitiatives.length;
  const conceptsInDev = filteredInitiatives.filter((i) => i.stageCode === 0).length;
  const conceptsAwaitingBoard = filteredInitiatives.filter(
    (i) => i.stageCode === 1 && i.status === 'Submitted to Board'
  ).length;
  const conceptsReturned = filteredInitiatives.filter(
    (i) => i.status.includes('Returned') || i.status.includes('Deferred')
  ).length;
  const projectsUnderDev = filteredInitiatives.filter((i) => i.stageCode === 2).length;
  const projectsAwaitingAppraisal = filteredInitiatives.filter(
    (i) => i.stageCode === 3
  ).length;
  const projectsAwaitingCEO = filteredInitiatives.filter(
    (i) => i.stageCode === 4 && i.status === 'Awaiting CEO Decision'
  ).length;
  const approvedProjects = filteredInitiatives.filter(
    (i) =>
      i.status === 'Approved' ||
      i.status === 'Conditionally Approved' ||
      i.status === 'Under Contracting' ||
      i.status === 'Financing Finalized' ||
      i.status === 'Active / Implementation'
  ).length;
  const projectsInContracting = filteredInitiatives.filter((i) => i.stageCode === 5).length;
  const projectsOnHold = filteredInitiatives.filter((i) => i.status === 'On Hold').length;
  const rejectedOrAborted = filteredInitiatives.filter(
    (i) => i.status === 'Rejected' || i.status === 'Aborted'
  ).length;

  // Projects requiring action by current user's role
  const userRoleTasks = tasks.filter(
    (t) => t.assignedToRole === currentUser.role && t.status !== 'Completed'
  );

  // Budget calculations
  const totalEstimatedBudget = filteredInitiatives.reduce(
    (acc, curr) => acc + (curr.estimatedCost || 0),
    0
  );

  const totalApprovedBudget = filteredInitiatives
    .filter(
      (i) =>
        i.status === 'Approved' ||
        i.status === 'Under Contracting' ||
        i.status === 'Financing Finalized'
    )
    .reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

  // Distribution breakdowns for charts
  const stageDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const budgetByStage = [0, 0, 0, 0, 0, 0, 0];
    filteredInitiatives.forEach((i) => {
      if (i.stageCode >= 0 && i.stageCode <= 6) {
        counts[i.stageCode]++;
        budgetByStage[i.stageCode] += i.estimatedCost || 0;
      }
    });
    return { counts, budgetByStage };
  }, [filteredInitiatives]);

  const directorateDistribution = useMemo(() => {
    const map = new Map<string, number>();
    DIRECTORATES.forEach((d) => map.set(d, 0));
    filteredInitiatives.forEach((i) => {
      map.set(i.directorate, (map.get(i.directorate) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [filteredInitiatives]);

  const sraDistribution = useMemo(() => {
    const map = new Map<string, number>();
    STRATEGIC_RESULT_AREAS.forEach((sra) => map.set(sra, 0));
    filteredInitiatives.forEach((i) => {
      i.sras?.forEach((sra) => {
        map.set(sra, (map.get(sra) || 0) + 1);
      });
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [filteredInitiatives]);

  const regionDistribution = useMemo(() => {
    const map = new Map<string, number>();
    AFRICAN_REGIONS.forEach((r) => map.set(r, 0));
    filteredInitiatives.forEach((i) => {
      if (i.isContinental) {
        map.set('Continental', (map.get('Continental') || 0) + 1);
      }
      i.regions.forEach((r) => {
        map.set(r, (map.get(r) || 0) + 1);
      });
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [filteredInitiatives]);

  const activeFilterCount = Object.entries(dashboardFilters).filter(
    ([key, value]) => key !== 'search' && value !== ''
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Title & Strategic Executive Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Continental Pipeline Executive Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live State
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time lifecycle tracking of AUDA-NEPAD initiatives across development, appraisal, CEO sanction, and financing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Pipeline Volume
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {formatCurrency(totalEstimatedBudget, 'USD')}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Total Sanctioned / Approved
            </span>
            <span className="text-sm font-extrabold text-emerald-800">
              {formatCurrency(totalApprovedBudget, 'USD')}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage('Risk Matrix')}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Aggregated Portfolio Risk Matrix & Heat Map"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Risk Matrix</span>
          </button>

          <button
            onClick={() => setCurrentPage('Reports')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open comprehensive Reports & Analytics Hub"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reports & Analytics</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Role Action Alert Banner (if user has actionable tasks) */}
      {userRoleTasks.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                Action Required by {currentUser.role}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                You have <strong>{userRoleTasks.length}</strong> urgent initiative(s) pending your formal review, appraisal, or decree.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('My Assignments')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Review Assignments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Toolbar (Section 5 Requirement) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Dimensional Portfolio Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                {activeFilterCount} active
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Directorate */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Directorate
            </label>
            <select
              value={dashboardFilters.directorate}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, directorate: e.target.value }))
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All 7 Directorates</option>
              {DIRECTORATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              African Region
            </label>
            <select
              value={dashboardFilters.region}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, region: e.target.value }))
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Regions & Continental</option>
              {AFRICAN_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Strategic Result Area */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Strategic Result Area (SRA)
            </label>
            <select
              value={dashboardFilters.sra}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, sra: e.target.value }))
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Strategic Result Areas</option>
              {STRATEGIC_RESULT_AREAS.map((sra) => (
                <option key={sra} value={sra}>
                  {sra.split('–')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Lifecycle Stage & Status
            </label>
            <select
              value={dashboardFilters.status}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft (Stage 0)</option>
              <option value="Submitted to Board">Submitted to Board (Stage 1)</option>
              <option value="Returned for Clarification">Returned for Clarification</option>
              <option value="Under Development">Under Development (Stage 2)</option>
              <option value="Submitted for Appraisal">Submitted for Appraisal (Stage 3)</option>
              <option value="Awaiting CEO Decision">Awaiting CEO Decision (Stage 4)</option>
              <option value="Approved">Approved</option>
              <option value="Under Contracting">Under Contracting (Stage 5)</option>
              <option value="Financing Finalized">Financing Finalized</option>
              <option value="On Hold">On Hold</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          {/* Funding Partner */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Funding Partner
            </label>
            <select
              value={dashboardFilters.partner}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, partner: e.target.value }))
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Funding Partners</option>
              {PARTNERS_DATABASE.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name.split('(')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Member State Country
            </label>
            <select
              value={dashboardFilters.country}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, country: e.target.value }))
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All African Countries</option>
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Strategic Delivery Pathway */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Strategic Delivery Pathway (SDP)
            </label>
            <select
              value={dashboardFilters.sdp}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, sdp: e.target.value }))
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Delivery Pathways</option>
              {STRATEGIC_DELIVERY_PATHWAYS.map((sdp) => (
                <option key={sdp} value={sdp}>
                  {sdp.split('–')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Timeliness RAG Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Process SLA & RAG Timeliness
            </label>
            <select
              value={timelinessFilter}
              onChange={(e) => setTimelinessFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
            >
              <option value="all">All Timelines ({initiatives.length})</option>
              <option value="on_track">🟢 Ahead / On Time ({timelinessMetrics.onTimeTotal})</option>
              <option value="at_risk">🟡 At Risk (Nearing Target) ({timelinessMetrics.atRiskCount})</option>
              <option value="delayed">🔴 Delayed / Overdue ({timelinessMetrics.delayedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY KPI CARDS (All 12 metrics required by Section 5) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Lifecycle Governance Summary Cards
          </span>
          <span className="text-xs text-slate-500">
            Showing <strong>{filteredInitiatives.length}</strong> of {initiatives.length} initiatives
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Card 1: Total Initiatives */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Total Initiatives</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalInitiatives}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across all 7 stages</div>
          </div>

          {/* Card 2: Concepts in Development */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Concepts in Dev</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {conceptsInDev}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Stage 0 Drafts</div>
          </div>

          {/* Card 3: Concepts Awaiting Board */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Awaiting Board</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {conceptsAwaitingBoard}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Stage 1 Evaluation</div>
          </div>

          {/* Card 4: Returned for Clarification */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Returned / Clarify</span>
              <RotateCcw className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {conceptsReturned}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Needs revisions</div>
          </div>

          {/* Card 5: Projects Under Development */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-300 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Under Project Dev</span>
              <Compass className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {projectsUnderDev}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Stage 2 TOC & Budget</div>
          </div>

          {/* Card 6: Awaiting Appraisal */}
          <div
            onClick={() => setCurrentPage('Project Appraisal')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-500 hover:bg-purple-50/20 cursor-pointer transition-all"
            title="Open Stage 3 Project Appraisal Workspace"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-purple-900">Awaiting Appraisal</span>
              <ClipboardCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {projectsAwaitingAppraisal}
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5 font-medium flex items-center gap-0.5">
              <span>Stage 3 Board scoring</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 7: Awaiting CEO Decision */}
          <div
            onClick={() => setCurrentPage('CEO Approval')}
            className="bg-white p-3.5 rounded-xl border-2 border-orange-300 shadow-2xs hover:border-orange-500 hover:bg-orange-50/40 cursor-pointer transition-all bg-orange-50/20"
            title="Open Stage 4 CEO Executive Approval Workspace"
          >
            <div className="flex items-center justify-between text-orange-800">
              <span className="text-[11px] font-bold">Awaiting CEO</span>
              <Award className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-950 mt-1">
              {projectsAwaitingCEO}
            </div>
            <div className="text-[10px] text-orange-800 mt-0.5 font-bold flex items-center gap-0.5">
              <span>Stage 4 Approval Gate</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 8: Approved Projects */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Approved Projects</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {approvedProjects}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">CEO Sanctioned</div>
          </div>

          {/* Card 9: Projects Under Contracting */}
          <div
            onClick={() => setCurrentPage('Contracting')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-cyan-500 hover:bg-cyan-50/30 cursor-pointer transition-all"
            title="Open Stage 5 Contracting Workspace"
          >
            <div className="flex items-center justify-between text-cyan-700">
              <span className="text-[11px] font-bold">Under Contracting</span>
              <FileSignature className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {projectsInContracting}
            </div>
            <div className="text-[10px] text-cyan-700 font-semibold mt-0.5 flex items-center gap-0.5">
              <span>Stage 5 MoUs & Tranches</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 10: Projects on Hold / Change Control */}
          <div
            onClick={() => setCurrentPage('Amendments')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-400 hover:bg-rose-50/20 cursor-pointer transition-all"
            title="Open Stage 6 Amendments & Change Control Workspace"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Change Control / Hold</span>
              <PauseCircle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {projectsOnHold}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-0.5">
              <span>Stage 6 Amendments</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 11: Rejected / Aborted */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-300 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Rejected / Aborted</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {rejectedOrAborted}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Non-compliant</div>
          </div>

          {/* Card 12: Action by Current User */}
          <div className="bg-emerald-700 text-white p-3.5 rounded-xl shadow-sm border border-emerald-600">
            <div className="flex items-center justify-between text-emerald-200">
              <span className="text-[11px] font-bold">My Pending Action</span>
              <UserCheck className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="text-2xl font-black mt-1">
              {userRoleTasks.length}
            </div>
            <div className="text-[10px] text-emerald-200 mt-0.5 font-medium truncate">
              For {currentUser.role.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* LIFECYCLE TIMELINESS & GATE SLA HEALTH BANNER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Process Turnaround Timeliness & Gate SLA Health
              </h3>
              <p className="text-[11px] text-slate-500">
                Institutional benchmarks vs days elapsed in current governance gate and overall proposal lifecycle age.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Avg Portfolio Proposal Age:</span>
            <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {timelinessMetrics.avgDays} Days
            </span>
          </div>
        </div>

        {/* 4 Interactive RAG Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Total Initiatives Tracked */}
          <button
            type="button"
            onClick={() => setTimelinessFilter('all')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              timelinessFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="text-[10px] font-bold uppercase opacity-75">All Initiatives</div>
            <div className="text-lg font-black font-mono mt-0.5">{initiatives.length}</div>
            <div className="text-[10px] opacity-75 mt-0.5">Monitored proposals</div>
          </button>

          {/* Ahead & On Track (Green) */}
          <button
            type="button"
            onClick={() => setTimelinessFilter(timelinessFilter === 'on_track' ? 'all' : 'on_track')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              timelinessFilter === 'on_track'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-500/30'
                : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold uppercase">
              <span>On Time / Ahead</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-lg font-black font-mono mt-0.5">{timelinessMetrics.onTimeTotal}</div>
            <div className="text-[10px] opacity-80 mt-0.5">&le; 80% SLA elapsed</div>
          </button>

          {/* At Risk (Amber) */}
          <button
            type="button"
            onClick={() => setTimelinessFilter(timelinessFilter === 'at_risk' ? 'all' : 'at_risk')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              timelinessFilter === 'at_risk'
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-500/30'
                : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold uppercase">
              <span>At Risk</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-lg font-black font-mono mt-0.5">{timelinessMetrics.atRiskCount}</div>
            <div className="text-[10px] opacity-80 mt-0.5">80% - 100% SLA target</div>
          </button>

          {/* Delayed / Overdue (Red) */}
          <button
            type="button"
            onClick={() => setTimelinessFilter(timelinessFilter === 'delayed' ? 'all' : 'delayed')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              timelinessFilter === 'delayed'
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-500/30'
                : 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold uppercase">
              <span>Delayed (Overdue)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="text-lg font-black font-mono mt-0.5">{timelinessMetrics.delayedCount}</div>
            <div className="text-[10px] opacity-80 mt-0.5">&gt; 100% Gate SLA target</div>
          </button>
        </div>
      </div>

      {/* PIPELINE DATA TABLE: ACTIVE INITIATIVE PIPELINE REGISTER (Under Lifecycle Governance Summary Cards) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Active Initiative Pipeline Register
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {filteredInitiatives.length} Active Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Portfolio register of initiatives in lifecycle progression. Click any record to inspect complete results framework, budget rollups, appraisals, and audit history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('Project Pipeline')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
            >
              <span>Full Pipeline Module</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Code & Title</th>
                <th className="p-3.5">Directorate</th>
                <th className="p-3.5">Lifecycle Stage</th>
                <th className="p-3.5 min-w-[170px]">Process Age & Gate SLA (RAG)</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Budget (USD)</th>
                <th className="p-3.5">Region</th>
                <th className="p-3.5">Owner</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInitiatives.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                      No initiatives match your filter criteria
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInitiatives.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedInitiativeId(item.id)}
                    className="hover:bg-emerald-50/30 cursor-pointer transition-colors"
                  >
                    {/* Code & Title */}
                    <td className="p-3.5 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {item.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-50 text-slate-500 border border-slate-200">
                          {item.classification}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 mt-1 line-clamp-1">
                        {item.title}
                      </div>
                    </td>

                    {/* Directorate */}
                    <td className="p-3.5 text-slate-700 max-w-[180px] truncate">
                      {item.directorate}
                    </td>

                    {/* Lifecycle Stage */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">
                        Stage {item.stageCode}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.stage.split(':')[1]?.trim() || item.stage}
                      </div>
                    </td>

                    {/* Process Age & Gate SLA (RAG) */}
                    <td className="p-3.5">
                      <LifecycleAgeBadge initiative={item} compact />
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Budget */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.estimatedCost, item.currency)}
                    </td>

                    {/* Region */}
                    <td className="p-3.5 text-slate-600">
                      {item.isContinental ? 'Continental' : item.regions[0] || 'N/A'}
                    </td>

                    {/* Owner */}
                    <td className="p-3.5 text-slate-700">
                      {item.ownerName.split(' ')[0]}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInitiativeId(item.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                        >
                          Inspect
                        </button>
                        {item.stageCode === 2 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProjectDevelopmentId(item.id);
                              setCurrentPage('Project Development');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                          >
                            Develop
                          </button>
                        )}
                        {item.stageCode === 1 && item.status === 'Submitted to Board' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPage('Program Board Evaluation');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors"
                          >
                            Evaluate
                          </button>
                        )}
                        {item.stageCode === 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppraisalId(item.id);
                              setCurrentPage('Project Appraisal');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] transition-colors"
                          >
                            Appraise
                          </button>
                        )}
                        {item.stageCode === 4 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCeoApprovalId(item.id);
                              setCurrentPage('CEO Approval');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-[11px] transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {(item.stageCode === 5 || item.status === 'Under Contracting' || item.status === 'Financing Finalized') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContractingId(item.id);
                              setCurrentPage('Contracting');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-[11px] transition-colors"
                          >
                            Contract
                          </button>
                        )}
                        {(item.stageCode === 6 || (item.amendments && item.amendments.length > 0)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAmendmentInitiativeId(item.id);
                              setCurrentPage('Amendments');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition-colors"
                          >
                            Amend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISUALIZATIONS SECTION (Section 5 Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viz 1: Projects by Lifecycle Stage (Progress breakdown) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Initiative Distribution by Stage
              </h3>
              <p className="text-xs text-slate-800 font-semibold mt-0.5">
                Pipeline Funnel Stages 0 to 6
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-2.5">
            {[
              { code: 0, label: 'Stage 0: Concept Dev' },
              { code: 1, label: 'Stage 1: Concept Eval' },
              { code: 2, label: 'Stage 2: Project Dev' },
              { code: 3, label: 'Stage 3: Appraisal' },
              { code: 4, label: 'Stage 4: CEO Approval' },
              { code: 5, label: 'Stage 5: Contracting' },
              { code: 6, label: 'Stage 6: Amendments' }
            ].map((st) => {
              const count = stageDistribution.counts[st.code];
              const budget = stageDistribution.budgetByStage[st.code];
              const percent = totalInitiatives > 0 ? (count / totalInitiatives) * 100 : 0;

              return (
                <div key={st.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{st.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatCurrency(budget, 'USD')}
                      </span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                        {count}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        st.code === 4
                          ? 'bg-orange-500'
                          : st.code >= 5
                          ? 'bg-emerald-600'
                          : 'bg-sky-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Viz 2: Projects by Strategic Result Area (SRA) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Strategic Alignment
              </h3>
              <p className="text-xs text-slate-800 font-semibold mt-0.5">
                By Strategic Result Area (SRA)
              </p>
            </div>
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-3">
            {sraDistribution.map((item, idx) => {
              const maxCount = Math.max(...sraDistribution.map((s) => s.count), 1);
              const percent = (item.count / maxCount) * 100;
              const shortName = item.name.split('–')[0];
              const desc = item.name.split('–')[1] || '';

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800">{shortName}</span>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {desc}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] flex-shrink-0">
                      {item.count} projects
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Viz 3: Regional Distribution & Directorate Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Geographic Footprint
              </h3>
              <p className="text-xs text-slate-800 font-semibold mt-0.5">
                Pan-African Implementation
              </p>
            </div>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-2.5">
            {regionDistribution.map((r, idx) => {
              const maxCount = Math.max(...regionDistribution.map((x) => x.count), 1);
              const percent = (r.count / maxCount) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{r.name}</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                      {r.count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Top Directorates Active
            </span>
            <div className="flex flex-wrap gap-1.5">
              {directorateDistribution
                .filter((d) => d.count > 0)
                .map((d, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                  >
                    {d.name.split(',')[0]}: <strong>{d.count}</strong>
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONABLE PANELS: Overdue/Deadlines & Recent Board Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Upcoming Governance Deadlines & Required Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Critical Governance Milestones & Deadlines
              </h3>
            </div>
            <span className="text-xs text-slate-400">Next 14 Days</span>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedInitiativeId(task.initiativeId)}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        task.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Due: {task.dueDate}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 truncate">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Initiative: {task.initiativeTitle}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 block mb-1">
                    {task.assignedToRole.split(' ')[0]}
                  </span>
                  <button className="text-[11px] text-emerald-600 font-bold hover:underline">
                    Inspect &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Recent Workflow Transitions & Decisions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Recent Board Decisions & Stage Transitions
              </h3>
            </div>
            <button
              onClick={() => setCurrentPage('Audit Trail')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Full Audit Log &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedInitiativeId(log.entityId)}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
                <div className="text-slate-700 font-medium truncate">
                  Initiative: {log.entityTitle}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>
                    By: <strong>{log.user}</strong> ({log.userRole})
                  </span>
                  <span className="text-emerald-600 font-semibold">View dossier</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
