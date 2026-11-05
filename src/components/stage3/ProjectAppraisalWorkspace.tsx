import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Initiative,
  BoardAppraisal,
  AppraisalRating,
  WorkflowTransition,
  DocumentItem
} from '../../types';
import { STANDARD_APPRAISAL_CRITERIA, calculateAppraisalTotalScore } from '../../utils/appraisalCriteria';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { StageProgressTracker } from '../common/StageProgressTracker';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  FileText,
  Shield,
  Layers,
  Award,
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
  Paperclip,
  Globe,
  FileStack,
  Eye
} from 'lucide-react';

export const ProjectAppraisalWorkspace: React.FC = () => {
  const {
    initiatives,
    currentUser,
    selectedAppraisalId,
    setSelectedAppraisalId,
    saveBoardAppraisal,
    recordAppraisalRating,
    submitBoardAppraisalDecision,
    setSelectedInitiativeId,
    setCurrentPage
  } = useApp();

  // Role permission check: Only Programme Board Member and System Administrator can score & submit recommendations
  const canAppraise =
    currentUser.role === 'Programme Board Member' ||
    currentUser.role === 'System Administrator';

  // Find all initiatives in Stage 3 or submitted for appraisal
  const stage3Initiatives = useMemo(() => {
    return initiatives.filter(
      (i) =>
        i.stageCode === 3 ||
        i.status === 'Submitted for Appraisal' ||
        i.status === 'Appraisal in Progress'
    );
  }, [initiatives]);

  // Fallback to init-7 or first available
  const activeInitiative = useMemo(() => {
    if (selectedAppraisalId) {
      const found = initiatives.find((i) => i.id === selectedAppraisalId);
      if (found) return found;
    }
    if (stage3Initiatives.length > 0) {
      return stage3Initiatives[0];
    }
    return initiatives.find((i) => i.id === 'init-7') || initiatives[0];
  }, [initiatives, selectedAppraisalId, stage3Initiatives]);

  // Working state for active initiative's appraisal ratings
  const [ratings, setRatings] = useState<AppraisalRating[]>(() => {
    if (activeInitiative?.boardAppraisal?.ratings && activeInitiative.boardAppraisal.ratings.length > 0) {
      return activeInitiative.boardAppraisal.ratings;
    }
    return STANDARD_APPRAISAL_CRITERIA;
  });

  const [overallComment, setOverallComment] = useState<string>(
    activeInitiative?.boardAppraisal?.overallComment || ''
  );
  const [evidenceAdvice, setEvidenceAdvice] = useState<string>(
    activeInitiative?.boardAppraisal?.evidenceAdvice || ''
  );
  const [conditions, setConditions] = useState<string[]>(
    activeInitiative?.boardAppraisal?.conditions || []
  );
  const [newConditionInput, setNewConditionInput] = useState('');
  const [requiredRevisions, setRequiredRevisions] = useState<string[]>(
    activeInitiative?.boardAppraisal?.requiredRevisions || []
  );
  const [newRevisionInput, setNewRevisionInput] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'matrix' | 'dossier' | 'audit'>('matrix');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<BoardAppraisal['recommendation']>(
    'Recommended for Approval'
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [inspectedDocument, setInspectedDocument] = useState<DocumentItem | null>(null);

  const handleDownloadDocument = (doc: DocumentItem) => {
    const textContent = `AUDA-NEPAD PIPELINE PROJECTS MANAGEMENT SYSTEM (PPMS)
OFFICIAL DOCUMENT ATTACHMENT EXPORT

Initiative Code: ${activeInitiative.code}
Title: ${activeInitiative.title}
Directorate: ${activeInitiative.directorate}

Document Name: ${doc.fileName}
Category: ${doc.category}
Version: ${doc.version}
Confidentiality: ${doc.confidentiality}
Uploaded By: ${doc.uploadedBy}
Upload Date: ${formatDate(doc.uploadDate)}
File Size: ${doc.fileSize}

DESCRIPTION / ABSTRACT:
${doc.description}

---
Exported from AUDA-NEPAD PPMS Stage 3 Technical Appraisal Workspace.
Generated on: ${new Date().toISOString()}
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName.endsWith('.pdf') ? doc.fileName.replace('.pdf', '.txt') : `${doc.fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sync state whenever activeInitiative changes
  useEffect(() => {
    if (activeInitiative) {
      if (activeInitiative.boardAppraisal?.ratings && activeInitiative.boardAppraisal.ratings.length > 0) {
        setRatings(activeInitiative.boardAppraisal.ratings);
      } else {
        setRatings(STANDARD_APPRAISAL_CRITERIA);
      }
      setOverallComment(activeInitiative.boardAppraisal?.overallComment || '');
      setEvidenceAdvice(activeInitiative.boardAppraisal?.evidenceAdvice || '');
      setConditions(activeInitiative.boardAppraisal?.conditions || []);
      setRequiredRevisions(activeInitiative.boardAppraisal?.requiredRevisions || []);
      setSaveSuccessMessage(null);
      setFormError(null);
    }
  }, [activeInitiative?.id]);

  // Aggregate score calculation
  const scoreSummary = useMemo(() => {
    return calculateAppraisalTotalScore(ratings);
  }, [ratings]);

  // Handlers for rating changes
  const handleRatingChange = (
    criteriaId: string,
    field: keyof AppraisalRating,
    value: any
  ) => {
    if (!canAppraise) return;
    setRatings((prev) =>
      prev.map((item) => {
        if (item.criteriaId !== criteriaId) return item;
        const updated = { ...item, [field]: value };
        // If score is changed, clamp between 0 and maxScore
        if (field === 'score') {
          const numVal = Math.max(0, Math.min(Number(value) || 0, item.maxScore || 20));
          updated.score = numVal;
        }
        return updated;
      })
    );
  };

  const handleAddCondition = () => {
    if (!newConditionInput.trim() || !canAppraise) return;
    setConditions((prev) => [...prev, newConditionInput.trim()]);
    setNewConditionInput('');
  };

  const handleRemoveCondition = (index: number) => {
    if (!canAppraise) return;
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRevision = () => {
    if (!newRevisionInput.trim() || !canAppraise) return;
    setRequiredRevisions((prev) => [...prev, newRevisionInput.trim()]);
    setNewRevisionInput('');
  };

  const handleRemoveRevision = (index: number) => {
    if (!canAppraise) return;
    setRequiredRevisions((prev) => prev.filter((_, i) => i !== index));
  };

  // Save draft
  const handleSaveDraft = () => {
    if (!activeInitiative || !canAppraise) return;
    saveBoardAppraisal(activeInitiative.id, {
      ratings,
      overallComment,
      evidenceAdvice,
      conditions,
      requiredRevisions
    });
    setSaveSuccessMessage('Board Appraisal scorecards and comments saved successfully.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Submit formal decision
  const handleConfirmDecision = () => {
    if (!activeInitiative || !canAppraise) return;

    if (!overallComment.trim()) {
      setFormError('Mandatory Board Consensus Synthesis commentary is required before submitting.');
      return;
    }

    if (selectedRecommendation === 'Recommended with Conditions' && conditions.length === 0) {
      setFormError('At least one statutory condition must be defined for "Recommended with Conditions".');
      return;
    }

    if (selectedRecommendation === 'Deferred for Revision' && requiredRevisions.length === 0) {
      setFormError('At least one required technical revision item must be specified for "Deferred for Revision".');
      return;
    }

    setFormError(null);
    submitBoardAppraisalDecision(
      activeInitiative.id,
      selectedRecommendation,
      overallComment,
      evidenceAdvice,
      conditions,
      requiredRevisions
    );

    setShowRecommendationModal(false);
    setSaveSuccessMessage(`Appraisal decision "${selectedRecommendation}" formally transmitted.`);
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  if (!activeInitiative) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <ClipboardCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">No Initiatives Awaiting Appraisal</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          All projects have either completed Stage 3 Appraisal or remain under Stage 2 Proposal Development.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Gate Title & Role Permission Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-50/60 via-white to-slate-50">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Stage 3: Technical & Program Board Appraisal Gate
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
                  Manager: {activeInitiative.projectManager || activeInitiative.ownerName}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-800">
                  Total Budget: {formatCurrency(activeInitiative.totalCalculatedBudget || activeInitiative.estimatedCost, activeInitiative.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Progress Tracker */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200">
          <StageProgressTracker
            currentStageCode={activeInitiative.stageCode}
            currentStatus={activeInitiative.status}
            transitions={activeInitiative.transitions}
          />
        </div>

        {/* Role Permission Notice Banner */}
        {!canAppraise ? (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Review-Only Observer Mode:</strong> You are logged in as{' '}
                <span className="font-bold underline">{currentUser.role}</span>. In accordance with
                AUDA-NEPAD Stage 3 Governance Rules, only <strong>Programme Board Members</strong> and{' '}
                <strong>System Administrators</strong> can modify scorecards or submit formal appraisal decisions.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              Read-Only
            </span>
          </div>
        ) : (
          <div className="px-5 py-2.5 bg-emerald-50/80 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Authorized Board Member:</strong> You hold statutory voting and scoring permissions
                to appraise this proposal and issue binding transmittal recommendations to the CEO.
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              Scoring Active
            </span>
          </div>
        )}

        {/* Initiative Selector Switcher Ribbon */}
        <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700 flex-shrink-0">
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span>Appraisal Queue ({stage3Initiatives.length}):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {stage3Initiatives.map((init) => (
              <button
                key={init.id}
                onClick={() => setSelectedAppraisalId(init.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeInitiative.id === init.id
                    ? 'bg-purple-600 text-white shadow-2xs font-bold'
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

      {/* Navigation Tabs for Workspace */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'matrix'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Statutory Appraisal Matrix & Scoring</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-700 text-white">
            {ratings.length} Criteria
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'dossier'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Full Proposal Dossier Inspection</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">
            Concept & Stage 2
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Appraisal Governance History</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {activeInitiative.transitions.length} Events
          </span>
        </button>
      </div>

      {/* TAB 1: Appraisal Scoring Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Aggregate Live Score Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Consolidated Technical Assessment Scorecard
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {scoreSummary.totalScore}
                </span>
                <span className="text-slate-400 font-medium text-sm">
                  / {scoreSummary.maxScore} points ({scoreSummary.percentage}%)
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreSummary.gradeColor}`}
                >
                  Grade Tier: {scoreSummary.gradeTier}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Scored across 6 standard African Union appraisal dimensions. Minimum threshold for
                unconditional recommendation is 85/100 points.
              </p>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full md:w-64 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Composite Readiness</span>
                <span>{scoreSummary.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    scoreSummary.percentage >= 85
                      ? 'bg-emerald-500'
                      : scoreSummary.percentage >= 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(scoreSummary.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0</span>
                <span>Threshold: 70</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* 6 Appraisal Criteria Scoring Cards */}
          <div className="grid grid-cols-1 gap-5">
            {ratings.map((criterion, index) => (
              <div
                key={criterion.criteriaId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {criterion.criteriaName}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Criterion Weight: {criterion.maxScore || 20} Points Maximum
                      </span>
                    </div>
                  </div>

                  {/* Rating Selector & Score Input */}
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Statutory Rating
                      </label>
                      <select
                        value={criterion.rating}
                        disabled={!canAppraise}
                        onChange={(e) =>
                          handleRatingChange(
                            criterion.criteriaId,
                            'rating',
                            e.target.value as AppraisalRating['rating']
                          )
                        }
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          criterion.rating === 'Meets requirements'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : criterion.rating === 'Partially meets requirements'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : criterion.rating === 'Does not meet requirements'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        } ${!canAppraise ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        <option value="Meets requirements">Meets Requirements</option>
                        <option value="Partially meets requirements">Partially Meets Requirements</option>
                        <option value="Does not meet requirements">Does Not Meet Requirements</option>
                        <option value="Not applicable">Not Applicable</option>
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Assigned Score
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={criterion.maxScore || 20}
                          value={criterion.score ?? 0}
                          disabled={!canAppraise}
                          onChange={(e) =>
                            handleRatingChange(criterion.criteriaId, 'score', e.target.value)
                          }
                          className="w-16 px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-80"
                        />
                        <span className="text-xs text-slate-400 font-mono">
                          /{criterion.maxScore || 20}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidentiary Analysis Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Evidentiary Findings & Board Assessment Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={criterion.evidence}
                    disabled={!canAppraise}
                    onChange={(e) =>
                      handleRatingChange(criterion.criteriaId, 'evidence', e.target.value)
                    }
                    placeholder="Document specific empirical evidence, source verification, and rationale supporting this score..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Conditional Fields if Partially Meets or Does Not Meet */}
                {(criterion.rating === 'Partially meets requirements' ||
                  criterion.rating === 'Does not meet requirements') && (
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Required Corrective Action:
                      </label>
                      <input
                        type="text"
                        value={criterion.requiredAction || ''}
                        disabled={!canAppraise}
                        onChange={(e) =>
                          handleRatingChange(criterion.criteriaId, 'requiredAction', e.target.value)
                        }
                        placeholder="e.g. Provide itemized cost quotes from accredited vendors..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Responsible Focal Officer:
                      </label>
                      <input
                        type="text"
                        value={criterion.responsiblePerson || ''}
                        disabled={!canAppraise}
                        onChange={(e) =>
                          handleRatingChange(criterion.criteriaId, 'responsiblePerson', e.target.value)
                        }
                        placeholder="e.g. Project Manager / Lead Engineer"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Consolidated Synthesis Commentary Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Consolidated Programme Board Synthesis & Strategic Advisory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Board Consensus Commentary (Mandatory for Formal Transmittal):
                </label>
                <textarea
                  rows={4}
                  value={overallComment}
                  disabled={!canAppraise}
                  onChange={(e) => setOverallComment(e.target.value)}
                  placeholder="Summarize the board's holistic appraisal findings, strategic suitability, continental value proposition, and overall justification for recommendation..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Advisory Notes & Guidance for the Chief Executive Officer:
                </label>
                <textarea
                  rows={4}
                  value={evidenceAdvice}
                  disabled={!canAppraise}
                  onChange={(e) => setEvidenceAdvice(e.target.value)}
                  placeholder="Provide executive briefing notes, recommended signing protocols at AU summits, high-level diplomatic outreach requirements..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Pre-conditions Register */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Statutory Pre-Conditions Register
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Covenants that must be satisfied before tranche disbursement or contract execution.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {conditions.length} Condition(s)
                </span>
              </div>

              {canAppraise && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newConditionInput}
                    onChange={(e) => setNewConditionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                    placeholder="Add binding pre-condition (e.g., Finalize environmental clearance with AfDB)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAddCondition}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}

              {conditions.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                  No pre-conditions specified.
                </p>
              ) : (
                <div className="space-y-2">
                  {conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-700 font-bold">#{idx + 1}</span>
                        <span>{cond}</span>
                      </div>
                      {canAppraise && (
                        <button
                          onClick={() => handleRemoveCondition(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove condition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Required Revisions Register (Relevant if Deferring) */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Required Proposal Revisions (For Deferral Workflow)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Deficiencies to be reworked by the Project Manager in Stage 2 before re-submission.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {requiredRevisions.length} Item(s)
                </span>
              </div>

              {canAppraise && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newRevisionInput}
                    onChange={(e) => setNewRevisionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRevision()}
                    placeholder="Specify required revision (e.g., Recalculate Output 2.2 budget schedule)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAddRevision}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              )}

              {requiredRevisions.length > 0 && (
                <div className="space-y-2">
                  {requiredRevisions.map((rev, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{rev}</span>
                      </div>
                      {canAppraise && (
                        <button
                          onClick={() => handleRemoveRevision(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Bar: Save Draft & Transmit Decision */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              <span>Appraisal Lead: </span>
              <strong className="text-slate-800">{currentUser.name}</strong>
              <span className="text-slate-400"> ({currentUser.role})</span>
            </div>

            <div className="flex items-center gap-2.5">
              {canAppraise && (
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors border border-slate-300"
                >
                  <Check className="w-4 h-4 text-slate-600" />
                  <span>Save Appraisal Draft</span>
                </button>
              )}

              <button
                disabled={!canAppraise}
                onClick={() => {
                  setFormError(null);
                  setShowRecommendationModal(true);
                }}
                className={`px-5 py-2 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm ${
                  canAppraise
                    ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Submit Board Recommendation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Proposal Dossier Inspector */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          {/* Executive Overview Banner: Full Project Lifecycle Dossier */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-purple-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-400/30 text-purple-200">
                  <FileStack className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-purple-200">
                    Comprehensive Project Dossier & Origin Trail
                  </h3>
                  <p className="text-xs text-purple-200/80">
                    Complete institutional visibility: Concept Formulation ➔ Stage 1 Board Endorsement ➔ Stage 2 Detailed Engineering
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono border border-white/20">
                  Origin: {activeInitiative.sourceConceptCode || activeInitiative.code}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
                  {activeInitiative.classification}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PART 1: CONCEPT STAGE (STAGE 0 & 1) DOSSIER INFORMATION                  */}
          {/* ========================================================================= */}

          {/* 1.1 Concept Profile & Origin Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  1.1 Concept Origin & Institutional Framing
                </h3>
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                Concept Identification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Initiative & Concept Code
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {activeInitiative.code}
                </span>
                {activeInitiative.sourceConceptCode && activeInitiative.sourceConceptCode !== activeInitiative.code && (
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Source: {activeInitiative.sourceConceptCode}
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Sponsoring Directorate
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>{activeInitiative.directorate}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Proponent & Project Lead
                </span>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>{activeInitiative.ownerName}</span>
                  </span>
                  {activeInitiative.projectManager && activeInitiative.projectManager !== activeInitiative.ownerName && (
                    <span className="text-[11px] text-slate-500 block">
                      Manager: {activeInitiative.projectManager}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Implementation Horizon
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>{activeInitiative.implementationPeriod || '3–4 years'}</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Submitted: {formatDate(activeInitiative.dateSubmitted)}
                </span>
              </div>
            </div>

            {/* Geographic Coverage & Programme Linkage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-800">Geographic Footprint & Regions:</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                    activeInitiative.isContinental ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {activeInitiative.isContinental ? 'Continental Scope' : 'Regional / Multi-Country'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeInitiative.regions?.map((reg) => (
                    <span
                      key={reg}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700"
                    >
                      {reg}
                    </span>
                  ))}
                </div>
                {activeInitiative.countries && activeInitiative.countries.length > 0 && (
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <span className="font-bold text-slate-700">Target Member States: </span>
                    <span>{activeInitiative.countries.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-800">Strategic Objective & Umbrella Programme:</span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {activeInitiative.strategicObjective}
                </p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span className="font-bold text-slate-700">Programme Framework: </span>
                  <span>
                    {activeInitiative.existingProgramme && activeInitiative.programmeName
                      ? activeInitiative.programmeName
                      : 'Independent AUDA-NEPAD Flagship Initiative'}
                  </span>
                </div>
              </div>
            </div>

            {/* Concept Anti-Duplication & Screening Status */}
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
                  Concept Screening & Anti-Duplication
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{activeInitiative.duplicateStatus || 'Clearance Verified: No Duplicates Found'}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
                  Concept Inception Timestamp
                </span>
                <span className="font-medium text-slate-800">
                  {formatDateTime(activeInitiative.dateSubmitted)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
                  Last Statutory Audit Sync
                </span>
                <span className="font-medium text-slate-800">
                  {formatDateTime(activeInitiative.lastUpdated)}
                </span>
              </div>
            </div>
          </div>

          {/* 1.2 Substantive Problem Specification & Development Case */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  1.2 Substantive Development Case & Problem Rationale
                </h3>
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                Theory of Action Basis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Core Problem Statement & Structural Bottlenecks
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeInitiative.problemStatement}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Affected Parties & Vulnerable Demographics
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeInitiative.affectedParties}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider block">
                  Strategic Urgency & Continental Value Proposition
                </span>
                <p className="text-purple-900 leading-relaxed whitespace-pre-line">
                  {activeInitiative.importanceStatement}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-rose-950 uppercase tracking-wider block">
                  Consequences of Inaction (Cost of Doing Nothing)
                </span>
                <p className="text-rose-900 leading-relaxed whitespace-pre-line">
                  {activeInitiative.consequencesOfInaction}
                </p>
              </div>

              <div className="md:col-span-2 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
                  Proposed Technical Intervention & Methodological Approach
                </span>
                <p className="text-emerald-950 leading-relaxed font-medium whitespace-pre-line">
                  {activeInitiative.proposedIntervention}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
                  <div>
                    <span className="font-bold text-emerald-900 block mb-0.5">
                      Expected Beneficiaries (Direct & Indirect):
                    </span>
                    <p className="text-emerald-800">{activeInitiative.expectedBeneficiaries}</p>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-900 block mb-0.5">
                      Anticipated Strategic Results & Milestones:
                    </span>
                    <p className="text-emerald-800">{activeInitiative.expectedResults}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1.3 Concept Financial Architecture & Variance Comparison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  1.3 Concept Financial Framing & Cost Evolution
                </h3>
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                Financial Baseline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Concept Initial Estimated Cost
                </span>
                <div className="font-mono font-extrabold text-slate-900 text-lg">
                  {formatCurrency(activeInitiative.estimatedCost || 0, activeInitiative.currency)}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Baseline cost submitted at Concept gate
                </span>
              </div>

              <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  Stage 2 Itemized Engineering Budget
                </span>
                <div className="font-mono font-extrabold text-purple-950 text-lg">
                  {formatCurrency(
                    activeInitiative.totalCalculatedBudget || activeInitiative.estimatedCost || 0,
                    activeInitiative.currency
                  )}
                </div>
                <span className="text-[10px] text-purple-700 block">
                  Calculated from Results Framework activity costing
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Budget Formulation Variance
                </span>
                {(() => {
                  const initial = activeInitiative.estimatedCost || 0;
                  const calculated = activeInitiative.totalCalculatedBudget || initial;
                  const diff = calculated - initial;
                  const pct = initial > 0 ? ((diff / initial) * 100).toFixed(1) : '0.0';
                  return (
                    <div>
                      <div className={`font-mono font-extrabold text-lg ${diff > 0 ? 'text-amber-800' : diff < 0 ? 'text-emerald-800' : 'text-slate-800'}`}>
                        {diff > 0 ? `+${formatCurrency(diff, activeInitiative.currency)}` : formatCurrency(diff, activeInitiative.currency)}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {diff === 0 ? 'Exact match with concept estimate' : `${pct}% variance from concept baseline`}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Prospective Funding Partners & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block">
                  Prospective Development & Funding Partners:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeInitiative.possibleFundingPartners && activeInitiative.possibleFundingPartners.length > 0 ? (
                    activeInitiative.possibleFundingPartners.map((partner) => (
                      <span
                        key={partner}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-xs shadow-2xs"
                      >
                        {partner}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No partners identified at concept stage.</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block">
                  Financing & Co-Financing Architecture Notes:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {activeInitiative.fundingNotes ||
                    'Co-financing structure blended between multilateral donor facilities, partner country counterpart allocations, and continental grant facilities.'}
                </p>
              </div>
            </div>
          </div>

          {/* 1.4 Stage 1 Programme Board Concept Evaluation Record */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  1.4 Stage 1 Programme Board Endorsement & Evaluation Record
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Endorsement Passed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Stage 1 Governance Decision
                </span>
                <span className="font-bold text-emerald-800 text-xs block">
                  {activeInitiative.evaluationDecision?.decisionType || 'Proceed to full project development'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Endorsed: {activeInitiative.evaluationDecision?.decisionDate ? formatDate(activeInitiative.evaluationDecision.decisionDate) : 'Stage 1 Complete'}
                </span>
              </div>

              <div className="md:col-span-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Evaluating Programme Board Members
                </span>
                <span className="font-medium text-slate-800 text-xs block">
                  {activeInitiative.evaluationDecision?.evaluatedBy && activeInitiative.evaluationDecision.evaluatedBy.length > 0
                    ? activeInitiative.evaluationDecision.evaluatedBy.join(' • ')
                    : 'AUDA-NEPAD Continental Programme Board Statutory Evaluation Panel'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] block">
                Collective Programme Board Synthesis & Strategic Directive:
              </span>
              <p className="text-emerald-900 leading-relaxed italic whitespace-pre-line">
                "{activeInitiative.evaluationDecision?.collectiveBoardComment ||
                  'The concept aligns with the African Union Agenda 2063 First Ten-Year Implementation Plan and is hereby endorsed for technical proposal development. The Directorate is instructed to establish rigorous results-framework costing and risk safeguarding prior to Stage 3 Board Appraisal.'}"
              </p>
            </div>
          </div>

          {/* 1.5 Concept & Project Attachments & Official Documentation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    1.5 Project Attachments & Supporting Documentation
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official evidentiary materials, concept notes, diagnostic studies, letters of support, and feasibility assessments.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800">
                {activeInitiative.documents?.length || 0} Attachments Registered
              </span>
            </div>

            {(!activeInitiative.documents || activeInitiative.documents.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-1">
                <Paperclip className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-xs text-slate-600">No official attachments uploaded</p>
                <p className="text-[11px] text-slate-400">All supporting documentation should be catalogued during proposal development.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="py-2.5 px-3">Document Title</th>
                      <th className="py-2.5 px-2.5">Category</th>
                      <th className="py-2.5 px-2 text-center">Version</th>
                      <th className="py-2.5 px-2 text-center">Classification</th>
                      <th className="py-2.5 px-2.5">Uploaded By</th>
                      <th className="py-2.5 px-2 text-center">Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeInitiative.documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block text-xs">
                              {doc.fileName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {doc.fileSize} • {doc.fileType}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[11px] text-slate-600">
                          {doc.version}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              doc.confidentiality === 'Executive Confidential'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : doc.confidentiality === 'Internal Restrictive'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {doc.confidentiality}
                          </span>
                        </td>
                        <td className="py-3 px-2.5 text-slate-600 text-[11px]">
                          {doc.uploadedBy}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-500 text-[11px] whitespace-nowrap">
                          {formatDate(doc.uploadDate)}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectedDocument(doc)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                              title="Inspect Full Document Details"
                            >
                              <Eye className="w-3 h-3 text-slate-600" />
                              <span>Inspect</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(doc)}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-purple-200 shadow-2xs"
                              title="Download Attachment Export"
                            >
                              <Download className="w-3 h-3 text-purple-600" />
                              <span>Download</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* PART 2: STAGE 2 DETAILED PROPOSAL SPECIFICATIONS                           */}
          {/* ========================================================================= */}

          {/* Section 2.1 Strategic Alignment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2.1 AU Agenda 2063 Strategic Alignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  Strategic Result Areas (SRAs):
                </span>
                <div className="space-y-1">
                  {activeInitiative.sras?.map((sra, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200"
                    >
                      {sra}
                    </div>
                  )) || <span className="text-slate-400 italic">None specified</span>}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  Strategic Delivery Pathways (SDPs):
                </span>
                <div className="space-y-1">
                  {activeInitiative.sdps?.map((sdp, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-indigo-50 text-indigo-800 font-medium border border-indigo-200"
                    >
                      {sdp}
                    </div>
                  )) || <span className="text-slate-400 italic">None specified</span>}
                </div>
              </div>
            </div>

            {activeInitiative.strategicAlignmentNarrative && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-800 block mb-1">Alignment Narrative:</span>
                <p className="italic">{activeInitiative.strategicAlignmentNarrative}</p>
              </div>
            )}
          </div>

          {/* Section 2.2 Theory of Change */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2.2 Theory of Change (TOC) Causal Pathway
            </h3>
            {activeInitiative.theoryOfChangeEntries && activeInitiative.theoryOfChangeEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {activeInitiative.theoryOfChangeEntries.map((toc) => (
                  <div
                    key={toc.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        toc.type === 'root_cause'
                          ? 'bg-rose-100 text-rose-800'
                          : toc.type === 'intervention'
                          ? 'bg-emerald-100 text-emerald-800'
                          : toc.type === 'assumption'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {toc.type.replace('_', ' ')}
                    </span>
                    <p className="font-medium text-slate-800">{toc.description}</p>
                    <p className="text-[10px] text-slate-400 italic">Ref: {toc.evidenceReference}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No structured TOC pathway defined.</p>
            )}
          </div>

          {/* Section 2.3 Risk Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2.3 Risk Matrix & Safeguards Profile
            </h3>
            {activeInitiative.risks && activeInitiative.risks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Risk ID</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Severity</th>
                      <th className="p-2.5">Mitigation Measure</th>
                      <th className="p-2.5">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeInitiative.risks.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2.5 font-mono font-bold text-slate-700">{r.riskId}</td>
                        <td className="p-2.5 text-slate-600">{r.category}</td>
                        <td className="p-2.5 text-slate-800 max-w-xs">{r.description}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.severity === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : r.severity === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.severity}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700 max-w-sm">{r.mitigationMeasures}</td>
                        <td className="p-2.5 text-slate-600 font-medium">{r.riskOwner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No operational risks catalogued.</p>
            )}
          </div>

          {/* Section 2.4 Results Framework */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2.4 Results Framework & Cost Roll-Up
            </h3>
            {activeInitiative.outcomes && activeInitiative.outcomes.length > 0 ? (
              <div className="space-y-4">
                {activeInitiative.outcomes.map((outcome) => (
                  <div key={outcome.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded text-xs">
                        {outcome.outcomeNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {outcome.outputs?.length || 0} Outputs
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{outcome.narrative}</p>

                    {/* Outputs & Activities table */}
                    <div className="space-y-2">
                      {outcome.outputs?.map((outp) => (
                        <div key={outp.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-indigo-700">
                              {outp.outputNumber}: {outp.narrative}
                            </span>
                            <span className="text-slate-500 text-[11px]">Timeline: {outp.timeline}</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left">
                              <thead className="text-slate-500 border-b border-slate-100">
                                <tr>
                                  <th className="py-1">Activity</th>
                                  <th className="py-1">Description</th>
                                  <th className="py-1">Partner</th>
                                  <th className="py-1 text-right">Cost ({activeInitiative.currency})</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {outp.activities?.map((act) => (
                                  <tr key={act.id}>
                                    <td className="py-1 font-mono text-slate-700">{act.activityNumber}</td>
                                    <td className="py-1 text-slate-800">{act.description}</td>
                                    <td className="py-1 text-slate-600">{act.leadPartner}</td>
                                    <td className="py-1 text-right font-bold text-slate-900">
                                      {formatCurrency(act.cost, act.currency)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Results framework details pending in Stage 2.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Appraisal Governance History */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Governance Traceability & Audit Trail
          </h3>

          <div className="space-y-4">
            {activeInitiative.transitions.map((trans, i) => (
              <div
                key={trans.id || i}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  #{i + 1}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{trans.decision}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDateTime(trans.timestamp)}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <span>Performed by: </span>
                    <strong className="text-slate-800">{trans.performedBy}</strong>
                    <span className="text-slate-400"> ({trans.performerRole})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{trans.fromStage}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-purple-700">{trans.toStage}</span>
                  </div>
                  {trans.comments && (
                    <p className="p-2 bg-white rounded border border-slate-200 text-slate-700 italic mt-1">
                      "{trans.comments}"
                    </p>
                  )}
                  {trans.conditions && trans.conditions.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      <span className="font-bold text-[10px] text-slate-500 uppercase">
                        Attached Conditions:
                      </span>
                      {trans.conditions.map((c, ci) => (
                        <div key={ci} className="text-[11px] text-purple-800">
                          • {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Submit Recommendation to CEO Modal */}
      {showRecommendationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Transmittal of Board Appraisal Recommendation
                </h3>
              </div>
              <button
                onClick={() => setShowRecommendationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Select Statutory Board Recommendation:
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    value: 'Recommended for Approval',
                    label: 'Recommended for Formal Approval',
                    desc: 'Fully meets all technical & financial criteria. Transmits directly to CEO for executive decree.',
                    color: 'hover:border-emerald-400 border-slate-200'
                  },
                  {
                    value: 'Recommended with Conditions',
                    label: 'Recommended with Statutory Conditions',
                    desc: 'Endorsed for CEO Approval subject to binding pre-conditions before financial disbursement.',
                    color: 'hover:border-amber-400 border-slate-200'
                  },
                  {
                    value: 'Deferred for Revision',
                    label: 'Deferred for Proposal Revision',
                    desc: 'Deficiencies identified. Returns dossier back to Stage 2 with actionable revision checklist.',
                    color: 'hover:border-blue-400 border-slate-200'
                  },
                  {
                    value: 'Not Recommended',
                    label: 'Not Recommended (Reject Initiative)',
                    desc: 'Proposal fails core developmental or fiduciary criteria. Concludes initiative processing.',
                    color: 'hover:border-rose-400 border-slate-200'
                  }
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRecommendation === opt.value
                        ? 'border-purple-600 bg-purple-50/70 shadow-2xs'
                        : `${opt.color} bg-white`
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      checked={selectedRecommendation === opt.value}
                      onChange={() =>
                        setSelectedRecommendation(opt.value as BoardAppraisal['recommendation'])
                      }
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{opt.label}</span>
                      <span className="text-[11px] text-slate-500">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Confirmation notes */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Info className="w-3.5 h-3.5 text-purple-600" />
                <span>Governance Consequence:</span>
              </div>
              <p>
                Transmitting this decision updates the initiative state to{' '}
                <strong>
                  {selectedRecommendation === 'Recommended for Approval' ||
                  selectedRecommendation === 'Recommended with Conditions'
                    ? 'Stage 4: Project Approval (Awaiting CEO Decision)'
                    : selectedRecommendation === 'Deferred for Revision'
                    ? 'Stage 2: Project Development (Deferred for Revision)'
                    : 'Stage 3: Project Appraisal (Rejected)'}
                </strong>{' '}
                and appends an immutable audit event to the institutional ledger.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRecommendationModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Transmit Decision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Official Appraisal Certificate / Print View */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-8 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-purple-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center font-extrabold text-sm">
                  AUDA
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                    African Union Development Agency (AUDA-NEPAD)
                  </h2>
                  <p className="text-xs text-purple-700 font-bold">
                    Continental Programme Board Technical Appraisal Dossier
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Appraisal Summary Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 p-3 border-b border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Initiative Reference
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {activeInitiative.code}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Initiative Title
                  </span>
                  <span className="font-bold text-slate-800">{activeInitiative.title}</span>
                </div>
              </div>

              <div className="p-3 border-b border-slate-200 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Composite Score
                  </span>
                  <span className="font-bold text-purple-800 text-base font-mono">
                    {scoreSummary.totalScore} / {scoreSummary.maxScore} ({scoreSummary.percentage}%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Grade Assessment
                  </span>
                  <span className="font-bold text-slate-800">{scoreSummary.gradeTier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Board Recommendation
                  </span>
                  <span className="font-bold text-emerald-700">
                    {activeInitiative.boardAppraisal?.recommendation || selectedRecommendation}
                  </span>
                </div>
              </div>

              {/* Criteria Scores Table */}
              <div className="p-3">
                <span className="text-slate-500 block text-[10px] uppercase font-bold mb-2">
                  Dimensional Score Breakdown
                </span>
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-1">Appraisal Dimension</th>
                      <th className="py-1">Rating</th>
                      <th className="py-1 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ratings.map((r, i) => (
                      <tr key={i}>
                        <td className="py-1.5 font-medium text-slate-800">{r.criteriaName}</td>
                        <td className="py-1.5 text-slate-600">{r.rating}</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                          {r.score}/{r.maxScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Board Sign-off Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <span className="font-bold text-slate-800 block text-xs">
                Statutory Sign-Off Committee:
              </span>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Appraised By Board Member:</span>
                  <strong className="text-slate-800">{currentUser.name}</strong>
                  <div className="text-slate-400">{currentUser.role}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Transmittal Timestamp:</span>
                  <strong className="text-slate-800">{formatDateTime(new Date().toISOString())}</strong>
                  <div className="text-slate-400">Electronic Verification Valid</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Detailed Document Attachment Inspector */}
      {inspectedDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Document Attachment Inspection
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {inspectedDocument.id} • {inspectedDocument.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedDocument(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Header Card */}
            <div className="p-4 bg-gradient-to-r from-purple-50 via-slate-50 to-purple-50/50 rounded-xl border border-purple-200/80 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {inspectedDocument.fileName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                    <span className="font-mono">{inspectedDocument.fileSize}</span>
                    <span>•</span>
                    <span className="font-mono">{inspectedDocument.fileType}</span>
                    <span>•</span>
                    <span className="font-bold text-purple-700">Version {inspectedDocument.version}</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    inspectedDocument.confidentiality === 'Executive Confidential'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : inspectedDocument.confidentiality === 'Internal Restrictive'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {inspectedDocument.confidentiality}
                </span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Uploaded By & Role
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>{inspectedDocument.uploadedBy}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Date Registered
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>{formatDate(inspectedDocument.uploadDate)}</span>
                </span>
              </div>
            </div>

            {/* Description / Abstract */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                Attachment Abstract & Evidentiary Value:
              </span>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                {inspectedDocument.description || (
                  <span className="italic text-slate-400">
                    Official evidentiary submission filed under {inspectedDocument.category}. Contains verified technical specifications, baseline data, and statutory governance clearance for Stage 3 appraisal.
                  </span>
                )}
              </div>
            </div>

            {/* Digital Verification Seal */}
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-[11px] flex items-center justify-between gap-3 text-purple-900">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <span>
                  <strong>AUDA-NEPAD Document Registry:</strong> Immutable archival record verified for Stage 3 Technical &amp; Board Appraisal.
                </span>
              </div>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-purple-200 text-purple-800">
                SHA-256 Verified
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectedDocument(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDocument(inspectedDocument)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Attachment Export</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
