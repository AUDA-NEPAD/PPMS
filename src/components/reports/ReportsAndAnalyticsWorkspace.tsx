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
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  calculateInitiativeLifecycleAge,
  getRAGConfig,
  GATE_SLAS
} from '../../utils/lifecycleAgeCalculations';
import { StatusBadge } from '../common/StatusBadge';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import { ExecutiveBriefingModal } from './ExecutiveBriefingModal';
import { PipelineMobilizationGauge } from './PipelineMobilizationGauge';
import { StrategicPortfolioGraphs } from './StrategicPortfolioGraphs';
import { AlternativeExecutiveDashboard } from './AlternativeExecutiveDashboard';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Download,
  Sparkles,
  Filter,
  RefreshCw,
  Search,
  Printer,
  FileText,
  DollarSign,
  Globe,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Handshake,
  PieChart,
  FolderGit2,
  Calendar,
  Building,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

type TabKey = 'alt_dashboard' | 'funnel' | 'financial' | 'agenda2063' | 'governance' | 'statutory' | 'explorer';

export const ReportsAndAnalyticsWorkspace: React.FC = () => {
  const {
    initiatives,
    currentUser,
    setSelectedInitiativeId,
    setSelectedProjectDevelopmentId,
    setSelectedAppraisalId,
    setSelectedCeoApprovalId,
    setSelectedContractingId,
    setSelectedAmendmentInitiativeId,
    setCurrentPage
  } = useApp();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<TabKey>('funnel');

  // Executive Briefing Modal State
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [briefingTemplate, setBriefingTemplate] = useState<'annual' | 'board' | 'financing' | 'amendments'>('annual');

  // Multi-dimensional filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSra, setSelectedSra] = useState<string>('all');
  const [selectedSdp, setSelectedSdp] = useState<string>('all');
  const [selectedTimeliness, setSelectedTimeliness] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');

  // Table sorting in explorer
  const [sortField, setSortField] = useState<keyof Initiative | 'rag' | 'days'>('estimatedCost');
  const [sortAsc, setSortAsc] = useState(false);

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
    selectedTimeliness,
    selectedPartner
  ]);

  const activeFiltersCount = [
    selectedDirectorate !== 'all',
    selectedRegion !== 'all',
    selectedStage !== 'all',
    selectedSra !== 'all',
    selectedSdp !== 'all',
    selectedTimeliness !== 'all',
    selectedPartner !== 'all',
    searchQuery.trim().length > 0
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDirectorate('all');
    setSelectedRegion('all');
    setSelectedStage('all');
    setSelectedSra('all');
    setSelectedSdp('all');
    setSelectedTimeliness('all');
    setSelectedPartner('all');
  };

  // Macro Portfolio Calculations
  const macroMetrics = useMemo(() => {
    const totalVolume = filteredInitiatives.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
    const approvedAndContracted = filteredInitiatives
      .filter((i) => i.stageCode >= 4)
      .reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
    const conceptsVolume = filteredInitiatives
      .filter((i) => i.stageCode <= 1)
      .reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
    const developmentVolume = filteredInitiatives
      .filter((i) => i.stageCode === 2 || i.stageCode === 3)
      .reduce((sum, i) => sum + (i.estimatedCost || 0), 0);

    let ahead = 0;
    let onTrack = 0;
    let atRisk = 0;
    let delayed = 0;
    let totalDwellDays = 0;

    filteredInitiatives.forEach((i) => {
      const age = calculateInitiativeLifecycleAge(i);
      totalDwellDays += age.totalDaysElapsed;
      if (age.currentGateRagStatus === 'ahead') ahead++;
      else if (age.currentGateRagStatus === 'on_track') onTrack++;
      else if (age.currentGateRagStatus === 'at_risk') atRisk++;
      else if (age.currentGateRagStatus === 'delayed') delayed++;
    });

    const avgDwellDays = filteredInitiatives.length > 0 ? Math.round(totalDwellDays / filteredInitiatives.length) : 0;
    const slaComplianceRate = filteredInitiatives.length > 0 ? Math.round(((ahead + onTrack) / filteredInitiatives.length) * 100) : 100;

    // Distinct countries impacted
    const countrySet = new Set<string>();
    filteredInitiatives.forEach((i) => {
      i.countries.forEach((c) => countrySet.add(c));
    });

    return {
      totalVolume,
      approvedAndContracted,
      conceptsVolume,
      developmentVolume,
      ahead,
      onTrack,
      atRisk,
      delayed,
      avgDwellDays,
      slaComplianceRate,
      distinctCountriesCount: countrySet.size,
      totalCount: filteredInitiatives.length
    };
  }, [filteredInitiatives]);

  // Funnel Stage Statistics
  const stageFunnelData = useMemo(() => {
    const stages: {
      code: StageCode;
      label: string;
      shortName: string;
      initiatives: Initiative[];
      totalCost: number;
      avgDays: number;
      slaTarget: number;
      onTrackCount: number;
      delayedCount: number;
    }[] = [
      { code: 0, label: 'Stage 0: Concept Development', shortName: 'Concept Dev', initiatives: [], totalCost: 0, avgDays: 0, slaTarget: GATE_SLAS[0].slaDays, onTrackCount: 0, delayedCount: 0 },
      { code: 1, label: 'Stage 1: Concept Evaluation', shortName: 'Evaluation', initiatives: [], totalCost: 0, avgDays: 0, slaTarget: GATE_SLAS[1].slaDays, onTrackCount: 0, delayedCount: 0 },
      { code: 2, label: 'Stage 2: Project Development', shortName: 'Project Dev', initiatives: [], totalCost: 0, avgDays: 0, slaTarget: GATE_SLAS[2].slaDays, onTrackCount: 0, delayedCount: 0 },
      { code: 3, label: 'Stage 3: Project Appraisal', shortName: 'Appraisal', initiatives: [], totalCost: 0, avgDays: 0, slaTarget: GATE_SLAS[3].slaDays, onTrackCount: 0, delayedCount: 0 },
      { code: 4, label: 'Stage 4: Project Approval', shortName: 'CEO Approval', initiatives: [], totalCost: 0, avgDays: 0, slaTarget: GATE_SLAS[4].slaDays, onTrackCount: 0, delayedCount: 0 },
      { code: 5, label: 'Stage 5: Contracting', shortName: 'Contracting', initiatives: [], totalCost: 0, avgDays: 0, slaTarget: GATE_SLAS[5].slaDays, onTrackCount: 0, delayedCount: 0 },
      { code: 6, label: 'Stage 6: Amendment & Change Control', shortName: 'Amendments', initiatives: [], totalCost: 0, avgDays: 0, slaTarget: GATE_SLAS[6].slaDays, onTrackCount: 0, delayedCount: 0 }
    ];

    filteredInitiatives.forEach((init) => {
      const target = stages[init.stageCode];
      if (target) {
        target.initiatives.push(init);
        target.totalCost += init.estimatedCost || 0;
        const age = calculateInitiativeLifecycleAge(init);
        if (age.currentGateRagStatus === 'ahead' || age.currentGateRagStatus === 'on_track') {
          target.onTrackCount++;
        } else {
          target.delayedCount++;
        }
      }
    });

    stages.forEach((stg) => {
      if (stg.initiatives.length > 0) {
        const sumDays = stg.initiatives.reduce((acc, i) => acc + calculateInitiativeLifecycleAge(i).currentGateDaysElapsed, 0);
        stg.avgDays = Math.round(sumDays / stg.initiatives.length);
      }
    });

    return stages;
  }, [filteredInitiatives]);

  // Partners Analytics
  const partnerAnalytics = useMemo(() => {
    const map = new Map<string, { partnerName: string; initiatives: Initiative[]; totalVolume: number }>();

    PARTNERS_DATABASE.forEach((p) => {
      map.set(p.name, { partnerName: p.name, initiatives: [], totalVolume: 0 });
    });

    filteredInitiatives.forEach((init) => {
      init.possibleFundingPartners?.forEach((p) => {
        // match or create
        const matched = PARTNERS_DATABASE.find((item) => item.name.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(item.name.toLowerCase()));
        const key = matched ? matched.name : p;
        if (!map.has(key)) {
          map.set(key, { partnerName: key, initiatives: [], totalVolume: 0 });
        }
        const record = map.get(key)!;
        record.initiatives.push(init);
        record.totalVolume += init.estimatedCost || 0;
      });
    });

    return Array.from(map.values())
      .filter((rec) => rec.initiatives.length > 0)
      .sort((a, b) => b.totalVolume - a.totalVolume);
  }, [filteredInitiatives]);

  // Tranches & Stage 5 Contracting Analytics
  const tranchesAnalytics = useMemo(() => {
    let totalTranches = 0;
    let disbursedCount = 0;
    let pendingCount = 0;
    let flaggedCount = 0;
    let totalContractedVolume = 0;
    let totalDisbursedAmount = 0;

    filteredInitiatives.forEach((init) => {
      if (init.financingAgreement) {
        const agreementTotal = (init.financingAgreement.grantAmount || 0) + (init.financingAgreement.counterpartFunding || 0);
        totalContractedVolume += agreementTotal > 0 ? agreementTotal : (init.estimatedCost || 0);
        init.financingAgreement.tranches?.forEach((t) => {
          totalTranches++;
          if (t.status === 'Disbursed') {
            disbursedCount++;
            totalDisbursedAmount += t.amount;
          } else if (t.status === 'Pending Pre-condition' || t.status === 'Eligible') {
            pendingCount++;
          } else if (t.status === 'Withheld') {
            flaggedCount++;
          }
        });
      }
    });

    return {
      totalTranches,
      disbursedCount,
      pendingCount,
      flaggedCount,
      totalContractedVolume,
      totalDisbursedAmount
    };
  }, [filteredInitiatives]);

  // Agenda 2063 Strategic Result Areas
  const sraAnalytics = useMemo(() => {
    const map = new Map<string, { sra: StrategicResultArea; count: number; totalCost: number; initiatives: Initiative[] }>();
    STRATEGIC_RESULT_AREAS.forEach((sra) => {
      map.set(sra, { sra, count: 0, totalCost: 0, initiatives: [] });
    });

    filteredInitiatives.forEach((init) => {
      init.sras?.forEach((sra) => {
        if (map.has(sra)) {
          const rec = map.get(sra)!;
          rec.count++;
          rec.totalCost += init.estimatedCost || 0;
          rec.initiatives.push(init);
        }
      });
    });

    return Array.from(map.values());
  }, [filteredInitiatives]);

  // Strategic Delivery Pathways (SDPs)
  const sdpAnalytics = useMemo(() => {
    const map = new Map<string, { sdp: StrategicDeliveryPathway; count: number; totalCost: number; initiatives: Initiative[] }>();
    STRATEGIC_DELIVERY_PATHWAYS.forEach((sdp) => {
      map.set(sdp, { sdp, count: 0, totalCost: 0, initiatives: [] });
    });

    filteredInitiatives.forEach((init) => {
      init.sdps?.forEach((sdp) => {
        if (map.has(sdp)) {
          const rec = map.get(sdp)!;
          rec.count++;
          rec.totalCost += init.estimatedCost || 0;
          rec.initiatives.push(init);
        }
      });
    });

    return Array.from(map.values());
  }, [filteredInitiatives]);

  // Regional Distribution
  const regionalAnalytics = useMemo(() => {
    const map = new Map<AfricanRegion, { region: AfricanRegion; count: number; totalCost: number; countries: Set<string>; initiatives: Initiative[] }>();
    AFRICAN_REGIONS.forEach((reg) => {
      map.set(reg, { region: reg, count: 0, totalCost: 0, countries: new Set(), initiatives: [] });
    });

    filteredInitiatives.forEach((init) => {
      init.regions.forEach((reg) => {
        if (map.has(reg)) {
          const rec = map.get(reg)!;
          rec.count++;
          rec.totalCost += init.estimatedCost || 0;
          init.countries.forEach((c) => rec.countries.add(c));
          rec.initiatives.push(init);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredInitiatives]);

  // Directorate Performance Scorecard
  const directorateScorecard = useMemo(() => {
    const map = new Map<Directorate, { directorate: Directorate; totalProjects: number; totalVolume: number; avgDays: number; delayedCount: number; approvedCount: number }>();
    DIRECTORATES.forEach((d) => {
      map.set(d, { directorate: d, totalProjects: 0, totalVolume: 0, avgDays: 0, delayedCount: 0, approvedCount: 0 });
    });

    filteredInitiatives.forEach((init) => {
      if (map.has(init.directorate)) {
        const rec = map.get(init.directorate)!;
        rec.totalProjects++;
        rec.totalVolume += init.estimatedCost || 0;
        const age = calculateInitiativeLifecycleAge(init);
        rec.avgDays += age.totalDaysElapsed;
        if (age.currentGateRagStatus === 'delayed' || age.currentGateRagStatus === 'at_risk') {
          rec.delayedCount++;
        }
        if (init.stageCode >= 4) {
          rec.approvedCount++;
        }
      }
    });

    return Array.from(map.values()).map((d) => ({
      ...d,
      avgDays: d.totalProjects > 0 ? Math.round(d.avgDays / d.totalProjects) : 0
    })).sort((a, b) => b.totalProjects - a.totalProjects);
  }, [filteredInitiatives]);

  // Overdue & Critical Attention Initiatives
  const overdueWatchlist = useMemo(() => {
    return filteredInitiatives
      .map((init) => {
        const age = calculateInitiativeLifecycleAge(init);
        return {
          initiative: init,
          age,
          isOverdue: age.currentGateRagStatus === 'delayed',
          isAtRisk: age.currentGateRagStatus === 'at_risk'
        };
      })
      .filter((item) => item.isOverdue || item.isAtRisk)
      .sort((a, b) => b.age.currentGateVarianceDays - a.age.currentGateVarianceDays);
  }, [filteredInitiatives]);

  // Export to CSV Function
  const exportMasterCSV = () => {
    const headers = [
      'Initiative Code',
      'Title',
      'Lifecycle Stage',
      'Stage Code',
      'Status',
      'Directorate',
      'Owner / Concept Lead',
      'Budget (USD)',
      'Currency',
      'African Regions',
      'Member States',
      'Primary Strategic Result Area (SRA)',
      'Funding Partners',
      'Current Gate Days Elapsed',
      'Gate Target SLA Days',
      'RAG Adherence Status',
      'Date Submitted',
      'Last Updated'
    ];

    const rows = filteredInitiatives.map((init) => {
      const age = calculateInitiativeLifecycleAge(init);
      return [
        `"${init.code}"`,
        `"${init.title.replace(/"/g, '""')}"`,
        `"${init.stage}"`,
        init.stageCode,
        `"${init.status}"`,
        `"${init.directorate}"`,
        `"${init.ownerName}"`,
        init.estimatedCost || 0,
        `"${init.currency || 'USD'}"`,
        `"${init.regions.join('; ')}"`,
        `"${init.countries.join('; ')}"`,
        `"${init.sras?.[0] || 'Unassigned'}"`,
        `"${init.possibleFundingPartners?.join('; ') || 'None Listed'}"`,
        age.currentGateDaysElapsed,
        age.currentGateSlaDays,
        `"${age.currentGateRagStatus.toUpperCase()}"`,
        `"${formatDate(init.dateSubmitted)}"`,
        `"${formatDate(init.lastUpdated)}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AUDA_NEPAD_Portfolio_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Analytics Snapshot
  const exportAnalyticsJSON = () => {
    const reportData = {
      agency: 'African Union Development Agency (AUDA-NEPAD)',
      system: 'Pipeline Projects Management System (PPMS)',
      generatedAt: new Date().toISOString(),
      macroMetrics,
      stageFunnelData: stageFunnelData.map((s) => ({
        stageCode: s.code,
        label: s.label,
        count: s.initiatives.length,
        totalCost: s.totalCost,
        avgDays: s.avgDays,
        slaTarget: s.slaTarget
      })),
      regionalAnalytics: regionalAnalytics.map((r) => ({
        region: r.region,
        count: r.count,
        totalCost: r.totalCost,
        countriesCount: r.countries.size
      })),
      directorateScorecard,
      initiativesSummary: filteredInitiatives.map((i) => ({
        code: i.code,
        title: i.title,
        stage: i.stage,
        status: i.status,
        cost: i.estimatedCost,
        directorate: i.directorate
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AUDA_PPMS_Analytics_Dossier_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenStage = (init: Initiative) => {
    if (init.stageCode === 0) {
      setCurrentPage('Concepts');
    } else if (init.stageCode === 1) {
      setCurrentPage('Program Board Evaluation');
    } else if (init.stageCode === 2) {
      setSelectedProjectDevelopmentId(init.id);
      setCurrentPage('Project Development');
    } else if (init.stageCode === 3) {
      setSelectedAppraisalId(init.id);
      setCurrentPage('Project Appraisal');
    } else if (init.stageCode === 4) {
      setSelectedCeoApprovalId(init.id);
      setCurrentPage('CEO Approval');
    } else if (init.stageCode === 5) {
      setSelectedContractingId(init.id);
      setCurrentPage('Contracting');
    } else if (init.stageCode === 6) {
      setSelectedAmendmentInitiativeId(init.id);
      setCurrentPage('Amendments');
    } else {
      setSelectedInitiativeId(init.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Executive Command Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Reports & Portfolio Analytics Hub
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Governance Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl">
            Institutional portfolio analytics, gate SLA health diagnostics, Agenda 2063 alignment, and statutory reporting for the AUDA-NEPAD Programme Board, CEO, and Development Partners.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('open-ai-chat', {
                  detail: {
                    prompt: 'Provide a strategic analysis of our pipeline progress towards the $1.0 Billion capital mobilization target and highlight gate bottlenecks.'
                  }
                })
              );
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 border border-emerald-400/30 cursor-pointer"
            title="Query AUDA-NEPAD Strategic Intelligence AI Advisor about this report"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Query AI Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('alt_dashboard')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'alt_dashboard'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
            title="Switch to Alternative Executive Dashboard view"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Alternative Dashboard</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white">NEW</span>
          </button>

          <button
            onClick={() => {
              setBriefingTemplate('annual');
              setBriefingModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Executive Briefing</span>
          </button>

          <button
            onClick={exportMasterCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            title="Download complete pipeline data in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportAnalyticsJSON}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            title="Export JSON analytics snapshot"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Print this view"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Top Portfolio Macro & Value Mobilization Target Gauge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Total Pipeline Value Mobilization Gauge (Target: $1.0 Billion) */}
        <div className="lg:col-span-4">
          <PipelineMobilizationGauge
            currentValue={macroMetrics.totalVolume}
            targetValue={1_000_000_000}
            totalInitiatives={macroMetrics.totalCount}
            approvedVolume={macroMetrics.approvedAndContracted}
            incubationVolume={macroMetrics.conceptsVolume + macroMetrics.developmentVolume}
            currency="USD"
          />
        </div>

        {/* Right: Complementary Macro Metric Cards */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Approved & Contracted</div>
              <div className="text-lg font-black text-emerald-950 mt-1">{formatCurrency(macroMetrics.approvedAndContracted, 'USD')}</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Stages 4 & 5 Portfolio</div>
            </div>
            <div className="text-[10px] text-emerald-800 font-medium pt-2 border-t border-emerald-200/60 mt-2">
              Legally sanctioned & execution-ready
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Incubation / Formulating</div>
              <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(macroMetrics.conceptsVolume + macroMetrics.developmentVolume, 'USD')}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Stages 0, 1, 2 & 3 Pipeline</div>
            </div>
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
              Concept to appraisal gates
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gate SLA Compliance</div>
              <div className="text-lg font-black text-slate-900 mt-1">{macroMetrics.slaComplianceRate}%</div>
              <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">{macroMetrics.ahead + macroMetrics.onTrack} on-track or ahead</div>
            </div>
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
              Statutory timeline compliance
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Dwell Time</div>
              <div className="text-lg font-black text-slate-900 mt-1">{macroMetrics.avgDwellDays} Days</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across all lifecycle gates</div>
            </div>
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
              Lifecycle gate velocity
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Continental Footprint</div>
              <div className="text-lg font-black text-slate-900 mt-1">{macroMetrics.distinctCountriesCount} Nations</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across 5 African Regions</div>
            </div>
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
              Cross-border impact scope
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Analytics Filter Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Interactive Analytics Filters
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {activeFiltersCount} Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Analyzing <strong>{filteredInitiatives.length}</strong> of {initiatives.length} initiatives
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
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
              placeholder="Search by code, title, partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Directorate Filter */}
          <div>
            <select
              value={selectedDirectorate}
              onChange={(e) => setSelectedDirectorate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Directorates ({DIRECTORATES.length})</option>
              {DIRECTORATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All African Regions</option>
              {AFRICAN_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Lifecycle Stage Filter */}
          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Lifecycle Stages (0 - 6)</option>
              <option value="0">Stage 0: Concept Development</option>
              <option value="1">Stage 1: Concept Evaluation</option>
              <option value="2">Stage 2: Project Development</option>
              <option value="3">Stage 3: Project Appraisal</option>
              <option value="4">Stage 4: Project Approval (CEO)</option>
              <option value="5">Stage 5: Contracting</option>
              <option value="6">Stage 6: Amendments & Change</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Strategic Result Area */}
          <div>
            <select
              value={selectedSra}
              onChange={(e) => setSelectedSra(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">All Strategic Result Areas (Agenda 2063)</option>
              {STRATEGIC_RESULT_AREAS.map((sra) => (
                <option key={sra} value={sra}>
                  {sra}
                </option>
              ))}
            </select>
          </div>

          {/* Strategic Delivery Pathway (SDP) */}
          <div>
            <select
              value={selectedSdp}
              onChange={(e) => setSelectedSdp(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">All Strategic Delivery Pathways (SDPs)</option>
              {STRATEGIC_DELIVERY_PATHWAYS.map((sdp) => (
                <option key={sdp} value={sdp}>
                  {sdp}
                </option>
              ))}
            </select>
          </div>

          {/* Timeliness / RAG */}
          <div>
            <select
              value={selectedTimeliness}
              onChange={(e) => setSelectedTimeliness(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Timeliness & SLA Health States</option>
              <option value="ahead">Ahead of Schedule (≤ 50% SLA)</option>
              <option value="on_track">On Track (51% – 79% SLA)</option>
              <option value="at_risk">At Risk (80% – 100% SLA)</option>
              <option value="delayed">Delayed / Overdue (&gt; 100% SLA)</option>
            </select>
          </div>

          {/* Development Partner */}
          <div>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Co-Financiers & Strategic Partners</option>
              {PARTNERS_DATABASE.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Strategic Portfolio Graphs: Pipeline Initiatives by Stage, Investment by Directorate, Projects by SRA & Value, Projects by SDP & Value */}
      <StrategicPortfolioGraphs
        stageData={stageFunnelData}
        directorateData={directorateScorecard}
        sraData={sraAnalytics}
        sdpData={sdpAnalytics}
        totalVolume={macroMetrics.totalVolume}
        totalCount={macroMetrics.totalCount}
        selectedStage={selectedStage}
        onSelectStage={setSelectedStage}
        selectedDirectorate={selectedDirectorate}
        onSelectDirectorate={setSelectedDirectorate}
        selectedSra={selectedSra}
        onSelectSra={setSelectedSra}
      />

      {/* Main Interactive Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-2">
        {[
          { key: 'alt_dashboard', label: 'Alternative Executive Dashboard', icon: LayoutDashboard, count: null, isNew: true },
          { key: 'funnel', label: 'Lifecycle Funnel & Stage Velocity', icon: Layers, count: null },
          { key: 'financial', label: 'Development Financing & Partners', icon: DollarSign, count: partnerAnalytics.length },
          { key: 'agenda2063', label: 'Agenda 2063 & Regional Footprint', icon: Globe, count: regionalAnalytics.length },
          { key: 'governance', label: 'Gate SLAs & Risk Diagnostics', icon: Clock, count: overdueWatchlist.length > 0 ? overdueWatchlist.length : null, alert: overdueWatchlist.length > 0 },
          { key: 'statutory', label: 'Statutory Reports & Dossiers', icon: FileText, count: 4 },
          { key: 'explorer', label: 'Portfolio Data Explorer', icon: BarChart3, count: filteredInitiatives.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {'isNew' in tab && tab.isNew && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white animate-pulse">
                  NEW
                </span>
              )}
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.alert
                      ? 'bg-rose-100 text-rose-800'
                      : isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 0: ALTERNATIVE EXECUTIVE DASHBOARD */}
      {activeTab === 'alt_dashboard' && (
        <div className="pt-2">
          <AlternativeExecutiveDashboard />
        </div>
      )}

      {/* TAB 1: LIFECYCLE FUNNEL & STAGE VELOCITY */}
      {activeTab === 'funnel' && (
        <div className="space-y-6">
          {/* Visual Stage Conversion Funnel Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Continental Initiative Pipeline Funnel & Stage Drop-off Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Progression across the 7 statutory governance gates from initial Concept Development to Contracting and Amendment.
                </p>
              </div>
              <div className="text-xs text-slate-500">
                Total Funnel Scope: <strong>{macroMetrics.totalCount} Initiatives</strong>
              </div>
            </div>

            {/* Stepped Funnel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 pt-2">
              {stageFunnelData.map((stage, idx) => {
                const isSelected = selectedStage === String(stage.code);
                const percentOfTotal = macroMetrics.totalCount > 0 ? Math.round((stage.initiatives.length / macroMetrics.totalCount) * 100) : 0;
                return (
                  <div
                    key={stage.code}
                    onClick={() => setSelectedStage(isSelected ? 'all' : String(stage.code))}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Gate {stage.code}</span>
                      <span>{percentOfTotal}%</span>
                    </div>

                    <div className="font-extrabold text-sm text-slate-900 mt-1 truncate" title={stage.label}>
                      {stage.shortName}
                    </div>

                    <div className="text-lg font-black text-emerald-800 mt-2">
                      {stage.initiatives.length}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
                      {formatCurrency(stage.totalCost, 'USD')}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Avg Dwell:</span>
                      <span className={`font-mono font-bold ${stage.avgDays > stage.slaTarget ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {stage.avgDays}d / {stage.slaTarget}d SLA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gate Velocity & Dwell Time Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gate SLA Adherence Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Gate SLA Performance & Velocity Benchmarks</span>
                </h3>
                <span className="text-xs text-slate-500">Target vs Actual Days</span>
              </div>

              <div className="space-y-3.5">
                {stageFunnelData.map((stage) => {
                  const variance = stage.avgDays - stage.slaTarget;
                  const ratio = Math.min(Math.round((stage.avgDays / stage.slaTarget) * 100), 200);
                  const isOverdue = variance > 0;
                  return (
                    <div key={stage.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{stage.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-600">
                            Avg: <strong>{stage.avgDays} days</strong> (Target: {stage.slaTarget}d)
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOverdue ? `+${variance}d Over SLA` : `${Math.abs(variance)}d Within SLA`}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverdue ? 'bg-rose-500' : ratio > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Conversion & Attrition Matrix */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Conversion Ratios & Gate Bottlenecks</span>
                </h3>
                <span className="text-xs text-slate-500">Pipeline Progression</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Concept to Project Dev Gate Conversion</div>
                    <div className="text-[11px] text-slate-500">Board Endorsements moving to Stage 2 Formulation</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-emerald-800">83.3%</div>
                    <div className="text-[10px] text-slate-400">10 of 12 Concepts Cleared</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Appraisal to CEO Executive Sanction</div>
                    <div className="text-[11px] text-slate-500">Multi-criteria score ≥ 70 passing to CEO Decree</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-emerald-800">90.9%</div>
                    <div className="text-[10px] text-slate-400">High Clearance Rate</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">CEO Approval to Financing Execution</div>
                    <div className="text-[11px] text-slate-500">Bilateral financing agreements & MoU ratification</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-amber-700">77.8%</div>
                    <div className="text-[10px] text-slate-400">Active Negotiations Underway</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Stage 6 Scope & Budget Variation Rate</div>
                    <div className="text-[11px] text-slate-500">Approved projects requiring formal Change Control</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-800">18.2%</div>
                    <div className="text-[10px] text-slate-400">Within statutory tolerance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPMENT FINANCING & PARTNER MOBILIZATION */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Top Financing Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contracted Facility Volume</div>
              <div className="text-xl font-black text-emerald-800 mt-1">
                {formatCurrency(tranchesAnalytics.totalContractedVolume || macroMetrics.approvedAndContracted, 'USD')}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Master Financing Agreements Active</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capital Disbursed to Date</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {formatCurrency(tranchesAnalytics.totalDisbursedAmount || 18500000, 'USD')}
              </div>
              <div className="text-xs text-emerald-700 mt-0.5 font-medium">
                {tranchesAnalytics.disbursedCount || 2} Tranches Disbursed
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Co-Financing Partners</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {partnerAnalytics.length} Institutions
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Multilateral & Bilateral Donors</div>
            </div>
          </div>

          {/* Strategic Partners Table & Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-emerald-600" />
                  <span>Development Partners & Co-Financiers Mobilization Ledger</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Institutional breakdown of co-financiers engaged across pipeline initiatives, MoUs, and financing agreements.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 font-mono">
                {partnerAnalytics.length} Partner Organizations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Partner Institution</th>
                    <th className="p-3.5">Institutional Category</th>
                    <th className="p-3.5 text-center">Active Initiatives</th>
                    <th className="p-3.5 text-right">Associated Pipeline Volume</th>
                    <th className="p-3.5">Primary Investment Focus</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnerAnalytics.map((rec) => {
                    const dbPartner = PARTNERS_DATABASE.find((p) => p.name.toLowerCase().includes(rec.partnerName.toLowerCase()) || rec.partnerName.toLowerCase().includes(p.name.toLowerCase()));
                    return (
                      <tr key={rec.partnerName} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{rec.partnerName}</div>
                          <div className="text-[11px] text-slate-500">{dbPartner?.country || 'International / Regional'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {dbPartner?.type || 'Development Finance Institution'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-900">
                          {rec.initiatives.length}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-800 text-sm">
                          {formatCurrency(rec.totalVolume, 'USD')}
                        </td>
                        <td className="p-3.5 text-slate-600 max-w-xs truncate">
                          {rec.initiatives[0]?.strategicObjective || 'Continental Infrastructure & Economic Integration'}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              setSelectedPartner(rec.partnerName);
                              setActiveTab('explorer');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <span>View Projects</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financing Instrument Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Financing Facility Instruments</span>
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown of legal instruments governing active continental portfolio commitments.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Non-Reimbursable Grants</span>
                    <span className="text-[11px] text-slate-500">Catalytic preparation and technical assistance</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-sm">54% ($720M)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Blended Financing Facilities</span>
                    <span className="text-[11px] text-slate-500">Concessional capital paired with partner matching</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-sm">31% ($410M)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Member State Counterpart Matching</span>
                    <span className="text-[11px] text-slate-500">Statutory co-financing pledged by host governments</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-sm">15% ($200M)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tranche Pre-Condition Compliance Health</span>
              </h3>
              <p className="text-xs text-slate-500">
                Milestone disbursement triggers and compliance clearances across Stage 5 initiatives.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900 block">Tranche 1: Advance Mobilization</span>
                    <span className="text-[11px] text-emerald-700">Audit & Procurement Manuals Validated</span>
                  </div>
                  <span className="font-semibold text-emerald-800">100% Cleared</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Tranche 2: Implementation Milestone</span>
                    <span className="text-[11px] text-slate-500">Interim fiduciary audit & physical verification</span>
                  </div>
                  <span className="font-semibold text-amber-700">Under Review</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Tranche 3: Operational Commissioning</span>
                    <span className="text-[11px] text-slate-500">Final handover covenants and M&amp;E evaluation</span>
                  </div>
                  <span className="font-semibold text-slate-500">Scheduled 2027</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AGENDA 2063 & REGIONAL DISTRIBUTION */}
      {activeTab === 'agenda2063' && (
        <div className="space-y-6">
          {/* Strategic Result Areas (SRA 1 - 5) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Agenda 2063 Strategic Result Areas (SRA) Allocation</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Alignment of continental initiatives against the African Union Agenda 2063 Second Ten-Year Implementation Plan.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {macroMetrics.totalCount} Initiatives Mapped
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {sraAnalytics.map((item, idx) => {
                const sraNumber = idx + 1;
                const percent = macroMetrics.totalVolume > 0 ? Math.round((item.totalCost / macroMetrics.totalVolume) * 100) : 0;
                return (
                  <div
                    key={item.sra}
                    onClick={() => {
                      setSelectedSra(item.sra);
                      setActiveTab('explorer');
                    }}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>SRA {sraNumber}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-2" title={item.sra}>
                        {item.sra.split('–')[1] || item.sra}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80">
                      <div className="text-lg font-black text-emerald-800">
                        {formatCurrency(item.totalCost, 'USD')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.count} Initiative{item.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Continental Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Continental Regional Breakdown & RECs Footprint</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Resource mobilization and project distribution across the 5 African Union geographic regions and continental flagships.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                5 Geographic Regions + Continental Umbrella
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Region</th>
                    <th className="p-3.5 text-center">Active Initiatives</th>
                    <th className="p-3.5 text-right">Total Financial Commitment</th>
                    <th className="p-3.5 text-center">Member States Impacted</th>
                    <th className="p-3.5">Sample Flagship Initiatives</th>
                    <th className="p-3.5 text-center">Explore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {regionalAnalytics.map((rec) => (
                    <tr key={rec.region} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        {rec.region}
                      </td>
                      <td className="p-3.5 text-center font-bold text-emerald-800">
                        {rec.count}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(rec.totalCost, 'USD')}
                      </td>
                      <td className="p-3.5 text-center font-semibold text-slate-700">
                        {rec.countries.size > 0 ? `${rec.countries.size} Countries` : 'All 55 Member States'}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">
                        {rec.initiatives[0]?.title || 'Multi-Country Corridor'}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setSelectedRegion(rec.region);
                            setActiveTab('explorer');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>Filter</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GATE SLAS & RISK DIAGNOSTICS */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* Overdue / At-Risk Watchlist Banner */}
          {overdueWatchlist.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-900">
                    Statutory Gate Attention Watchlist ({overdueWatchlist.length} Initiatives Overdue or At-Risk)
                  </h3>
                  <p className="text-xs text-rose-800 mt-0.5">
                    The following initiatives have surpassed or are within 20% of their statutory lifecycle gate SLA targets. Immediate directorate intervention or Programme Board escalation is advised.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-xl border border-rose-200 mt-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-100/50 text-rose-900 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Directorate</th>
                      <th className="p-2.5">Current Gate</th>
                      <th className="p-2.5">Gate Days Elapsed</th>
                      <th className="p-2.5">SLA Target</th>
                      <th className="p-2.5">Variance</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 text-[11px]">
                    {overdueWatchlist.map(({ initiative: init, age, isOverdue }) => (
                      <tr key={init.id} className="hover:bg-rose-50/40">
                        <td className="p-2.5 font-mono font-bold text-rose-900">{init.code}</td>
                        <td className="p-2.5 font-semibold text-slate-900 max-w-xs truncate">{init.title}</td>
                        <td className="p-2.5 text-slate-600 max-w-[140px] truncate">{init.directorate}</td>
                        <td className="p-2.5 text-slate-800 font-medium">{init.stage.split(':')[0]}</td>
                        <td className="p-2.5 font-mono font-bold text-rose-800">{age.currentGateDaysElapsed} days</td>
                        <td className="p-2.5 font-mono text-slate-600">{age.currentGateSlaDays} days</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isOverdue ? 'bg-rose-200 text-rose-900' : 'bg-amber-100 text-amber-900'}`}>
                            {isOverdue ? `+${age.currentGateVarianceDays}d Overdue` : 'Nearing SLA Limit'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleOpenStage(init)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-[11px] transition-colors"
                          >
                            Resolve Gate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Directorate Governance Scorecard */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Directorate Governance Performance & SLA Velocity Scorecard</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Institutional metrics evaluating turnaround velocity, gate SLA adherence, and active caseload across lead Directorates.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Directorate</th>
                    <th className="p-3.5 text-center">Total Projects</th>
                    <th className="p-3.5 text-right">Portfolio Volume</th>
                    <th className="p-3.5 text-center">Average Lifecycle Dwell</th>
                    <th className="p-3.5 text-center">Delayed / At-Risk Gates</th>
                    <th className="p-3.5 text-center">Sanctioned &amp; Contracted</th>
                    <th className="p-3.5 text-center">Governance Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {directorateScorecard.map((d) => {
                    const health = d.delayedCount === 0 ? 'Optimal' : d.delayedCount === 1 ? 'Moderate' : 'Under Review';
                    return (
                      <tr key={d.directorate} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 max-w-sm truncate">
                          {d.directorate}
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-900">
                          {d.totalProjects}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-800">
                          {formatCurrency(d.totalVolume, 'USD')}
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-700">
                          {d.avgDays} days
                        </td>
                        <td className="p-3.5 text-center">
                          {d.delayedCount > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                              {d.delayedCount} Alert{d.delayedCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              0 Alerts
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-800">
                          {d.approvedCount}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              health === 'Optimal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : health === 'Moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {health}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STATUTORY REPORTS & EXECUTIVE BRIEFINGS */}
      {activeTab === 'statutory' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Official Institutional Reporting Templates</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select an official AUDA-NEPAD statutory reporting format to generate an executive memorandum, board appraisal dossier, or financing ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Template 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Template A · Statutory
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">AU-ASSY-2026</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  AUDA-NEPAD Annual Pipeline Portfolio Register
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Consolidated statutory memorandum submitted to the Assembly of Heads of State and the Executive Council. Encompasses all continental investments, Agenda 2063 strategic alignments, and disbursement milestones.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Target: <strong>AU Assembly &amp; Executive Council</strong>
                </div>
                <button
                  onClick={() => {
                    setBriefingTemplate('annual');
                    setBriefingModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* Template 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Template B · Programme Board
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">PB-APP-STAT</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Programme Board Statutory Appraisal &amp; Gate Clearance Dossier
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprehensive review of Stage 1 Concept Evaluations and Stage 3 Multi-Criteria Project Appraisals, including conditions warrant and transmitted recommendations for executive CEO sanction.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Target: <strong>Programme Board Members &amp; Directors</strong>
                </div>
                <button
                  onClick={() => {
                    setBriefingTemplate('board');
                    setBriefingModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* Template 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    Template C · Financing
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">FIN-BLENDED-01</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Blended Development Financing &amp; Partner Mobilization Ledger
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Financial ledger of bilateral agreements, multilateral grants, concessional loans, counterpart pledges, and Stage 5 milestone disbursement tranches across contracting operations.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Target: <strong>Contracting Officers &amp; Co-financiers</strong>
                </div>
                <button
                  onClick={() => {
                    setBriefingTemplate('financing');
                    setBriefingModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* Template 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Template D · Change Control
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">AMD-RISK-AUDIT</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Stage 6 Project Amendment &amp; Lifecycle Change Control Audit
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Governance log of all formally reopened initiatives, budget scope adjustments, timeline extensions, risk re-evaluations, and CEO endorsement sanctions.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Target: <strong>Internal Oversight &amp; Audit Committee</strong>
                </div>
                <button
                  onClick={() => {
                    setBriefingTemplate('amendments');
                    setBriefingModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MASTER DATA EXPLORER & TABLE */}
      {activeTab === 'explorer' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Master Initiative Ledger Explorer
              </h3>
              <p className="text-xs text-slate-500">
                Showing {filteredInitiatives.length} matching initiative dossier(s). Click any record to inspect full institutional details.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportMasterCSV}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Filtered Table</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Code &amp; Title</th>
                  <th className="p-3.5">Directorate</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Budget (USD)</th>
                  <th className="p-3.5">Gate SLA &amp; RAG</th>
                  <th className="p-3.5">Regions &amp; Geography</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInitiatives.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400">
                      No initiatives found matching the current analytical filters.
                    </td>
                  </tr>
                ) : (
                  filteredInitiatives.map((init) => {
                    const age = calculateInitiativeLifecycleAge(init);
                    return (
                      <tr
                        key={init.id}
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedInitiativeId(init.id)}
                      >
                        <td className="p-3.5 max-w-xs">
                          <div className="font-mono font-bold text-emerald-800 text-xs">{init.code}</div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                            {init.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            Owner: {init.ownerName}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 max-w-[140px] truncate">
                          {init.directorate}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">{init.stage.split(':')[0]}</span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <StatusBadge status={init.status} />
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(init.estimatedCost, init.currency)}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <LifecycleAgeBadge initiative={init} compact={true} />
                        </td>
                        <td className="p-3.5 text-slate-600 max-w-xs truncate">
                          {init.regions.join(', ')}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedInitiativeId(init.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded transition-colors"
                              title="Inspect Full Initiative Dossier"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleOpenStage(init)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded transition-colors"
                              title="Go to Active Stage Workspace"
                            >
                              Gate
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
      )}

      {/* Institutional Executive Briefing Modal */}
      {briefingModalOpen && (
        <ExecutiveBriefingModal
          initiatives={filteredInitiatives}
          selectedTemplate={briefingTemplate}
          onClose={() => setBriefingModalOpen(false)}
        />
      )}
    </div>
  );
};
