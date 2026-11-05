import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Initiative,
  Directorate,
  AfricanRegion,
  StrategicResultArea,
  StrategicDeliveryPathway,
  StageCode
} from '../../types';
import {
  DIRECTORATES,
  AFRICAN_REGIONS,
  AFRICAN_COUNTRIES,
  STRATEGIC_RESULT_AREAS,
  STRATEGIC_DELIVERY_PATHWAYS,
  PARTNERS_DATABASE
} from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  calculateInitiativeLifecycleAge,
  getRAGConfig,
  GATE_SLAS
} from '../../utils/lifecycleAgeCalculations';
import { StatusBadge } from '../common/StatusBadge';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import { ExecutiveBriefingModal } from './ExecutiveBriefingModal';
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Award,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Download,
  Sparkles,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  Building,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Handshake,
  BarChart3,
  Calendar,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

interface AlternativeExecutiveDashboardProps {
  onOpenInitiative?: (id: string) => void;
  isStandalonePage?: boolean;
}

export const AlternativeExecutiveDashboard: React.FC<AlternativeExecutiveDashboardProps> = ({
  onOpenInitiative,
  isStandalonePage = false
}) => {
  const {
    initiatives,
    currentUser,
    setSelectedInitiativeId,
    setCurrentPage
  } = useApp();

  // Currency selection state
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'ZAR' | 'GBP'>('USD');
  const currencyRate = useMemo(() => {
    switch (currency) {
      case 'EUR': return 0.92;
      case 'GBP': return 0.78;
      case 'ZAR': return 18.2;
      default: return 1.0;
    }
  }, [currency]);

  // View state & expansion
  const [isExpanded, setIsExpanded] = useState(false);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [briefingTemplate, setBriefingTemplate] = useState<'annual' | 'board' | 'financing' | 'amendments'>('annual');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSra, setSelectedSra] = useState<string>('all');
  const [selectedSdp, setSelectedSdp] = useState<string>('all');
  const [selectedTimeliness, setSelectedTimeliness] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');

  // Table Sorting
  const [sortField, setSortField] = useState<'cost' | 'code' | 'title' | 'stage' | 'dwell'>('cost');
  const [sortAsc, setSortAsc] = useState(false);

  // Active view section tab inside dashboard
  const [activeSection, setActiveSection] = useState<'overview' | 'stages' | 'strategic' | 'watchlist' | 'explorer'>('overview');

  // Filter application
  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((init) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          init.title.toLowerCase().includes(query) ||
          init.code.toLowerCase().includes(query) ||
          init.directorate.toLowerCase().includes(query) ||
          init.problemStatement.toLowerCase().includes(query) ||
          init.possibleFundingPartners?.some((p) => p.toLowerCase().includes(query));
        if (!matches) return false;
      }

      if (selectedDirectorate !== 'all' && init.directorate !== selectedDirectorate) {
        return false;
      }

      if (selectedRegion !== 'all' && !init.regions.includes(selectedRegion as AfricanRegion)) {
        return false;
      }

      if (selectedStage !== 'all' && init.stageCode !== Number(selectedStage)) {
        return false;
      }

      if (selectedSra !== 'all' && !init.sras?.includes(selectedSra as StrategicResultArea)) {
        return false;
      }

      if (selectedSdp !== 'all' && !init.sdps?.includes(selectedSdp as StrategicDeliveryPathway)) {
        return false;
      }

      if (selectedPartner !== 'all' && !init.possibleFundingPartners?.some((p) => p.toLowerCase().includes(selectedPartner.toLowerCase()))) {
        return false;
      }

      if (selectedTimeliness !== 'all') {
        const age = calculateInitiativeLifecycleAge(init);
        if (selectedTimeliness === 'ahead' && age.currentGateRagStatus !== 'ahead') return false;
        if (selectedTimeliness === 'on_track' && age.currentGateRagStatus !== 'on_track') return false;
        if (selectedTimeliness === 'at_risk' && age.currentGateRagStatus !== 'at_risk') return false;
        if (selectedTimeliness === 'delayed' && age.currentGateRagStatus !== 'delayed') return false;
      }

      return true;
    });
  }, [
    initiatives,
    searchQuery,
    selectedDirectorate,
    selectedRegion,
    selectedStage,
    selectedSra,
    selectedSdp,
    selectedPartner,
    selectedTimeliness
  ]);

  // Aggregate Executive Metrics
  const metrics = useMemo(() => {
    const targetValue = 1_000_000_000 * currencyRate; // $1.0 Billion USD target converted
    let totalVolume = 0;
    let approvedVolume = 0;
    let incubationVolume = 0;
    let totalDwellDays = 0;
    let aheadCount = 0;
    let onTrackCount = 0;
    let atRiskCount = 0;
    let delayedCount = 0;
    const countriesSet = new Set<string>();

    filteredInitiatives.forEach((init) => {
      const convertedCost = (init.estimatedCost || 0) * currencyRate;
      totalVolume += convertedCost;

      if (init.stageCode >= 4) {
        approvedVolume += convertedCost;
      } else {
        incubationVolume += convertedCost;
      }

      const age = calculateInitiativeLifecycleAge(init);
      totalDwellDays += age.currentGateDaysElapsed;

      if (age.currentGateRagStatus === 'ahead') aheadCount++;
      else if (age.currentGateRagStatus === 'on_track') onTrackCount++;
      else if (age.currentGateRagStatus === 'at_risk') atRiskCount++;
      else if (age.currentGateRagStatus === 'delayed') delayedCount++;

      init.countries?.forEach((c) => countriesSet.add(c));
    });

    const totalCount = filteredInitiatives.length;
    const progressPercent = targetValue > 0 ? ((totalVolume / targetValue) * 100).toFixed(1) : '0';
    const slaComplianceRate = totalCount > 0 ? Math.round(((aheadCount + onTrackCount) / totalCount) * 100) : 100;
    const avgDwell = totalCount > 0 ? Math.round(totalDwellDays / totalCount) : 0;

    return {
      totalVolume,
      targetValue,
      progressPercent,
      approvedVolume,
      incubationVolume,
      totalCount,
      slaComplianceRate,
      avgDwell,
      aheadCount,
      onTrackCount,
      atRiskCount,
      delayedCount,
      distinctCountries: countriesSet.size
    };
  }, [filteredInitiatives, currencyRate]);

  // Stage Breakdown Data
  const stagesData = useMemo(() => {
    const list: {
      code: StageCode;
      name: string;
      sub: string;
      slaTargetDays: number;
      initiatives: Initiative[];
      volume: number;
    }[] = [
      { code: 0, name: 'Stage 0', sub: 'Concept Dev', slaTargetDays: GATE_SLAS[0].slaDays, initiatives: [], volume: 0 },
      { code: 1, name: 'Stage 1', sub: 'Board Eval', slaTargetDays: GATE_SLAS[1].slaDays, initiatives: [], volume: 0 },
      { code: 2, name: 'Stage 2', sub: 'Project Dev', slaTargetDays: GATE_SLAS[2].slaDays, initiatives: [], volume: 0 },
      { code: 3, name: 'Stage 3', sub: 'Appraisal', slaTargetDays: GATE_SLAS[3].slaDays, initiatives: [], volume: 0 },
      { code: 4, name: 'Stage 4', sub: 'CEO Approval', slaTargetDays: GATE_SLAS[4].slaDays, initiatives: [], volume: 0 },
      { code: 5, name: 'Stage 5', sub: 'Contracting', slaTargetDays: GATE_SLAS[5].slaDays, initiatives: [], volume: 0 },
      { code: 6, name: 'Stage 6', sub: 'Amendments', slaTargetDays: GATE_SLAS[6].slaDays, initiatives: [], volume: 0 }
    ];

    filteredInitiatives.forEach((init) => {
      const s = list.find((item) => item.code === init.stageCode);
      if (s) {
        s.initiatives.push(init);
        s.volume += (init.estimatedCost || 0) * currencyRate;
      }
    });

    return list;
  }, [filteredInitiatives, currencyRate]);

  // Strategic Result Areas (Agenda 2063) Analysis
  const sraAnalytics = useMemo(() => {
    return STRATEGIC_RESULT_AREAS.map((sra) => {
      const items = filteredInitiatives.filter((i) => i.sras?.includes(sra));
      const volume = items.reduce((sum, i) => sum + (i.estimatedCost || 0) * currencyRate, 0);
      const percent = metrics.totalVolume > 0 ? (volume / metrics.totalVolume) * 100 : 0;
      return {
        sra,
        count: items.length,
        volume,
        percent
      };
    }).sort((a, b) => b.volume - a.volume);
  }, [filteredInitiatives, metrics.totalVolume, currencyRate]);

  // African Regions Analysis
  const regionalAnalytics = useMemo(() => {
    return AFRICAN_REGIONS.map((region) => {
      const items = filteredInitiatives.filter((i) => i.regions.includes(region));
      const volume = items.reduce((sum, i) => sum + (i.estimatedCost || 0) * currencyRate, 0);
      const countries = new Set<string>();
      items.forEach((i) => i.countries?.forEach((c) => countries.add(c)));
      return {
        region,
        count: items.length,
        volume,
        countriesCount: countries.size,
        initiatives: items
      };
    }).sort((a, b) => b.volume - a.volume);
  }, [filteredInitiatives, currencyRate]);

  // Partner Co-Financing Commitments
  const partnerAnalytics = useMemo(() => {
    const map = new Map<string, { name: string; type: string; count: number; volume: number }>();
    PARTNERS_DATABASE.forEach((p) => {
      map.set(p.name.toLowerCase(), { name: p.name, type: p.type, count: 0, volume: 0 });
    });

    filteredInitiatives.forEach((init) => {
      init.possibleFundingPartners?.forEach((partnerName) => {
        const key = partnerName.toLowerCase();
        let entry = map.get(key);
        if (!entry) {
          entry = { name: partnerName, type: 'Bilateral / Co-Financier', count: 0, volume: 0 };
          map.set(key, entry);
        }
        entry.count += 1;
        entry.volume += ((init.estimatedCost || 0) * currencyRate) / Math.max(1, init.possibleFundingPartners?.length || 1);
      });
    });

    return Array.from(map.values())
      .filter((p) => p.count > 0)
      .sort((a, b) => b.volume - a.volume);
  }, [filteredInitiatives, currencyRate]);

  // Executive Action Watchlist: Awaiting CEO Approval & Overdue Gate SLAs
  const ceoPendingList = useMemo(() => {
    return initiatives.filter((i) => i.stageCode === 4 && i.status === 'Awaiting CEO Decision');
  }, [initiatives]);

  const overdueWatchlist = useMemo(() => {
    return filteredInitiatives
      .map((init) => ({
        init,
        age: calculateInitiativeLifecycleAge(init)
      }))
      .filter((item) => item.age.currentGateRagStatus === 'delayed' || item.age.currentGateRagStatus === 'at_risk')
      .sort((a, b) => b.age.currentGateDaysElapsed - a.age.currentGateDaysElapsed);
  }, [filteredInitiatives]);

  // Sorted Initiatives for Master Table
  const sortedInitiatives = useMemo(() => {
    const list = [...filteredInitiatives];
    list.sort((a, b) => {
      if (sortField === 'cost') {
        return sortAsc ? (a.estimatedCost || 0) - (b.estimatedCost || 0) : (b.estimatedCost || 0) - (a.estimatedCost || 0);
      }
      if (sortField === 'code') {
        return sortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      }
      if (sortField === 'title') {
        return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      if (sortField === 'stage') {
        return sortAsc ? a.stageCode - b.stageCode : b.stageCode - a.stageCode;
      }
      if (sortField === 'dwell') {
        const dwellA = calculateInitiativeLifecycleAge(a).currentGateDaysElapsed;
        const dwellB = calculateInitiativeLifecycleAge(b).currentGateDaysElapsed;
        return sortAsc ? dwellA - dwellB : dwellB - dwellA;
      }
      return 0;
    });
    return list;
  }, [filteredInitiatives, sortField, sortAsc]);

  // Open initiative inspector
  const handleInspect = (initId: string) => {
    if (onOpenInitiative) {
      onOpenInitiative(initId);
    } else {
      setSelectedInitiativeId(initId);
    }
  };

  // Export functions
  const exportCSV = () => {
    const headers = ['Code', 'Title', 'Directorate', 'Stage', 'Status', 'Estimated Cost (USD)', 'RAG Status', 'Dwell Days', 'Regions', 'Partners'];
    const rows = filteredInitiatives.map((i) => {
      const age = calculateInitiativeLifecycleAge(i);
      return [
        `"${i.code}"`,
        `"${i.title.replace(/"/g, '""')}"`,
        `"${i.directorate}"`,
        `"${i.stage}"`,
        `"${i.status}"`,
        i.estimatedCost || 0,
        `"${age.currentGateRagStatus}"`,
        age.currentGateDaysElapsed,
        `"${i.regions.join('; ')}"`,
        `"${(i.possibleFundingPartners || []).join('; ')}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `AUDA_NEPAD_PPMS_Executive_Dashboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedDirectorate('all');
    setSelectedRegion('all');
    setSelectedStage('all');
    setSelectedSra('all');
    setSelectedSdp('all');
    setSelectedTimeliness('all');
    setSelectedPartner('all');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedDirectorate !== 'all' ||
    selectedRegion !== 'all' ||
    selectedStage !== 'all' ||
    selectedSra !== 'all' ||
    selectedSdp !== 'all' ||
    selectedTimeliness !== 'all' ||
    selectedPartner !== 'all';

  return (
    <div className={`space-y-6 ${isExpanded ? 'fixed inset-0 z-50 bg-slate-50 p-6 overflow-y-auto' : ''}`}>
      {/* EXECUTIVE COMMAND HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-slate-700/60 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                Alternative Executive View
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/15">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                AUDA-NEPAD Strategic Intelligence
              </span>
              <span className="text-[11px] text-slate-400">
                Mandate of <strong>Mrs. Nardos Bekele-Thomas</strong>, CEO
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Executive Command & Portfolio Intelligence Dashboard
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Consolidated continental overview of statutory lifecycle velocity, $1.0 Billion capital mobilization,
              independent project appraisals, CEO executive sanctions, and Agenda 2063 strategic coherence.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Switcher */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-0.5 flex items-center shadow-xs">
              {(['USD', 'EUR', 'GBP', 'ZAR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    currency === curr
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* AI Advisor Trigger */}
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('open-ai-chat', {
                    detail: {
                      prompt: `Provide an executive briefing on the current Pipeline Projects Management System portfolio. Analyze tracking towards the $1.0 Billion USD target, highlights for CEO Mrs. Nardos Bekele-Thomas, gate bottlenecks, and key co-financing partnerships.`
                    }
                  })
                );
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              title="Launch AI Strategic Advisor to query this portfolio"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Query AI</span>
            </button>

            {/* Generate Briefing */}
            <button
              onClick={() => {
                setBriefingTemplate('annual');
                setBriefingModalOpen(true);
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Executive Dossier</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              title="Download filtered initiatives in CSV format"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Expand / Minimize Fullscreen View */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl transition-colors"
              title={isExpanded ? 'Exit full screen' : 'Expand full screen'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* TOP MACRO METRIC CARDS (6 HIGH IMPACT TILES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Pipeline Mobilization Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pipeline Mobilization
            </span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(metrics.totalVolume, currency)}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {metrics.progressPercent}% of $1.0B
              </span>
              <span className="text-[10px] text-slate-500">Mobilized</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Number(metrics.progressPercent))}%` }}
            />
          </div>
        </div>

        {/* 2. Approved & Contracted (Stages 4, 5, 6) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Approved & Contracted
            </span>
            <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-teal-950 tracking-tight">
              {formatCurrency(metrics.approvedVolume, currency)}
            </div>
            <p className="text-[11px] text-teal-700 mt-1 font-medium">
              Stages 4, 5 & 6 Flagships
            </p>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            CEO sanctioned & execution-ready
          </div>
        </div>

        {/* 3. Incubation & Development (Stages 0, 1, 2, 3) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Incubation Pipeline
            </span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(metrics.incubationVolume, currency)}
            </div>
            <p className="text-[11px] text-blue-700 mt-1 font-medium">
              Stages 0 to 3 Pipeline
            </p>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            Under active formulation & appraisal
          </div>
        </div>

        {/* 4. Gate SLA Compliance Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Gate SLA Health
            </span>
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {metrics.slaComplianceRate}%
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              <span>{metrics.aheadCount + metrics.onTrackCount} on-track or ahead</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Avg Gate Dwell:</span>
            <strong className="text-slate-800">{metrics.avgDwell} Days</strong>
          </div>
        </div>

        {/* 5. Continental Footprint */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Continental Scope
            </span>
            <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {metrics.distinctCountries} Nations
            </div>
            <p className="text-[11px] text-purple-700 mt-1 font-medium">
              5 African Regions
            </p>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            {metrics.totalCount} active initiatives
          </div>
        </div>

        {/* 6. CEO Sanctions & Watchlist */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CEO Queue
            </span>
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-amber-950 tracking-tight">
              {ceoPendingList.length} Pending
            </div>
            <p className="text-[11px] text-amber-800 mt-1 font-medium">
              Stage 4 CEO Approval
            </p>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            Mrs. Nardos Bekele-Thomas
          </div>
        </div>
      </div>

      {/* FILTER CONTROL RIBBON */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">Multi-Dimensional Portfolio Filters</h3>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Filtered: {filteredInitiatives.length} of {initiatives.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            {/* Quick Section Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'stages', label: '7 Gates' },
                { key: 'strategic', label: 'Agenda 2063' },
                { key: 'watchlist', label: `Watchlist (${overdueWatchlist.length})` },
                { key: 'explorer', label: 'Initiatives Table' }
              ].map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => setActiveSection(sec.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === sec.key
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, code, partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Directorate Dropdown */}
          <div>
            <select
              value={selectedDirectorate}
              onChange={(e) => setSelectedDirectorate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">All Directorates</option>
              {DIRECTORATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* African Region Dropdown */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All African Regions</option>
              {AFRICAN_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Dropdown */}
          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statutory Stages (0 to 6)</option>
              <option value="0">Stage 0: Concept Development</option>
              <option value="1">Stage 1: Concept Evaluation</option>
              <option value="2">Stage 2: Project Development</option>
              <option value="3">Stage 3: Project Appraisal</option>
              <option value="4">Stage 4: CEO Approval</option>
              <option value="5">Stage 5: Contracting</option>
              <option value="6">Stage 6: Amendments</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: 7-GATE LIFECYCLE VELOCITY FLOW */}
      {(activeSection === 'overview' || activeSection === 'stages') && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Continental Statutory 7-Gate Funnel & Stage Velocity</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  (Click any stage card to filter)
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tracking capital volume, initiative counts, statutory SLA target limits, and dwell velocity.
              </p>
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Total Active Portfolio: <span className="text-emerald-700 font-bold">{metrics.totalCount} Initiatives</span>
            </div>
          </div>

          {/* 7 Horizontal Gate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {stagesData.map((stg) => {
              const isSelected = selectedStage === String(stg.code);
              return (
                <div
                  key={stg.code}
                  onClick={() => setSelectedStage(isSelected ? 'all' : String(stg.code))}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>{stg.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[9px] font-bold">
                      {stg.slaTargetDays}d SLA
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{stg.sub}</h4>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900">{stg.initiatives.length}</span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {formatCurrency(stg.volume, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: STRATEGIC IMPACT DIMENSIONS (AGENDA 2063, REGIONS, PARTNERS) */}
      {(activeSection === 'overview' || activeSection === 'strategic') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card A: Agenda 2063 Strategic Result Areas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">Agenda 2063 Strategic Result Areas</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">5 SRAs</span>
            </div>

            <div className="space-y-3">
              {sraAnalytics.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium truncate max-w-[210px]" title={item.sra}>
                      {item.sra.split('–')[1] || item.sra}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.count}
                      </span>
                      <span className="font-bold text-slate-900 text-[11px]">
                        {formatCurrency(item.volume, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(5, item.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: African Regional Footprint */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900">African Regional Footprint</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Continental Corridors</span>
            </div>

            <div className="space-y-2.5">
              {regionalAnalytics.map((reg, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRegion(selectedRegion === reg.region ? 'all' : reg.region)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    selectedRegion === reg.region
                      ? 'border-teal-500 bg-teal-50/70 font-semibold'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800">{reg.region}</div>
                    <div className="text-[10px] text-slate-500">{reg.countriesCount} member states</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatCurrency(reg.volume, currency)}</div>
                    <div className="text-[10px] text-emerald-700 font-medium">{reg.count} projects</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card C: Co-Financiers & Strategic Partners */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">Co-Financiers & Partners</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {partnerAnalytics.length} Committed
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {partnerAnalytics.slice(0, 6).map((partner, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="truncate max-w-[190px]">
                    <div className="font-bold text-slate-800 truncate" title={partner.name}>
                      {partner.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{partner.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatCurrency(partner.volume, currency)}</div>
                    <div className="text-[10px] text-indigo-700 font-semibold">
                      {partner.count} {partner.count === 1 ? 'initiative' : 'initiatives'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: EXECUTIVE WATCHLIST & IMMEDIATE DECISION QUEUE */}
      {(activeSection === 'overview' || activeSection === 'watchlist') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Box 1: CEO Stage 4 Approval Queue (Mrs. Nardos Bekele-Thomas) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Awaiting CEO Executive Sanction (Stage 4)
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Statutory prerogative of Chief Executive Officer <strong>Mrs. Nardos Bekele-Thomas</strong>
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                {ceoPendingList.length} In Queue
              </span>
            </div>

            {ceoPendingList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                No initiatives currently awaiting CEO approval. All submissions processed.
              </div>
            ) : (
              <div className="space-y-2">
                {ceoPendingList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/80 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[340px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{item.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Directorate: {item.directorate} • Cost: {formatCurrency((item.estimatedCost || 0) * currencyRate, currency)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleInspect(item.id)}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shadow-2xs flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 2: Overdue Gate Timeliness Watchlist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Statutory SLA Bottlenecks & Overdue Gates
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Initiatives that have exceeded statutory gate time limits
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                {overdueWatchlist.length} Delayed / At Risk
              </span>
            </div>

            {overdueWatchlist.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                Excellent! All initiatives are currently adhering strictly to statutory SLAs.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {overdueWatchlist.map(({ init, age }) => (
                  <div
                    key={init.id}
                    className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[340px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                          {init.code}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{init.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {init.stage} • Dwell: <strong className="text-rose-700">{age.currentGateDaysElapsed} days</strong> (Target: {age.currentGateSlaDays}d)
                      </div>
                    </div>

                    <button
                      onClick={() => handleInspect(init.id)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-[11px] shadow-2xs flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <Eye className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: MASTER INITIATIVE PORTFOLIO EXPLORER TABLE */}
      {(activeSection === 'overview' || activeSection === 'explorer') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Executive Portfolio Data Explorer</span>
                <span className="text-[11px] font-normal text-slate-500">
                  ({filteredInitiatives.length} matching criteria)
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Click any initiative to view full statutory dossier, financing agreements, and approval audit logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="cost">Estimated Budget</option>
                <option value="code">Initiative Code</option>
                <option value="title">Project Title</option>
                <option value="stage">Lifecycle Stage</option>
                <option value="dwell">Gate Dwell Time</option>
              </select>

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-bold"
                title="Toggle sort direction"
              >
                {sortAsc ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Initiative & Directorate</th>
                  <th className="py-3 px-4">Lifecycle Stage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Budget ({currency})</th>
                  <th className="py-3 px-4">SLA Health</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedInitiatives.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No initiatives match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  sortedInitiatives.map((init) => {
                    const age = calculateInitiativeLifecycleAge(init);
                    return (
                      <tr
                        key={init.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => handleInspect(init.id)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                          {init.code}
                        </td>
                        <td className="py-3 px-4 max-w-[280px]">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                            {init.title}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {init.directorate}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            Stage {init.stageCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={init.status} />
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                          {formatCurrency((init.estimatedCost || 0) * currencyRate, currency)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <LifecycleAgeBadge initiative={init} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleInspect(init.id)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 rounded-lg text-[11px] font-semibold transition-all shadow-2xs"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Showing {sortedInitiatives.length} of {initiatives.length} total initiatives
            </span>
            <span className="font-semibold text-slate-700">
              Total Filtered Volume: {formatCurrency(metrics.totalVolume, currency)}
            </span>
          </div>
        </div>
      )}

      {/* EXECUTIVE DOSSIER BRIEFING MODAL */}
      {briefingModalOpen && (
        <ExecutiveBriefingModal
          onClose={() => setBriefingModalOpen(false)}
          initiatives={filteredInitiatives}
          selectedTemplate={briefingTemplate}
        />
      )}
    </div>
  );
};
