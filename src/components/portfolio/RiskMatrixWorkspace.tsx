import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Initiative,
  RiskItem,
  Directorate,
  StageCode
} from '../../types';
import {
  DIRECTORATES
} from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ShieldAlert,
  AlertTriangle,
  Filter,
  RefreshCw,
  Search,
  Download,
  Printer,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Building,
  Layers,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Info,
  X,
  Check,
  Edit3
} from 'lucide-react';

interface FlattenedRisk extends RiskItem {
  parentInitiativeId: string;
  parentCode: string;
  parentTitle: string;
  parentDirectorate: Directorate;
  parentStage: string;
  parentStageCode: StageCode;
  parentBudget: number;
}

type LikelihoodLevel = 'High' | 'Medium' | 'Low';
type ImpactLevel = 'High' | 'Medium' | 'Low';

export const RiskMatrixWorkspace: React.FC = () => {
  const {
    initiatives,
    currentUser,
    setSelectedInitiativeId,
    setCurrentPage,
    addRiskToInitiative,
    updateRiskStatus
  } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedLikelihood, setSelectedLikelihood] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('all');

  // Heat Map Selected Cell Filter: null or { likelihood, impact }
  const [heatMapCellFilter, setHeatMapCellFilter] = useState<{
    likelihood: LikelihoodLevel;
    impact: ImpactLevel;
  } | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectRisk, setInspectRisk] = useState<FlattenedRisk | null>(null);

  // Form State for Adding Risk
  const [newRiskProject, setNewRiskProject] = useState<string>(initiatives[0]?.id || '');
  const [newRiskId, setNewRiskId] = useState(`RSK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [newRiskCategory, setNewRiskCategory] = useState<RiskItem['category']>('Operational');
  const [newRiskLikelihood, setNewRiskLikelihood] = useState<LikelihoodLevel>('Medium');
  const [newRiskImpact, setNewRiskImpact] = useState<ImpactLevel>('High');
  const [newRiskDesc, setNewRiskDesc] = useState('');
  const [newRiskMitigation, setNewRiskMitigation] = useState('');
  const [newRiskOwner, setNewRiskOwner] = useState(currentUser.name);
  const [newRiskDate, setNewRiskDate] = useState('2027-06-30');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  // 1. Flatten all risks from all initiatives
  const allFlattenedRisks = useMemo(() => {
    const list: FlattenedRisk[] = [];
    initiatives.forEach((init) => {
      init.risks?.forEach((r) => {
        list.push({
          ...r,
          parentInitiativeId: init.id,
          parentCode: init.code,
          parentTitle: init.title,
          parentDirectorate: init.directorate,
          parentStage: init.stage,
          parentStageCode: init.stageCode,
          parentBudget: init.estimatedCost || 0
        });
      });
    });
    return list;
  }, [initiatives]);

  // 2. Filter flattened risks
  const filteredRisks = useMemo(() => {
    return allFlattenedRisks.filter((risk) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          risk.riskId.toLowerCase().includes(query) ||
          risk.description.toLowerCase().includes(query) ||
          risk.mitigationMeasures.toLowerCase().includes(query) ||
          risk.riskOwner.toLowerCase().includes(query) ||
          risk.parentTitle.toLowerCase().includes(query) ||
          risk.parentCode.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (selectedProject !== 'all' && risk.parentInitiativeId !== selectedProject) {
        return false;
      }

      if (selectedCategory !== 'all' && risk.category !== selectedCategory) {
        return false;
      }

      if (selectedSeverity !== 'all' && risk.severity !== selectedSeverity) {
        return false;
      }

      if (selectedLikelihood !== 'all' && risk.likelihood !== selectedLikelihood) {
        return false;
      }

      if (selectedImpact !== 'all' && risk.impact !== selectedImpact) {
        return false;
      }

      if (selectedStatus !== 'all' && risk.currentStatus !== selectedStatus) {
        return false;
      }

      if (selectedDirectorate !== 'all' && risk.parentDirectorate !== selectedDirectorate) {
        return false;
      }

      // Heat map cell filter
      if (heatMapCellFilter) {
        if (
          risk.likelihood !== heatMapCellFilter.likelihood ||
          risk.impact !== heatMapCellFilter.impact
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    allFlattenedRisks,
    searchQuery,
    selectedProject,
    selectedCategory,
    selectedSeverity,
    selectedLikelihood,
    selectedImpact,
    selectedStatus,
    selectedDirectorate,
    heatMapCellFilter
  ]);

  const activeFiltersCount = [
    searchQuery.trim().length > 0,
    selectedProject !== 'all',
    selectedCategory !== 'all',
    selectedSeverity !== 'all',
    selectedLikelihood !== 'all',
    selectedImpact !== 'all',
    selectedStatus !== 'all',
    selectedDirectorate !== 'all',
    heatMapCellFilter !== null
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProject('all');
    setSelectedCategory('all');
    setSelectedSeverity('all');
    setSelectedLikelihood('all');
    setSelectedImpact('all');
    setSelectedStatus('all');
    setSelectedDirectorate('all');
    setHeatMapCellFilter(null);
  };

  // Helper to compute cell score and color
  const getCellScore = (likelihood: LikelihoodLevel, impact: ImpactLevel) => {
    const lWeight = likelihood === 'High' ? 3 : likelihood === 'Medium' ? 2 : 1;
    const iWeight = impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;
    return lWeight * iWeight;
  };

  const getScoreRating = (score: number): { label: string; bg: string; text: string; border: string } => {
    if (score >= 9) {
      return { label: 'Critical / Extreme', bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-600' };
    }
    if (score >= 6) {
      return { label: 'High', bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' };
    }
    if (score >= 3) {
      return { label: 'Medium', bg: 'bg-amber-400', text: 'text-slate-900', border: 'border-amber-500' };
    }
    return { label: 'Low', bg: 'bg-emerald-400', text: 'text-slate-900', border: 'border-emerald-500' };
  };

  // Heat map distribution data
  const heatMapGrid = useMemo(() => {
    const likelihoods: LikelihoodLevel[] = ['High', 'Medium', 'Low'];
    const impacts: ImpactLevel[] = ['Low', 'Medium', 'High'];

    const matrix: Record<string, { count: number; exposure: number; risks: FlattenedRisk[] }> = {};

    likelihoods.forEach((l) => {
      impacts.forEach((i) => {
        matrix[`${l}-${i}`] = { count: 0, exposure: 0, risks: [] };
      });
    });

    // Use allFlattenedRisks or filteredRisks (without the heatMapCellFilter applied)
    const baseRisksForHeatmap = allFlattenedRisks.filter((risk) => {
      if (selectedProject !== 'all' && risk.parentInitiativeId !== selectedProject) return false;
      if (selectedCategory !== 'all' && risk.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && risk.currentStatus !== selectedStatus) return false;
      if (selectedDirectorate !== 'all' && risk.parentDirectorate !== selectedDirectorate) return false;
      return true;
    });

    baseRisksForHeatmap.forEach((r) => {
      const key = `${r.likelihood}-${r.impact}`;
      if (matrix[key]) {
        matrix[key].count++;
        matrix[key].exposure += r.parentBudget;
        matrix[key].risks.push(r);
      }
    });

    return matrix;
  }, [allFlattenedRisks, selectedProject, selectedCategory, selectedStatus, selectedDirectorate]);

  // Macro KPIs
  const macroKPIs = useMemo(() => {
    const totalRisks = filteredRisks.length;
    const activeRisks = filteredRisks.filter((r) => r.currentStatus === 'Active').length;
    const mitigatedRisks = filteredRisks.filter((r) => r.currentStatus === 'Mitigated').length;
    const closedRisks = filteredRisks.filter((r) => r.currentStatus === 'Closed').length;

    const criticalRisks = filteredRisks.filter(
      (r) => (r.likelihood === 'High' && r.impact === 'High') || r.severity === 'High'
    ).length;

    // Capital at risk: Sum of parent budgets for initiatives with Active High/Critical risks
    const criticalProjectIds = new Set<string>();
    filteredRisks
      .filter((r) => r.currentStatus === 'Active' && ((r.likelihood === 'High' && r.impact === 'High') || r.severity === 'High'))
      .forEach((r) => criticalProjectIds.add(r.parentInitiativeId));

    let capitalAtRisk = 0;
    criticalProjectIds.forEach((id) => {
      const match = initiatives.find((i) => i.id === id);
      if (match) capitalAtRisk += match.estimatedCost || 0;
    });

    // Dominant Category
    const categoryCounts: Record<string, number> = {};
    filteredRisks.forEach((r) => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });
    let dominantCat = 'None';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantCat = cat;
      }
    });

    return {
      totalRisks,
      activeRisks,
      mitigatedRisks,
      closedRisks,
      criticalRisks,
      capitalAtRisk,
      dominantCategory: dominantCat,
      resolutionRate: totalRisks > 0 ? Math.round(((mitigatedRisks + closedRisks) / totalRisks) * 100) : 0
    };
  }, [filteredRisks, initiatives]);

  // Category Distribution
  const categoryStats = useMemo(() => {
    const categories: RiskItem['category'][] = [
      'Operational',
      'Financial',
      'Political & Governance',
      'Environmental & Social',
      'Institutional'
    ];

    return categories.map((cat) => {
      const matched = filteredRisks.filter((r) => r.category === cat);
      const active = matched.filter((r) => r.currentStatus === 'Active').length;
      const critical = matched.filter((r) => r.severity === 'High' || (r.likelihood === 'High' && r.impact === 'High')).length;
      return {
        category: cat,
        total: matched.length,
        active,
        critical
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredRisks]);

  // Project Risk Concentration List
  const projectRiskRankings = useMemo(() => {
    const map = new Map<string, { initiative: Initiative; totalRisks: number; criticalRisks: number; activeRisks: number }>();

    initiatives.forEach((init) => {
      const pRisks = init.risks || [];
      if (pRisks.length > 0) {
        const critical = pRisks.filter((r) => (r.likelihood === 'High' && r.impact === 'High') || r.severity === 'High').length;
        const active = pRisks.filter((r) => r.currentStatus === 'Active').length;
        map.set(init.id, {
          initiative: init,
          totalRisks: pRisks.length,
          criticalRisks: critical,
          activeRisks: active
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.criticalRisks - a.criticalRisks || b.totalRisks - a.totalRisks);
  }, [initiatives]);

  // Handle Create Risk
  const handleCreateRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiskProject || !newRiskDesc.trim() || !newRiskMitigation.trim()) return;

    // Compute severity
    const score = getCellScore(newRiskLikelihood, newRiskImpact);
    const computedSeverity: RiskItem['severity'] = score >= 6 ? 'High' : score >= 3 ? 'Medium' : 'Low';

    addRiskToInitiative(newRiskProject, {
      riskId: newRiskId,
      description: newRiskDesc.trim(),
      category: newRiskCategory,
      severity: computedSeverity,
      likelihood: newRiskLikelihood,
      impact: newRiskImpact,
      mitigationMeasures: newRiskMitigation.trim(),
      riskOwner: newRiskOwner.trim() || currentUser.name,
      targetDate: newRiskDate,
      currentStatus: 'Active'
    });

    // Reset form
    setNewRiskDesc('');
    setNewRiskMitigation('');
    setNewRiskId(`RSK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setIsAddModalOpen(false);
  };

  // Export Risk Register to CSV
  const exportRiskCSV = () => {
    const headers = [
      'Risk ID',
      'Project Code',
      'Project Title',
      'Directorate',
      'Lifecycle Stage',
      'Risk Category',
      'Likelihood',
      'Impact',
      'Severity Level',
      'Risk Score',
      'Risk Description',
      'Mitigation Strategy',
      'Risk Owner',
      'Target Date',
      'Status'
    ];

    const rows = filteredRisks.map((r) => {
      const score = getCellScore(r.likelihood, r.impact);
      return [
        `"${r.riskId}"`,
        `"${r.parentCode}"`,
        `"${r.parentTitle.replace(/"/g, '""')}"`,
        `"${r.parentDirectorate}"`,
        `"${r.parentStage}"`,
        `"${r.category}"`,
        `"${r.likelihood}"`,
        `"${r.impact}"`,
        `"${r.severity}"`,
        score,
        `"${r.description.replace(/"/g, '""')}"`,
        `"${r.mitigationMeasures.replace(/"/g, '""')}"`,
        `"${r.riskOwner}"`,
        `"${r.targetDate}"`,
        `"${r.currentStatus}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AUDA_NEPAD_Aggregated_Risk_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Executive Command Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-rose-400 flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Aggregated Risk Matrix &amp; Heat Map
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              Strategic Portfolio Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl">
            Centralized surveillance of all project risk registers across the continental portfolio, featuring an interactive 3x3 Likelihood vs Impact heat map, multi-criteria filtering, and audit action plans.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Project Risk</span>
          </button>

          <button
            onClick={exportRiskCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download complete risk register as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Register (CSV)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Print Risk Matrix Report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print Briefing</span>
          </button>
        </div>
      </div>

      {/* Top Portfolio Risk Macro KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registered Risks</div>
          <div className="text-xl font-black text-slate-900 mt-1">{macroKPIs.totalRisks}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across {projectRiskRankings.length} Projects</div>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Critical / High Severity</div>
          <div className="text-xl font-black text-rose-900 mt-1">{macroKPIs.criticalRisks}</div>
          <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Requires Board Oversight</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Exposure</div>
          <div className="text-xl font-black text-amber-700 mt-1">{macroKPIs.activeRisks}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Under Active Mitigation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mitigated &amp; Closed</div>
          <div className="text-xl font-black text-emerald-800 mt-1">{macroKPIs.mitigatedRisks + macroKPIs.closedRisks}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">{macroKPIs.resolutionRate}% Resolved / Closed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dominant Category</div>
          <div className="text-sm font-black text-slate-900 mt-1 truncate" title={macroKPIs.dominantCategory}>
            {macroKPIs.dominantCategory}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Top Risk Concentration</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capital at High Risk</div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {formatCurrency(macroKPIs.capitalAtRisk, 'USD')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">In High-Exposure Projects</div>
        </div>
      </div>

      {/* Interactive Multi-Dimensional Risk Filter Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Risk Register Multi-Criteria Filters
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {activeFiltersCount} Active
              </span>
            )}
            {heatMapCellFilter && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                <span>Heatmap: {heatMapCellFilter.likelihood} Likelihood × {heatMapCellFilter.impact} Impact</span>
                <button
                  onClick={() => setHeatMapCellFilter(null)}
                  className="hover:text-rose-950 ml-1 font-black cursor-pointer"
                  title="Clear cell filter"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredRisks.length}</strong> of {allFlattenedRisks.length} registered risks
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, description, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">All Projects ({initiatives.length} initiatives)</option>
              {initiatives.map((init) => (
                <option key={init.id} value={init.id}>
                  {init.code}: {init.title}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Categories (5 types)</option>
              <option value="Institutional">Institutional</option>
              <option value="Operational">Operational</option>
              <option value="Financial">Financial</option>
              <option value="Environmental & Social">Environmental &amp; Social</option>
              <option value="Political & Governance">Political &amp; Governance</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statuses (Active, Mitigated, Closed)</option>
              <option value="Active">Active</option>
              <option value="Mitigated">Mitigated</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Likelihood, Impact, Severity, Directorate */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
          <div>
            <select
              value={selectedLikelihood}
              onChange={(e) => setSelectedLikelihood(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Likelihood Levels</option>
              <option value="High">High Likelihood</option>
              <option value="Medium">Medium Likelihood</option>
              <option value="Low">Low Likelihood</option>
            </select>
          </div>

          <div>
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Impact Levels</option>
              <option value="High">High Impact</option>
              <option value="Medium">Medium Impact</option>
              <option value="Low">Low Impact</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Severity Ratings</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDirectorate}
              onChange={(e) => setSelectedDirectorate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">All Lead Directorates</option>
              {DIRECTORATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Heat Map Section & Risk Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive 3x3 Heat Map Grid (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Institutional Risk Heat Map (Likelihood × Impact)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Click any matrix cell to filter the register table below by that specific risk severity profile.
              </p>
            </div>
            {heatMapCellFilter && (
              <button
                onClick={() => setHeatMapCellFilter(null)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Clear Cell Filter
              </button>
            )}
          </div>

          {/* Matrix Container */}
          <div className="relative pt-2 pb-4">
            {/* Y-Axis Label */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden sm:block">
              ← Likelihood →
            </div>

            <div className="sm:pl-6">
              {/* Top X-Axis Header */}
              <div className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 pb-2">
                Impact →
              </div>

              {/* Header row for Impact columns */}
              <div className="grid grid-cols-3 gap-3 mb-2 text-center text-xs font-bold text-slate-600">
                <div className="bg-slate-100 py-1.5 rounded-lg border border-slate-200/60">Low Impact</div>
                <div className="bg-slate-100 py-1.5 rounded-lg border border-slate-200/60">Medium Impact</div>
                <div className="bg-slate-100 py-1.5 rounded-lg border border-slate-200/60">High Impact</div>
              </div>

              {/* 3 Rows for Likelihood: High, Medium, Low */}
              {(['High', 'Medium', 'Low'] as LikelihoodLevel[]).map((likelihood) => (
                <div key={likelihood} className="grid grid-cols-3 gap-3 mb-3">
                  {(['Low', 'Medium', 'High'] as ImpactLevel[]).map((impact) => {
                    const key = `${likelihood}-${impact}`;
                    const cell = heatMapGrid[key] || { count: 0, exposure: 0, risks: [] };
                    const score = getCellScore(likelihood, impact);
                    const rating = getScoreRating(score);
                    const isSelected =
                      heatMapCellFilter?.likelihood === likelihood &&
                      heatMapCellFilter?.impact === impact;

                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (isSelected) {
                            setHeatMapCellFilter(null);
                          } else {
                            setHeatMapCellFilter({ likelihood, impact });
                          }
                        }}
                        className={`p-3 sm:p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 relative overflow-hidden flex flex-col justify-between min-h-[105px] ${
                          rating.border
                        } ${
                          isSelected
                            ? 'ring-4 ring-slate-900 shadow-md scale-[1.02]'
                            : 'hover:shadow-sm hover:scale-[1.01]'
                        } ${
                          score >= 9
                            ? 'bg-rose-50 hover:bg-rose-100/70 border-rose-300'
                            : score >= 6
                            ? 'bg-orange-50 hover:bg-orange-100/70 border-orange-300'
                            : score >= 3
                            ? 'bg-amber-50 hover:bg-amber-100/70 border-amber-300'
                            : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-300'
                        }`}
                      >
                        {/* Top badge */}
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="truncate">{likelihood[0]}L × {impact[0]}I</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              score >= 9
                                ? 'bg-rose-600 text-white'
                                : score >= 6
                                ? 'bg-orange-600 text-white'
                                : score >= 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            Score {score}
                          </span>
                        </div>

                        {/* Cell Count */}
                        <div className="my-1.5 flex items-baseline gap-1.5">
                          <span
                            className={`text-2xl font-black ${
                              score >= 9
                                ? 'text-rose-700'
                                : score >= 6
                                ? 'text-orange-700'
                                : score >= 3
                                ? 'text-amber-800'
                                : 'text-emerald-800'
                            }`}
                          >
                            {cell.count}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            risk{cell.count !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Cell Exposure & Rating */}
                        <div className="text-[10px] text-slate-600 truncate border-t border-slate-200/60 pt-1 flex items-center justify-between">
                          <span className="font-semibold text-slate-700">{rating.label.split('/')[0]}</span>
                          <span className="font-mono text-slate-500">{formatCurrency(cell.exposure, 'USD')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Matrix Legend */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span className="font-semibold text-slate-700">Critical (Score 9): Red</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500" />
                  <span className="font-semibold text-slate-700">High (Score 6): Orange</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                  <span className="font-semibold text-slate-700">Medium (Score 3-4): Amber</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                  <span className="font-semibold text-slate-700">Low (Score 1-2): Green</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown & Project Exposure Rankings (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Category Distribution Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Risk Categories Breakdown</span>
            </h3>

            <div className="space-y-3">
              {categoryStats.map((item) => {
                const percent = macroKPIs.totalRisks > 0 ? Math.round((item.total / macroKPIs.totalRisks) * 100) : 0;
                return (
                  <div
                    key={item.category}
                    onClick={() => setSelectedCategory(selectedCategory === item.category ? 'all' : item.category)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedCategory === item.category
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                      <span>{item.category}</span>
                      <div className="flex items-center gap-2">
                        {item.critical > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                            {item.critical} Critical
                          </span>
                        )}
                        <span className="font-mono text-slate-900 font-extrabold">{item.total}</span>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Exposure Leaderboard */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Highest Risk Project Registers</span>
              </h3>
              <span className="text-[11px] text-slate-500">Top Caseload</span>
            </div>

            <div className="space-y-2">
              {projectRiskRankings.slice(0, 4).map(({ initiative: init, totalRisks, criticalRisks }) => (
                <div
                  key={init.id}
                  onClick={() => setSelectedProject(selectedProject === init.id ? 'all' : init.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    selectedProject === init.id
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-800 text-[10px]">{init.code}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[10px] text-slate-500 truncate">{init.directorate.split(',')[0]}</span>
                    </div>
                    <div className="font-bold text-slate-900 truncate mt-0.5" title={init.title}>
                      {init.title}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                      {totalRisks} risk{totalRisks !== 1 ? 's' : ''}
                    </span>
                    {criticalRisks > 0 && (
                      <div className="text-[10px] font-bold text-rose-700 mt-0.5">
                        {criticalRisks} Critical
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MASTER AGGREGATED RISK REGISTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Continental Master Risk Register</span>
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated roster of all registered project risks, mitigation action plans, and audit ownership across the portfolio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredRisks.length} record(s)
            </span>
            <button
              onClick={exportRiskCSV}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Table</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Risk ID &amp; Status</th>
                <th className="p-3.5">Associated Project</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Likelihood &amp; Impact</th>
                <th className="p-3.5">Severity Score</th>
                <th className="p-3.5 min-w-[280px]">Risk Description &amp; Mitigation Strategy</th>
                <th className="p-3.5">Owner &amp; Target</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    No risk registers found matching the current search and matrix filters.
                  </td>
                </tr>
              ) : (
                filteredRisks.map((r) => {
                  const score = getCellScore(r.likelihood, r.impact);
                  const rating = getScoreRating(score);

                  return (
                    <tr key={`${r.parentInitiativeId}-${r.id}`} className="hover:bg-slate-50/80 transition-colors">
                      {/* Risk ID & Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{r.riskId}</div>
                        <div className="mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.currentStatus === 'Active'
                                ? 'bg-amber-100 text-amber-800'
                                : r.currentStatus === 'Mitigated'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.currentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Associated Project */}
                      <td className="p-3.5 max-w-[200px]">
                        <div
                          onClick={() => setSelectedInitiativeId(r.parentInitiativeId)}
                          className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer truncate"
                          title={r.parentTitle}
                        >
                          {r.parentTitle}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-emerald-800 font-semibold">{r.parentCode}</span>
                          <span>•</span>
                          <span className="truncate">{r.parentStage.split(':')[0]}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {r.category}
                        </span>
                      </td>

                      {/* Likelihood & Impact */}
                      <td className="p-3.5 whitespace-nowrap text-[11px]">
                        <div className="text-slate-700">
                          Likelihood: <strong className={r.likelihood === 'High' ? 'text-rose-700' : 'text-slate-900'}>{r.likelihood}</strong>
                        </div>
                        <div className="text-slate-700 mt-0.5">
                          Impact: <strong className={r.impact === 'High' ? 'text-rose-700' : 'text-slate-900'}>{r.impact}</strong>
                        </div>
                      </td>

                      {/* Severity Score */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                            score >= 9
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : score >= 6
                              ? 'bg-orange-100 text-orange-900 border border-orange-300'
                              : score >= 3
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          <span>{rating.label}</span>
                          <span className="text-[10px] opacity-75">({score})</span>
                        </span>
                      </td>

                      {/* Description & Mitigation */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 line-clamp-2 text-xs">
                          {r.description}
                        </div>
                        <div className="mt-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/80 line-clamp-2">
                          <span className="font-bold text-slate-800">Mitigation: </span>
                          {r.mitigationMeasures}
                        </div>
                      </td>

                      {/* Owner & Target Date */}
                      <td className="p-3.5 whitespace-nowrap text-[11px]">
                        <div className="font-bold text-slate-900">{r.riskOwner}</div>
                        <div className="text-slate-400 mt-0.5">Target: {formatDate(r.targetDate)}</div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Status toggle */}
                          {r.currentStatus === 'Active' ? (
                            <button
                              onClick={() => updateRiskStatus(r.parentInitiativeId, r.id, 'Mitigated')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200 transition-colors cursor-pointer"
                              title="Mark as Mitigated"
                            >
                              Mitigate
                            </button>
                          ) : r.currentStatus === 'Mitigated' ? (
                            <button
                              onClick={() => updateRiskStatus(r.parentInitiativeId, r.id, 'Closed')}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded border border-slate-300 transition-colors cursor-pointer"
                              title="Mark as Closed"
                            >
                              Close
                            </button>
                          ) : (
                            <button
                              onClick={() => updateRiskStatus(r.parentInitiativeId, r.id, 'Active')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded border border-amber-200 transition-colors cursor-pointer"
                              title="Reopen Risk"
                            >
                              Reopen
                            </button>
                          )}

                          <button
                            onClick={() => setInspectRisk(r)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTER NEW PROJECT RISK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Register New Project Risk</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRiskSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Target Initiative / Project Dossier *
                </label>
                <select
                  value={newRiskProject}
                  onChange={(e) => setNewRiskProject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  required
                >
                  {initiatives.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} — {i.title} ({i.stage.split(':')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Risk Reference Identifier *
                  </label>
                  <input
                    type="text"
                    value={newRiskId}
                    onChange={(e) => setNewRiskId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Risk Category *
                  </label>
                  <select
                    value={newRiskCategory}
                    onChange={(e) => setNewRiskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Financial">Financial</option>
                    <option value="Political & Governance">Political &amp; Governance</option>
                    <option value="Environmental & Social">Environmental &amp; Social</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Likelihood Level *
                  </label>
                  <select
                    value={newRiskLikelihood}
                    onChange={(e) => setNewRiskLikelihood(e.target.value as LikelihoodLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="High">High Likelihood</option>
                    <option value="Medium">Medium Likelihood</option>
                    <option value="Low">Low Likelihood</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Impact Level *
                  </label>
                  <select
                    value={newRiskImpact}
                    onChange={(e) => setNewRiskImpact(e.target.value as ImpactLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="High">High Impact</option>
                    <option value="Medium">Medium Impact</option>
                    <option value="Low">Low Impact</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Risk Description &amp; Threat Narrative *
                </label>
                <textarea
                  rows={3}
                  value={newRiskDesc}
                  onChange={(e) => setNewRiskDesc(e.target.value)}
                  placeholder="Detail the operational, political, or financial risk vulnerability..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Mitigation Measures &amp; Action Plan *
                </label>
                <textarea
                  rows={3}
                  value={newRiskMitigation}
                  onChange={(e) => setNewRiskMitigation(e.target.value)}
                  placeholder="Detail preventative actions, contingency covenants, and institutional safeguards..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Risk Owner / Responsible Officer *
                  </label>
                  <input
                    type="text"
                    value={newRiskOwner}
                    onChange={(e) => setNewRiskOwner(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Target Resolution Date *
                  </label>
                  <input
                    type="date"
                    value={newRiskDate}
                    onChange={(e) => setNewRiskDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                >
                  Register Risk in Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RISK DETAIL & MITIGATION AUDIT INSPECTOR */}
      {inspectRisk && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-xs">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {inspectRisk.riskId}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {inspectRisk.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Risk Assessment &amp; Governance Audit Dossier
                </h3>
              </div>
              <button
                onClick={() => setInspectRisk(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Parent Project Summary */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Parent Initiative
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {inspectRisk.parentTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Code: <strong className="text-emerald-800 font-mono">{inspectRisk.parentCode}</strong> · {inspectRisk.parentDirectorate} · {inspectRisk.parentStage}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedInitiativeId(inspectRisk.parentInitiativeId);
                    setInspectRisk(null);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Open Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Assessment Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Likelihood</div>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5">{inspectRisk.likelihood}</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Impact</div>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5">{inspectRisk.impact}</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Calculated Score</div>
                  <div className="font-extrabold text-sm text-rose-700 mt-0.5">
                    {getCellScore(inspectRisk.likelihood, inspectRisk.impact)} / 9
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Current Status</div>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5">{inspectRisk.currentStatus}</div>
                </div>
              </div>

              {/* Threat Narrative */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  1.0 Risk Description &amp; Underlying Vulnerability
                </h4>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                  {inspectRisk.description}
                </p>
              </div>

              {/* Mitigation Measures */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  2.0 Mitigation Action Plan &amp; Contingency Strategy
                </h4>
                <div className="text-slate-700 bg-emerald-50/50 p-3 rounded-lg border border-emerald-200/80 leading-relaxed whitespace-pre-line">
                  {inspectRisk.mitigationMeasures}
                </div>
              </div>

              {/* Ownership */}
              <div className="grid grid-cols-2 gap-4 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Risk Custodian / Lead: </span>
                  <span>{inspectRisk.riskOwner}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">Target Resolution: </span>
                  <span>{formatDate(inspectRisk.targetDate)}</span>
                </div>
              </div>

              {/* Status Update Action Box */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block text-[11px]">
                  Update Status or Append Fiduciary Audit Note:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Optional audit comment or milestone clearance note..."
                    value={statusUpdateNote}
                    onChange={(e) => setStatusUpdateNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => {
                      updateRiskStatus(
                        inspectRisk.parentInitiativeId,
                        inspectRisk.id,
                        inspectRisk.currentStatus === 'Active' ? 'Mitigated' : 'Active',
                        statusUpdateNote
                      );
                      setInspectRisk(null);
                      setStatusUpdateNote('');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    {inspectRisk.currentStatus === 'Active' ? 'Mark Mitigated' : 'Mark Active'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectRisk(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
