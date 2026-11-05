import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Initiative,
  StrategicResultArea,
  StrategicDeliveryPathway,
  TheoryOfChangeEntry,
  RiskItem,
  Outcome,
  DocumentItem
} from '../../types';
import { StrategicAlignmentSection } from './StrategicAlignmentSection';
import { TheoryOfChangeSection } from './TheoryOfChangeSection';
import { RiskManagementSection } from './RiskManagementSection';
import { ResultsFrameworkSection } from './ResultsFrameworkSection';
import { calculateTotalProjectBudget, calculateBudgetVariance } from '../../utils/budgetCalculations';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { StageProgressTracker } from '../common/StageProgressTracker';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import {
  Layers,
  Compass,
  GitMerge,
  ShieldAlert,
  FolderTree,
  DollarSign,
  Save,
  Send,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCheck,
  ChevronDown,
  Info,
  Calendar,
  User,
  ExternalLink,
  Printer,
  X,
  Lock,
  ArrowRight,
  Sparkles,
  Search,
  Eye
} from 'lucide-react';

export const ProjectDevelopmentWorkspace: React.FC = () => {
  const {
    initiatives,
    currentUser,
    saveProjectDevelopment,
    submitProjectForAppraisal,
    selectedProjectDevelopmentId,
    setSelectedProjectDevelopmentId,
    setCurrentPage
  } = useApp();

  // Find all projects in Stage 2 or approved for development
  const stage2Initiatives = useMemo(() => {
    return initiatives.filter(
      (i) =>
        i.stageCode === 2 ||
        i.status === 'Under Development' ||
        i.status === 'Approved for Development'
    );
  }, [initiatives]);

  // Determine active initiative: fallback to first Stage 2 project or init-6
  const activeInitiative = useMemo(() => {
    if (selectedProjectDevelopmentId) {
      const found = initiatives.find((i) => i.id === selectedProjectDevelopmentId);
      if (found) return found;
    }
    if (stage2Initiatives.length > 0) {
      return stage2Initiatives[0];
    }
    return initiatives.find((i) => i.id === 'init-6') || initiatives[0];
  }, [initiatives, selectedProjectDevelopmentId, stage2Initiatives]);

  // Working state for active initiative
  const [sras, setSras] = useState<StrategicResultArea[]>(activeInitiative.sras || []);
  const [sdps, setSdps] = useState<StrategicDeliveryPathway[]>(activeInitiative.sdps || []);
  const [narrative, setNarrative] = useState<string>(activeInitiative.strategicAlignmentNarrative || '');
  const [documents, setDocuments] = useState<DocumentItem[]>(activeInitiative.documents || []);
  const [tocEntries, setTocEntries] = useState<TheoryOfChangeEntry[]>(activeInitiative.theoryOfChangeEntries || []);
  const [risks, setRisks] = useState<RiskItem[]>(activeInitiative.risks || []);
  const [outcomes, setOutcomes] = useState<Outcome[]>(activeInitiative.outcomes || []);
  const [fundingPartners, setFundingPartners] = useState<string[]>(activeInitiative.possibleFundingPartners || []);

  // UI state
  const [activeTab, setActiveTab] = useState<'strategic' | 'toc' | 'risks' | 'results'>('strategic');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showConceptPeek, setShowConceptPeek] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [appraisalComment, setAppraisalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when active initiative changes
  useEffect(() => {
    if (activeInitiative) {
      setSras(activeInitiative.sras || []);
      setSdps(activeInitiative.sdps || []);
      setNarrative(activeInitiative.strategicAlignmentNarrative || '');
      setDocuments(activeInitiative.documents || []);
      setTocEntries(activeInitiative.theoryOfChangeEntries || []);
      setRisks(activeInitiative.risks || []);
      setOutcomes(activeInitiative.outcomes || []);
      setFundingPartners(activeInitiative.possibleFundingPartners || []);
      setSaveSuccessMessage(null);
    }
  }, [activeInitiative?.id]);

  // Calculate live roll-up budget
  const liveCalculatedBudget = useMemo(() => {
    return calculateTotalProjectBudget(outcomes);
  }, [outcomes]);

  const budgetVariance = useMemo(() => {
    return calculateBudgetVariance(activeInitiative.estimatedCost || 0, liveCalculatedBudget);
  }, [activeInitiative.estimatedCost, liveCalculatedBudget]);

  // Permission checks
  const canEdit =
    currentUser.role === 'System Administrator' ||
    currentUser.role === 'Concept Owner / Project Manager' ||
    currentUser.role === 'Directorate Director';

  const isLocked = !canEdit || activeInitiative.stageCode > 2;

  // Validation checklist evaluation
  const validationChecks = useMemo(() => {
    const hasSras = sras.length > 0;
    const hasSdps = sdps.length > 0;
    const hasNarrative = narrative.trim().length >= 40;
    const hasToc = tocEntries.length >= 2;
    const hasRisks = risks.length >= 1;
    const hasHighRiskMitigated = risks.every(
      (r) => r.severity !== 'High' || r.mitigationMeasures.trim().length > 10
    );
    const hasOutcomes = outcomes.length >= 1;
    const hasIndicators = outcomes.some((o) => (o.indicators?.length || 0) > 0);
    const hasOutputs = outcomes.some((o) => (o.outputs?.length || 0) > 0);
    const hasActivities = outcomes.some((o) =>
      o.outputs?.some((op) => (op.activities?.length || 0) > 0)
    );
    const hasBudget = liveCalculatedBudget > 0;

    const allPassed =
      hasSras &&
      hasSdps &&
      hasNarrative &&
      hasToc &&
      hasRisks &&
      hasOutcomes &&
      hasOutputs &&
      hasActivities &&
      hasBudget;

    return {
      hasSras,
      hasSdps,
      hasNarrative,
      hasToc,
      hasRisks,
      hasHighRiskMitigated,
      hasOutcomes,
      hasIndicators,
      hasOutputs,
      hasActivities,
      hasBudget,
      allPassed
    };
  }, [sras, sdps, narrative, tocEntries, risks, outcomes, liveCalculatedBudget]);

  // Document management
  const handleAddDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Save draft
  const handleSaveDraft = () => {
    saveProjectDevelopment(activeInitiative.id, {
      sras,
      sdps,
      strategicAlignmentNarrative: narrative,
      theoryOfChangeEntries: tocEntries,
      risks,
      outcomes,
      documents,
      possibleFundingPartners: fundingPartners,
      totalCalculatedBudget: liveCalculatedBudget
    });

    setSaveSuccessMessage('Draft changes saved successfully.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Submit to Stage 3
  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    // Persist latest data first
    saveProjectDevelopment(activeInitiative.id, {
      sras,
      sdps,
      strategicAlignmentNarrative: narrative,
      theoryOfChangeEntries: tocEntries,
      risks,
      outcomes,
      documents,
      possibleFundingPartners: fundingPartners,
      totalCalculatedBudget: liveCalculatedBudget
    });

    // Submit for appraisal
    submitProjectForAppraisal(
      activeInitiative.id,
      appraisalComment ||
        `Project development completed by ${currentUser.name}. Ready for Continental Board & Technical Appraisal.`
    );

    setIsSubmitting(false);
    setShowSubmitModal(false);
    setSaveSuccessMessage('Project successfully submitted for Stage 3 Project Appraisal!');
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in pb-12">
      {/* Top Breadcrumb & Project Selector Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Stage 2 Workspace
              </span>
              <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Full Project Development
              </h2>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Formulate comprehensive continental project document, strategic alignment, theory of change, risks matrix, and activity-based costing.
            </p>
          </div>
        </div>

        {/* Project Selector Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
            Active Project:
          </span>
          <div className="relative min-w-[260px]">
            <select
              value={activeInitiative.id}
              onChange={(e) => setSelectedProjectDevelopmentId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {stage2Initiatives.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} – {p.title.slice(0, 38)}...
                </option>
              ))}
              {stage2Initiatives.length === 0 && (
                <option value={activeInitiative.id}>
                  {activeInitiative.code} – {activeInitiative.title}
                </option>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowConceptPeek(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors shadow-2xs"
            title="Inspect Stage 0 Concept Problem & Objectives"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Concept Peek</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between shadow-2xs animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 font-medium text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Project Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                {activeInitiative.code}
              </span>
              <StatusBadge status={activeInitiative.status} />
              <LifecycleAgeBadge initiative={activeInitiative} compact />
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                {activeInitiative.classification}
              </span>
              {activeInitiative.isContinental && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Continental Mandate
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              {activeInitiative.title}
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px] pt-0.5">
              <span>
                <strong>Directorate:</strong> {activeInitiative.directorate}
              </span>
              <span>•</span>
              <span>
                <strong>Project Manager:</strong> {activeInitiative.projectManager || activeInitiative.ownerName}
              </span>
              <span>•</span>
              <span>
                <strong>Horizon:</strong> {activeInitiative.implementationPeriod}
              </span>
              <span>•</span>
              <span>
                <strong>Last Updated:</strong> {formatDateTime(activeInitiative.lastUpdated)}
              </span>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Document</span>
            </button>

            <button
              type="button"
              onClick={() => setShowValidationModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs transition-colors shadow-2xs"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validation Check</span>
              {validationChecks.allPassed ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {!isLocked && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-2xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>
            )}

            {!isLocked && (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Stage 3 Appraisal</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Budget & Hierarchy Indicator Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Concept Baseline
            </span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              {formatCurrency(activeInitiative.estimatedCost || 0, activeInitiative.currency)}
            </span>
          </div>

          <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">
              Rolled-Up Activity Budget
            </span>
            <span className="font-mono font-extrabold text-emerald-900 text-sm">
              {formatCurrency(liveCalculatedBudget, activeInitiative.currency)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Results Hierarchy
            </span>
            <span className="font-bold text-slate-800">
              {outcomes.length} Outcomes •{' '}
              {outcomes.reduce((s, o) => s + (o.outputs?.length || 0), 0)} Outputs
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Governance Status
            </span>
            <span className="font-bold text-slate-800">
              {validationChecks.allPassed ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Appraisal
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Draft in Progress
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Lifecycle Process Age & Gate SLAs Progression */}
        <div className="pt-2 border-t border-slate-100">
          <StageProgressTracker
            currentStageCode={activeInitiative.stageCode}
            currentStatus={activeInitiative.status}
            transitions={activeInitiative.transitions}
            initiative={activeInitiative}
          />
        </div>
      </div>

      {/* STAGE 2 WORKSPACE SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('strategic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'strategic'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>2.1 Strategic Alignment (SRAs & SDPs)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'strategic'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {sras.length + sdps.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('toc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'toc'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>2.2 Theory of Change (TOC)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'toc'
                ? 'bg-indigo-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {tocEntries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('risks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'risks'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>2.3 Risk Matrix</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'risks'
                ? 'bg-amber-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {risks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'results'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>2.4 Results Framework & Cost Roll-Up</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'results'
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {formatCurrency(liveCalculatedBudget, activeInitiative.currency)}
          </span>
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      {activeTab === 'strategic' && (
        <StrategicAlignmentSection
          sras={sras}
          sdps={sdps}
          narrative={narrative}
          fundingPartners={fundingPartners}
          documents={documents}
          onChangeSras={setSras}
          onChangeSdps={setSdps}
          onChangeNarrative={setNarrative}
          onChangeFundingPartners={setFundingPartners}
          onAddDocument={handleAddDocument}
          onDeleteDocument={handleDeleteDocument}
          currentUser={currentUser}
          isLocked={isLocked}
        />
      )}

      {activeTab === 'toc' && (
        <TheoryOfChangeSection
          entries={tocEntries}
          onChangeEntries={(newEntries) => {
            setTocEntries(newEntries);
            saveProjectDevelopment(activeInitiative.id, {
              sras,
              sdps,
              strategicAlignmentNarrative: narrative,
              theoryOfChangeEntries: newEntries,
              risks,
              outcomes,
              documents,
              totalCalculatedBudget: liveCalculatedBudget
            });
          }}
          isLocked={isLocked}
        />
      )}

      {activeTab === 'risks' && (
        <RiskManagementSection
          risks={risks}
          onChangeRisks={setRisks}
          currentUser={currentUser}
          isLocked={isLocked}
        />
      )}

      {activeTab === 'results' && (
        <ResultsFrameworkSection
          outcomes={outcomes}
          onChangeOutcomes={(newOutcomes) => {
            setOutcomes(newOutcomes);
            const calculatedTotal = calculateTotalProjectBudget(newOutcomes);
            saveProjectDevelopment(activeInitiative.id, {
              sras,
              sdps,
              strategicAlignmentNarrative: narrative,
              theoryOfChangeEntries: tocEntries,
              risks,
              outcomes: newOutcomes,
              documents,
              totalCalculatedBudget: calculatedTotal
            });
          }}
          estimatedCost={activeInitiative.estimatedCost || 0}
          currency={activeInitiative.currency || 'USD'}
          currentUser={currentUser}
          isLocked={isLocked}
        />
      )}

      {/* VALIDATION CHECKLIST MODAL */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Stage 2 Governance Validation Checklist
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Verification of mandatory statutory requirements before submission to Stage 3 Project Appraisal.
            </p>

            <div className="space-y-2.5">
              {/* SRA Check */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs bg-slate-50/60">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    1. Strategic Result Areas (SRAs)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    At least 1 SRA aligned ({sras.length} selected)
                  </div>
                </div>
                {validationChecks.hasSras ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <X className="w-3 h-3" /> Missing
                  </span>
                )}
              </div>

              {/* SDP Check */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs bg-slate-50/60">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    2. Strategic Delivery Pathways (SDPs)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    At least 1 SDP assigned ({sdps.length} selected)
                  </div>
                </div>
                {validationChecks.hasSdps ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <X className="w-3 h-3" /> Missing
                  </span>
                )}
              </div>

              {/* Narrative Check */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs bg-slate-50/60">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    3. Strategic Alignment Narrative
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Detailed justification ({narrative.trim().length} chars)
                  </div>
                </div>
                {validationChecks.hasNarrative ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <X className="w-3 h-3" /> Incomplete
                  </span>
                )}
              </div>

              {/* TOC Check */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs bg-slate-50/60">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    4. Theory of Change Framework
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Causal nodes documented ({tocEntries.length} nodes)
                  </div>
                </div>
                {validationChecks.hasToc ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <X className="w-3 h-3" /> &lt;2 Nodes
                  </span>
                )}
              </div>

              {/* Risks Check */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs bg-slate-50/60">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    5. Risk Register & Mitigations
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Scored risks with focal owners ({risks.length} recorded)
                  </div>
                </div>
                {validationChecks.hasRisks ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <X className="w-3 h-3" /> Missing
                  </span>
                )}
              </div>

              {/* Results Framework & Cost Roll-up Check */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs bg-slate-50/60">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    6. Hierarchical Results & Activity Budget
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Outcomes, outputs & activity budget ({formatCurrency(liveCalculatedBudget, activeInitiative.currency)})
                  </div>
                </div>
                {validationChecks.hasBudget && validationChecks.hasOutcomes ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pass
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <X className="w-3 h-3" /> $0 Budget
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Submit Project for Stage 3 Appraisal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to transmit <strong>{activeInitiative.code} – {activeInitiative.title}</strong> to the Continental Programme Board and Technical Secretariat for Stage 3 Technical & Financial Appraisal.
            </p>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
              <div className="font-bold text-emerald-950">Summary for Board Appraisal Dossier:</div>
              <div className="text-emerald-800 text-[11px]">
                • Calculated Project Budget: <strong>{formatCurrency(liveCalculatedBudget, activeInitiative.currency)}</strong>
              </div>
              <div className="text-emerald-800 text-[11px]">
                • Variance vs Concept Baseline: <strong>{budgetVariance.variancePercentage.toFixed(1)}%</strong>
              </div>
              <div className="text-emerald-800 text-[11px]">
                • Strategic Alignment: <strong>{sras.length} SRAs, {sdps.length} SDPs</strong>
              </div>
              <div className="text-emerald-800 text-[11px]">
                • Identified Risks: <strong>{risks.length} Scored Threats</strong>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Transmittal Notes for Board Appraisal Team
              </label>
              <textarea
                rows={3}
                value={appraisalComment}
                onChange={(e) => setAppraisalComment(e.target.value)}
                placeholder="State any specific focal points, co-financing updates, or urgent timelines..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Transmit for Appraisal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONCEPT PEEK DRAWER / MODAL */}
      {showConceptPeek && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Stage 0 Concept Reference Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConceptPeek(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Problem Statement
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {activeInitiative.problemStatement || 'None documented in concept.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Proposed Intervention
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {activeInitiative.proposedIntervention || 'None documented in concept.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Expected Beneficiaries
                  </span>
                  <p className="text-slate-800 leading-relaxed">
                    {activeInitiative.expectedBeneficiaries || 'Not specified.'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Consequences of Inaction
                  </span>
                  <p className="text-slate-800 leading-relaxed">
                    {activeInitiative.consequencesOfInaction || 'Not specified.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConceptPeek(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT PROJECT DOCUMENT MODAL / CLEAN PREVIEW */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Project Development Dossier (Stage 2 Summary)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {activeInitiative.code} • African Union Development Agency (AUDA-NEPAD)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Content */}
            <div className="space-y-5 text-xs text-slate-800">
              {/* Executive Summary */}
              <div className="border-b border-slate-100 pb-3 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{activeInitiative.title}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Directorate:</span> {activeInitiative.directorate}
                  </div>
                  <div>
                    <span className="text-slate-400">Manager:</span> {activeInitiative.projectManager || activeInitiative.ownerName}
                  </div>
                  <div>
                    <span className="text-slate-400">Total Budget:</span>{' '}
                    <strong className="font-mono text-emerald-800">
                      {formatCurrency(liveCalculatedBudget, activeInitiative.currency)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Period:</span> {activeInitiative.implementationPeriod}
                  </div>
                </div>
              </div>

              {/* Strategic Alignment */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-800">
                  2.1 AU Agenda 2063 Strategic Alignment
                </h5>
                <p className="text-slate-600 leading-relaxed">{narrative || 'None documented.'}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sras.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      {s}
                    </span>
                  ))}
                  {sdps.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Theory of Change Summary */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-800">
                  2.2 Theory of Change Causal Pathway
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tocEntries.map((e) => (
                    <div key={e.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                      <span className="font-bold uppercase text-[9px] text-indigo-700 block">
                        {e.type.replace('_', ' ')}
                      </span>
                      <span>{e.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Profile */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-800">
                  2.3 Risk Management Matrix & Mitigations
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {risks.slice(0, 4).map((r) => (
                    <div key={r.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-[10px]">
                        <span className="uppercase text-slate-500">{r.category}</span>
                        <span className="text-amber-800">{r.severity} Severity</span>
                      </div>
                      <p className="font-semibold text-slate-800 line-clamp-1">{r.description}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">Mitigation: {r.mitigationMeasures}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results Framework & Activities */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-800">
                  2.4 Results Framework & Budget Roll-Up
                </h5>
                <div className="space-y-3">
                  {outcomes.map((o) => (
                    <div key={o.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{o.outcomeNumber}: {o.narrative}</span>
                        <span className="font-mono text-emerald-800">
                          {formatCurrency(calculateTotalProjectBudget([o]), activeInitiative.currency)}
                        </span>
                      </div>
                      <div className="space-y-1 pl-3 border-l-2 border-emerald-400">
                        {o.outputs?.map((op) => (
                          <div key={op.id} className="text-[11px] flex justify-between text-slate-600">
                            <span>{op.outputNumber}: {op.narrative} ({op.activities?.length || 0} activities)</span>
                            <span className="font-mono">
                              {formatCurrency(
                                op.activities?.reduce((s, a) => s + (Number(a.cost) || 0), 0) || 0,
                                activeInitiative.currency
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
