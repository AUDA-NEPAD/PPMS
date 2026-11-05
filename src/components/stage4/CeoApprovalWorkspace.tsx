import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Initiative,
  CEOApproval,
  WorkflowTransition
} from '../../types';
import { calculateAppraisalTotalScore } from '../../utils/appraisalCriteria';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { StageProgressTracker } from '../common/StageProgressTracker';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import {
  Award,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Shield,
  Layers,
  DollarSign,
  Calendar,
  Building,
  User,
  ExternalLink,
  Printer,
  ChevronDown,
  ChevronRight,
  Info,
  Check,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  Sparkles,
  Download,
  Search,
  Sliders,
  Compass,
  AlertCircle,
  FileSignature,
  Stamp,
  CheckCheck,
  FileStack
} from 'lucide-react';

export const CeoApprovalWorkspace: React.FC = () => {
  const {
    initiatives,
    currentUser,
    selectedCeoApprovalId,
    setSelectedCeoApprovalId,
    recordCeoDecision,
    updateCeoConditionStatus,
    setSelectedInitiativeId,
    setCurrentPage
  } = useApp();

  // Role permission check: Only CEO and System Administrator can execute statutory approval directives
  const isCEO =
    currentUser.role === 'CEO' || currentUser.role === 'System Administrator';

  // Find all initiatives in Stage 4 or awaiting CEO decision
  const stage4Initiatives = useMemo(() => {
    return initiatives.filter(
      (i) =>
        i.stageCode === 4 ||
        i.status === 'Awaiting CEO Decision' ||
        i.status === 'Recommended for Approval' ||
        i.status === 'Recommended with Conditions' ||
        i.status === 'Approved' ||
        i.status === 'Conditionally Approved'
    );
  }, [initiatives]);

  // Fallback to init-8 or first available
  const activeInitiative = useMemo(() => {
    if (selectedCeoApprovalId) {
      const found = initiatives.find((i) => i.id === selectedCeoApprovalId);
      if (found) return found;
    }
    if (stage4Initiatives.length > 0) {
      return stage4Initiatives[0];
    }
    return initiatives.find((i) => i.id === 'init-8') || initiatives[0];
  }, [initiatives, selectedCeoApprovalId, stage4Initiatives]);

  // Working state for active initiative
  const [decisionType, setDecisionType] = useState<
    'Formally Approved' | 'Conditionally Approved' | 'Returned for Revision'
  >('Formally Approved');

  const [guidanceText, setGuidanceText] = useState(
    activeInitiative?.ceoApproval?.guidanceText ||
      'Executive sanction granted in accordance with AU Agenda 2063 programmatic priorities. Ensure strict compliance with procurement rules and partner co-financing covenants.'
  );

  const [refNumber, setRefNumber] = useState(
    activeInitiative?.ceoApproval?.referenceNumber ||
      `AUDA-CEO-SANCTION-2026-${String(Math.floor(100 + Math.random() * 900))}`
  );

  const [resubmissionDeadline, setResubmissionDeadline] = useState(
    activeInitiative?.ceoApproval?.resubmissionDeadline ||
      new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  // Executive conditions register
  const [conditions, setConditions] = useState<
    {
      condition: string;
      responsiblePerson: string;
      dueDate: string;
      status: 'Pending' | 'Complied' | 'Waived';
    }[]
  >(() => {
    if (activeInitiative?.ceoApproval?.conditions && activeInitiative.ceoApproval.conditions.length > 0) {
      return activeInitiative.ceoApproval.conditions;
    }
    // Pre-populate from board appraisal conditions if any
    if (activeInitiative?.boardAppraisal?.conditions && activeInitiative.boardAppraisal.conditions.length > 0) {
      return activeInitiative.boardAppraisal.conditions.map((c) => ({
        condition: c,
        responsiblePerson: activeInitiative.projectManager || activeInitiative.ownerName,
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'Pending'
      }));
    }
    return [];
  });

  const [newConditionText, setNewConditionText] = useState('');
  const [newConditionPerson, setNewConditionPerson] = useState(
    activeInitiative?.projectManager || activeInitiative?.ownerName || 'Project Manager'
  );
  const [newConditionDueDate, setNewConditionDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  // UI state
  const [activeTab, setActiveTab] = useState<'decision' | 'appraisal_review' | 'proposal_overview'>('decision');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDecreeModal, setShowDecreeModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state when activeInitiative changes
  useEffect(() => {
    if (activeInitiative) {
      if (activeInitiative.ceoApproval) {
        setGuidanceText(activeInitiative.ceoApproval.guidanceText || '');
        setRefNumber(activeInitiative.ceoApproval.referenceNumber || `AUDA-CEO-SANCTION-2026-${String(Math.floor(100 + Math.random() * 900))}`);
        setDecisionType(activeInitiative.ceoApproval.decision || 'Formally Approved');
        setConditions(activeInitiative.ceoApproval.conditions || []);
        if (activeInitiative.ceoApproval.resubmissionDeadline) {
          setResubmissionDeadline(activeInitiative.ceoApproval.resubmissionDeadline);
        }
      } else {
        setGuidanceText(
          'Executive sanction granted in accordance with AU Agenda 2063 programmatic priorities. Ensure strict compliance with procurement rules and partner co-financing covenants.'
        );
        setRefNumber(`AUDA-CEO-SANCTION-2026-${String(Math.floor(100 + Math.random() * 900))}`);
        setDecisionType('Formally Approved');
        if (activeInitiative.boardAppraisal?.conditions && activeInitiative.boardAppraisal.conditions.length > 0) {
          setConditions(
            activeInitiative.boardAppraisal.conditions.map((c) => ({
              condition: c,
              responsiblePerson: activeInitiative.projectManager || activeInitiative.ownerName,
              dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
              status: 'Pending'
            }))
          );
        } else {
          setConditions([]);
        }
      }
      setSaveSuccessMessage(null);
      setFormError(null);
    }
  }, [activeInitiative?.id]);

  // Board appraisal score summary
  const boardScoreSummary = useMemo(() => {
    if (!activeInitiative?.boardAppraisal?.ratings) return null;
    return calculateAppraisalTotalScore(activeInitiative.boardAppraisal.ratings);
  }, [activeInitiative]);

  const handleAddCondition = () => {
    if (!newConditionText.trim() || !isCEO) return;
    setConditions((prev) => [
      ...prev,
      {
        condition: newConditionText.trim(),
        responsiblePerson: newConditionPerson.trim() || 'Project Manager',
        dueDate: newConditionDueDate,
        status: 'Pending'
      }
    ]);
    setNewConditionText('');
  };

  const handleRemoveCondition = (index: number) => {
    if (!isCEO) return;
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConditionStatusToggle = (index: number, newStatus: 'Pending' | 'Complied' | 'Waived') => {
    if (!isCEO || !activeInitiative) return;
    setConditions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, status: newStatus } : c))
    );
    updateCeoConditionStatus(activeInitiative.id, index, newStatus);
    setSaveSuccessMessage(`Condition status updated to ${newStatus}.`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleExecuteDecision = () => {
    if (!activeInitiative || !isCEO) return;

    if (decisionType === 'Conditionally Approved' && conditions.length === 0) {
      setFormError('At least one binding pre-condition covenant must be specified for "Conditionally Approved".');
      return;
    }

    if (decisionType === 'Returned for Revision' && !resubmissionDeadline) {
      setFormError('A resubmission deadline date must be set for returned proposals.');
      return;
    }

    setFormError(null);
    recordCeoDecision(
      activeInitiative.id,
      decisionType,
      guidanceText,
      decisionType === 'Conditionally Approved' ? conditions : undefined,
      decisionType === 'Returned for Revision' ? resubmissionDeadline : undefined,
      refNumber
    );

    setShowConfirmModal(false);
    setSaveSuccessMessage(`CEO Executive Decision "${decisionType}" recorded successfully.`);
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  if (!activeInitiative) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">No Proposals Awaiting CEO Approval</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          All initiatives have either received executive decree or are undergoing Stage 3 Board Appraisal.
        </p>
      </div>
    );
  }

  const isAlreadyApproved =
    activeInitiative.status === 'Approved' ||
    activeInitiative.status === 'Conditionally Approved' ||
    activeInitiative.stageCode >= 5;

  return (
    <div className="space-y-6">
      {/* Top Banner: Sovereign Executive Gate */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/70 via-white to-orange-50/50">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Award className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <Stamp className="w-3 h-3 text-amber-700" />
                  <span>Stage 4: Executive CEO Sanction Gate</span>
                </span>
                <StatusBadge status={activeInitiative.status} size="sm" />
                <LifecycleAgeBadge initiative={activeInitiative} />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                {activeInitiative.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="font-mono font-bold text-slate-700">{activeInitiative.code}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {activeInitiative.directorate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Lead: {activeInitiative.projectManager || activeInitiative.ownerName}
                </span>
                <span>•</span>
                <span className="font-bold text-slate-800">
                  Requested Financing: {formatCurrency(activeInitiative.totalCalculatedBudget || activeInitiative.estimatedCost, activeInitiative.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Official Decree Preview */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setShowDecreeModal(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-all"
              title="View & Print Official Executive Sanction Order"
            >
              <FileSignature className="w-3.5 h-3.5 text-amber-200" />
              <span>Sanction Order</span>
            </button>
            <button
              onClick={() => setSelectedInitiativeId(activeInitiative.id)}
              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-purple-200 shadow-2xs cursor-pointer"
              title="View all project proposal information from Concept level to Development and Appraisal in one space"
            >
              <FileStack className="w-3.5 h-3.5 text-purple-600" />
              <span>Full Proposal Dossier</span>
            </button>
          </div>
        </div>

        {/* Stage Progress Ribbon */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200">
          <StageProgressTracker
            currentStageCode={activeInitiative.stageCode}
            currentStatus={activeInitiative.status}
            transitions={activeInitiative.transitions}
          />
        </div>

        {/* Executive Prerogative Notice Banner */}
        {!isCEO ? (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Executive Prerogative Notice:</strong> You are logged in as{' '}
                <span className="font-bold underline">{currentUser.role}</span>. In accordance with
                AUDA-NEPAD Governance Charter Article 14, formal project approval and sanction orders
                are the exclusive statutory prerogative of the <strong>Chief Executive Officer</strong> (Mrs. Nardos Bekele-Thomas)
                or <strong>System Administrator</strong>. You may inspect the executive briefing dossier in consultative mode.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              Consultative Mode
            </span>
          </div>
        ) : (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-300 text-xs text-amber-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stamp className="w-4 h-4 text-amber-700" />
              <span>
                <strong>Office of the CEO Active:</strong> Logged in with executive sanction authority.
                Your formal decision will bind the agency and instruct the Contracting Division to initiate legal execution.
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
              Executive Sanction Active
            </span>
          </div>
        )}

        {/* Executive Queue Selector Switcher */}
        <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700 flex-shrink-0">
            <Sliders className="w-3.5 h-3.5 text-amber-700" />
            <span>Executive Docket ({stage4Initiatives.length}):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {stage4Initiatives.map((init) => (
              <button
                key={init.id}
                onClick={() => setSelectedCeoApprovalId(init.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeInitiative.id === init.id
                    ? 'bg-amber-700 text-white shadow-2xs font-bold'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <span>{init.code}</span>
                <span className="text-[11px] opacity-80 max-w-[140px] truncate">{init.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMessage && (
          <div className="p-3 bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('decision')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'decision'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span>Executive Decision Console</span>
          </button>

          <button
            onClick={() => setActiveTab('appraisal_review')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'appraisal_review'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Board Appraisal</span>
            {boardScoreSummary && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                Score: {boardScoreSummary.totalScore}/100
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('proposal_overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'proposal_overview'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Executive Briefing & Strategic Multipliers</span>
          </button>
        </div>

        {/* Link to view all proposal information from concept level to development and appraisal */}
        <button
          type="button"
          onClick={() => setSelectedInitiativeId(activeInitiative.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          title="View all project proposal information from Concept level to Development and Appraisal in one space"
        >
          <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
          <span>View All Proposal Info (Concept to Appraisal)</span>
        </button>
      </div>

      {/* TAB 1: Executive Decision Console */}
      {activeTab === 'decision' && (
        <div className="space-y-6">
          {/* Executive Directive Order Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>CEO Action</span>
                </h3>
              </div>

              {/* Reference Number Field */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                  Directive Ref:
                </span>
                <input
                  type="text"
                  value={refNumber}
                  disabled={!isCEO}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="font-mono text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 w-56"
                />
              </div>
            </div>

            {/* Decision Radio Selector Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Select Executive Decision:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {[
                  {
                    value: 'Formally Approved',
                    title: 'Formally Approved (Full Sanction)',
                    desc: 'Grants definitive agency authorization. Advances to Stage 5 Contracting for immediate financing agreement execution.',
                    borderActive: 'border-emerald-500 bg-emerald-50/70 text-emerald-950',
                    badge: 'Full Approval',
                    badgeColor: 'bg-emerald-100 text-emerald-800'
                  },
                  {
                    value: 'Conditionally Approved',
                    title: 'Conditionally Approved (Covenants Attached)',
                    desc: 'Sanctions project subject to binding pre-conditions. Contracts may be negotiated but tranches remain locked until cleared.',
                    borderActive: 'border-amber-500 bg-amber-50/70 text-amber-950',
                    badge: 'Conditional',
                    badgeColor: 'bg-amber-100 text-amber-800'
                  },
                  {
                    value: 'Returned for Revision',
                    title: 'Returned for Revision (CEO Directive)',
                    desc: 'Returns proposal back to Stage 2 with executive directives and a mandatory resubmission deadline.',
                    borderActive: 'border-rose-500 bg-rose-50/70 text-rose-950',
                    badge: 'Return to PM',
                    badgeColor: 'bg-rose-100 text-rose-800'
                  }
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-col justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      decisionType === opt.value
                        ? `${opt.borderActive} shadow-xs`
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!isCEO ? 'opacity-90 cursor-not-allowed' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${opt.badgeColor}`}
                        >
                          {opt.badge}
                        </span>
                        <input
                          type="radio"
                          name="ceoDecision"
                          disabled={!isCEO}
                          checked={decisionType === opt.value}
                          onChange={() =>
                            setDecisionType(
                              opt.value as 'Formally Approved' | 'Conditionally Approved' | 'Returned for Revision'
                            )
                          }
                          className="text-amber-600 focus:ring-amber-500"
                        />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{opt.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Directive Guidance Remarks Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Remarks
                </label>
                <span className="text-[11px] text-slate-400">
                  Optional • Recorded in the Official AU Gazette & Contracting Directive
                </span>
              </div>
              <textarea
                rows={4}
                value={guidanceText}
                disabled={!isCEO}
                onChange={(e) => setGuidanceText(e.target.value)}
                placeholder="Enter executive directives, special financing terms, partner liaison instructions, or remarks (optional)..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100"
              />
            </div>

            {/* Resubmission Deadline (If Returning) */}
            {decisionType === 'Returned for Revision' && (
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Resubmission Deadline Required:</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={resubmissionDeadline}
                    disabled={!isCEO}
                    onChange={(e) => setResubmissionDeadline(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-[11px] text-rose-700">
                    Project Manager will receive an automated critical notification and workflow assignment.
                  </span>
                </div>
              </div>
            )}

            {/* Pre-Conditions Covenant Register (Shown for Conditionally Approved or if already existing) */}
            {(decisionType === 'Conditionally Approved' || conditions.length > 0) && (
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Binding Pre-Conditions Covenant Register</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Disbursement milestones will remain withheld until compliance is verified and logged.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {conditions.length} Covenant(s)
                  </span>
                </div>

                {/* Add new condition (CEO only) */}
                {isCEO && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 text-[11px] block">
                      Add Executive Pre-Condition:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={newConditionText}
                        onChange={(e) => setNewConditionText(e.target.value)}
                        placeholder="Condition requirement (e.g. Provide bilateral co-financing agreement signed by Ministry of Finance)..."
                        className="md:col-span-6 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={newConditionPerson}
                        onChange={(e) => setNewConditionPerson(e.target.value)}
                        placeholder="Responsible Officer"
                        className="md:col-span-3 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="date"
                        value={newConditionDueDate}
                        onChange={(e) => setNewConditionDueDate(e.target.value)}
                        className="md:col-span-2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        onClick={handleAddCondition}
                        className="md:col-span-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Conditions Table with Interactive Status Toggles */}
                {conditions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                    No binding pre-conditions attached.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {conditions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-amber-800 font-bold">#{idx + 1}</span>
                            <span className="font-bold text-slate-900">{item.condition}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3">
                            <span>Officer: {item.responsiblePerson}</span>
                            <span>•</span>
                            <span>Due Date: {item.dueDate}</span>
                          </div>
                        </div>

                        {/* Interactive Compliance Status Toggle */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.status === 'Complied'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : item.status === 'Waived'
                                ? 'bg-slate-100 text-slate-600 border-slate-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {item.status}
                          </span>

                          {isCEO && (
                            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                              {item.status !== 'Complied' && (
                                <button
                                  onClick={() => handleConditionStatusToggle(idx, 'Complied')}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  title="Mark as Complied with Audit Trail"
                                >
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Clear</span>
                                </button>
                              )}
                              {item.status !== 'Waived' && (
                                <button
                                  onClick={() => handleConditionStatusToggle(idx, 'Waived')}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold transition-colors"
                                  title="Waive Condition with Audit Trail"
                                >
                                  <span>Waive</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveCondition(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Error banner */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span>Sanctioning Authority: </span>
                <strong className="text-slate-800">{currentUser.name}</strong>
                <span className="text-slate-400"> ({currentUser.role})</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  disabled={!isCEO}
                  onClick={() => {
                    setFormError(null);
                    setShowConfirmModal(true);
                  }}
                  className={`px-6 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md ${
                    isCEO
                      ? 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Stamp className="w-4 h-4 text-amber-200" />
                  <span>Execute Executive Decree</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Board Appraisal */}
      {activeTab === 'appraisal_review' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-purple-700" />
                <span>Programme Board Clearances</span>
              </h3>
            </div>
            {activeInitiative.boardAppraisal && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                {activeInitiative.boardAppraisal.recommendation}
              </span>
            )}
          </div>

          {/* Link banner to view all information of project proposal from concept level to development and appraisal in one space */}
          <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50/40 to-slate-50 border border-purple-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs flex-shrink-0">
                <FileStack className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Full Project Proposal Dossier (Concept ➔ Development ➔ Appraisal)
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  View all information of the project proposal from concept level to development and appraisal in one space, including problem rationale, results framework, costing, risks, and supporting attachments.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedInitiativeId(activeInitiative.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              <span>Inspect Full Proposal Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeInitiative.boardAppraisal ? (
            <div className="space-y-6 text-xs">
              {/* Appraisal Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Appraisal Dossier ID</span>
                  <div className="font-mono font-bold text-slate-800 text-sm">
                    {activeInitiative.boardAppraisal.appraisalId}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Transmitted: {formatDate(activeInitiative.boardAppraisal.submittedDate)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Board Composite Score</span>
                  <div className="font-mono font-extrabold text-purple-700 text-lg">
                    {boardScoreSummary ? `${boardScoreSummary.totalScore}/100 pts (${boardScoreSummary.percentage}%)` : '96/100'}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    {boardScoreSummary?.gradeTier || 'Exceptional Tier A'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Sign-off Board Lead</span>
                  <div className="font-bold text-slate-800 text-sm">
                    {activeInitiative.boardAppraisal.appraisedByBoard?.join(', ') || 'Prof. Fatima Al-Mansoor'}
                  </div>
                  <div className="text-[11px] text-slate-500">Programme Board Consensus</div>
                </div>
              </div>

              {/* Board Consensus Commentary */}
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-1.5">
                <span className="font-bold text-purple-950 text-xs block">
                  Board Technical Consensus Synthesis:
                </span>
                <p className="text-purple-900 italic leading-relaxed">
                  "{activeInitiative.boardAppraisal.overallComment}"
                </p>
              </div>

              {/* Advisory Advice to CEO */}
              {activeInitiative.boardAppraisal.evidenceAdvice && (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1.5">
                  <span className="font-bold text-amber-950 text-xs block">
                    Strategic Advisory Recommendations to the CEO:
                  </span>
                  <p className="text-amber-900 leading-relaxed">
                    "{activeInitiative.boardAppraisal.evidenceAdvice}"
                  </p>
                </div>
              )}

              {/* Criteria Scorecards Table */}
              {activeInitiative.boardAppraisal.ratings && activeInitiative.boardAppraisal.ratings.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Evaluated Criteria Breakdown</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="p-3">Criterion Dimension</th>
                          <th className="p-3">Statutory Rating</th>
                          <th className="p-3 text-right">Score</th>
                          <th className="p-3">Evidentiary Findings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeInitiative.boardAppraisal.ratings.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{r.criteriaName}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.rating === 'Meets requirements'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.rating === 'Partially meets requirements'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {r.rating}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              {r.score}/{r.maxScore}
                            </td>
                            <td className="p-3 text-slate-600 max-w-md">{r.evidence}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No formal Board Appraisal recorded yet.</p>
          )}
        </div>
      )}

      {/* TAB 3: Executive Briefing & Strategic Multipliers */}
      {activeTab === 'proposal_overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Executive Proposal Summary & Continental Multipliers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block">Core Development Problem:</span>
                <p className="text-slate-600 leading-relaxed">{activeInitiative.problemStatement}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block">Proposed Continental Intervention:</span>
                <p className="text-slate-600 leading-relaxed">{activeInitiative.proposedIntervention}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Target Beneficiaries</span>
                <p className="font-bold text-slate-900">{activeInitiative.expectedBeneficiaries}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Participating Member States</span>
                <p className="font-bold text-slate-900">
                  {activeInitiative.isContinental
                    ? 'Continental (All 55 AU Member States)'
                    : activeInitiative.countries?.join(', ') || 'Regional'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Funding Consortium</span>
                <p className="font-bold text-slate-900">
                  {activeInitiative.possibleFundingPartners?.join(', ') || 'Pending Partner Agreements'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Executive Decision Confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Execute Official Presidential / CEO Sanction
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Statutory Sanction Summary:</span>
              </div>
              <p>
                You are about to issue decree <strong>{refNumber}</strong> recording decision:{' '}
                <strong className="underline">{decisionType}</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
                <li>Binds the agency and creates an immutable audit event in the governance log.</li>
                {decisionType !== 'Returned for Revision' ? (
                  <li>
                    Advances initiative to <strong>Stage 5: Contracting</strong> and alerts the Chief
                    Contracting Officer (Elena Kouame).
                  </li>
                ) : (
                  <li>
                    Returns dossier to <strong>Stage 2: Project Development</strong> with resubmission
                    deadline of {resubmissionDeadline}.
                  </li>
                )}
                {conditions.length > 0 && (
                  <li>Attaches {conditions.length} binding pre-conditions to the sanction warrant.</li>
                )}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDecision}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Stamp className="w-4 h-4" />
                <span>Affix Executive Seal & Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Official Executive Sanction Order Warrant View */}
      {showDecreeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-8 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-amber-600 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-800 text-white flex items-center justify-center font-extrabold text-sm shadow-md border-2 border-amber-300">
                  AUDA
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                    African Union Development Agency (AUDA-NEPAD)
                  </h2>
                  <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                    Office of the Chief Executive Officer • Executive Sanction Decree
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDecreeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Decree Header Box */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-amber-50/50 p-4 border-b border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Executive Decree Reference
                  </span>
                  <span className="font-mono font-extrabold text-amber-900 text-sm">
                    {refNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Date of Executive Sanction
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatDate(activeInitiative.ceoApproval?.decisionDate || new Date().toISOString())}
                  </span>
                </div>
              </div>

              <div className="p-4 border-b border-slate-200 space-y-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Sanctioned Initiative
                </span>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {activeInitiative.title} ({activeInitiative.code})
                </h4>
                <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                  <span>Directorate: {activeInitiative.directorate}</span>
                  <span>•</span>
                  <span>
                    Authorized Financing Envelope:{' '}
                    <strong>
                      {formatCurrency(
                        activeInitiative.totalCalculatedBudget || activeInitiative.estimatedCost,
                        activeInitiative.currency
                      )}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Executive Directive Text */}
              <div className="p-4 border-b border-slate-200 space-y-1.5 bg-slate-50/50">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Executive Directive & Mandate
                </span>
                <p className="text-slate-800 italic leading-relaxed">
                  {guidanceText ? `"${guidanceText}"` : <span className="text-slate-400 not-italic">No additional remarks provided.</span>}
                </p>
              </div>

              {/* Conditions Schedule */}
              {conditions.length > 0 && (
                <div className="p-4">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-2">
                    Schedule of Binding Pre-Condition Covenants
                  </span>
                  <div className="space-y-1.5">
                    {conditions.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-700 font-bold">#{i + 1}</span>
                          <span className="font-medium text-slate-800">{c.condition}</span>
                        </div>
                        <span className="font-bold text-slate-600 font-mono">
                          Due: {c.dueDate} [{c.status}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seal & Signature Box */}
            <div className="p-5 bg-gradient-to-r from-amber-50/50 to-orange-50/40 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Chief Executive Officer Signatory
                </span>
                <h5 className="font-extrabold text-slate-900 text-sm mt-0.5">
                  Mrs. Nardos Bekele-Thomas
                </h5>
                <p className="text-[11px] text-slate-500">
                  Chief Executive Officer, African Union Development Agency
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-amber-500 flex flex-col items-center justify-center text-amber-800 text-[9px] font-extrabold uppercase shadow-inner text-center">
                <span>SEAL OF</span>
                <span>AUDA CEO</span>
                <span>SANCTION</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDecreeModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Close Warrant
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Decree</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
