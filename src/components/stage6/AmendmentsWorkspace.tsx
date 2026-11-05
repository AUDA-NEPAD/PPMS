import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Initiative,
  AmendmentItem,
  WorkflowTransition
} from '../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { StageProgressTracker } from '../common/StageProgressTracker';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import {
  RefreshCw,
  Award,
  CheckCircle2,
  AlertTriangle,
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
  Sliders,
  AlertCircle,
  FileCheck,
  CheckCheck,
  GitCompare,
  History,
  Stamp,
  Ban
} from 'lucide-react';

export const AmendmentsWorkspace: React.FC = () => {
  const {
    initiatives,
    currentUser,
    selectedAmendmentInitiativeId,
    setSelectedAmendmentInitiativeId,
    createAmendmentRequest,
    reviewAmendmentDecision,
    setSelectedInitiativeId,
    setCurrentPage
  } = useApp();

  // Role permissions
  const isCEO = currentUser.role === 'CEO' || currentUser.role === 'System Administrator';
  const isDirectorOrBoard =
    currentUser.role === 'Directorate Director' ||
    currentUser.role === 'Programme Board Member' ||
    isCEO;

  // Filter initiatives in Stage 6 or those with amendments or approved/contracted
  const amendmentInitiatives = useMemo(() => {
    return initiatives.filter(
      (i) =>
        i.stageCode === 6 ||
        (i.amendments && i.amendments.length > 0) ||
        i.stageCode >= 4
    );
  }, [initiatives]);

  // Fallback to init-12 or first available
  const activeInitiative = useMemo(() => {
    if (selectedAmendmentInitiativeId) {
      const found = initiatives.find((i) => i.id === selectedAmendmentInitiativeId);
      if (found) return found;
    }
    if (amendmentInitiatives.length > 0) {
      return amendmentInitiatives[0];
    }
    return initiatives.find((i) => i.id === 'init-12') || initiatives[0];
  }, [initiatives, selectedAmendmentInitiativeId, amendmentInitiatives]);

  // UI state
  const [activeTab, setActiveTab] = useState<'requests' | 'new_request' | 'history'>('requests');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Review Modal state
  const [selectedAmendmentForReview, setSelectedAmendmentForReview] = useState<AmendmentItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'Endorsed' | 'Approved by CEO' | 'Rejected'>('Approved by CEO');
  const [reviewComments, setReviewComments] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showWarrantModal, setShowWarrantModal] = useState(false);

  // New Amendment Request Form State
  const [newVersion, setNewVersion] = useState(`v${(activeInitiative?.amendments?.length || 0) + 1}.1`);
  const [newChangeType, setNewChangeType] = useState<AmendmentItem['changeType']>('Scope');
  const [newDescription, setNewDescription] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newOriginalValue, setNewOriginalValue] = useState('');
  const [newProposedValue, setNewProposedValue] = useState('');
  const [newBudgetImpact, setNewBudgetImpact] = useState('No financial variance');
  const [newTimelineImpact, setNewTimelineImpact] = useState('No schedule extension required');

  // Sync state whenever activeInitiative changes
  useEffect(() => {
    if (activeInitiative) {
      const count = activeInitiative.amendments?.length || 0;
      setNewVersion(`v1.${count + 1}`);
      setSaveSuccessMessage(null);
      setFormError(null);
    }
  }, [activeInitiative?.id]);

  const handleOpenReview = (amd: AmendmentItem) => {
    setSelectedAmendmentForReview(amd);
    setReviewDecision(isCEO ? 'Approved by CEO' : 'Endorsed');
    setReviewComments('');
    setShowReviewModal(true);
  };

  const handleExecuteReview = () => {
    if (!activeInitiative || !selectedAmendmentForReview) return;
    reviewAmendmentDecision(
      activeInitiative.id,
      selectedAmendmentForReview.id,
      reviewDecision,
      reviewComments || undefined
    );
    setShowReviewModal(false);
    setSelectedAmendmentForReview(null);
    setSaveSuccessMessage(`Amendment ${selectedAmendmentForReview.amendmentId} marked as ${reviewDecision}.`);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleSubmitNewAmendment = () => {
    if (!activeInitiative) return;

    if (!newDescription.trim() || !newReason.trim()) {
      setFormError('Description and substantive justification reason are required.');
      return;
    }

    if (!newOriginalValue.trim() || !newProposedValue.trim()) {
      setFormError('Both Original Baseline Value and Proposed Amended Value are required.');
      return;
    }

    setFormError(null);
    createAmendmentRequest(activeInitiative.id, {
      initiativeId: activeInitiative.id,
      versionNumber: newVersion.trim(),
      changeType: newChangeType,
      description: newDescription.trim(),
      reason: newReason.trim(),
      requestedBy: currentUser.name,
      originalValue: newOriginalValue.trim(),
      proposedValue: newProposedValue.trim(),
      budgetImpact: newBudgetImpact.trim(),
      timelineImpact: newTimelineImpact.trim()
    });

    setNewDescription('');
    setNewReason('');
    setNewOriginalValue('');
    setNewProposedValue('');
    setActiveTab('requests');
    setSaveSuccessMessage('Amendment request successfully submitted into the governance queue.');
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  if (!activeInitiative) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <RefreshCw className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">No Initiatives Under Change Control</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Approved and contracted initiatives can be reopened here through controlled amendment requests.
        </p>
      </div>
    );
  }

  const amendmentsList = activeInitiative.amendments || [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Stage 6 Amendment Gate */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/40">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Stage 6: Controlled Amendment & Change Management Gate
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
                <span className="font-bold text-slate-800">
                  Current Budget: {formatCurrency(activeInitiative.estimatedCost, activeInitiative.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Print */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setShowWarrantModal(true)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-300"
              title="Official Amendment Sanction Warrant"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Amendment Warrant</span>
            </button>
            <button
              onClick={() => setSelectedInitiativeId(activeInitiative.id)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-300"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Full Dossier</span>
            </button>
          </div>
        </div>

        {/* Progress Tracker Ribbon */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200">
          <StageProgressTracker
            currentStageCode={activeInitiative.stageCode}
            currentStatus={activeInitiative.status}
            transitions={activeInitiative.transitions}
          />
        </div>

        {/* Governance Notice Banner */}
        <div className="px-5 py-2.5 bg-emerald-50/80 border-b border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>
              <strong>Version Control & Fiduciary Audit Integrity:</strong> Any modification to approved baseline scope,
              budget allocation, or implementation period requires structured amendment logging and executive authorization.
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            Change Control Active
          </span>
        </div>

        {/* Initiative Switcher */}
        <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700 flex-shrink-0">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Change Control Pipeline ({amendmentInitiatives.length}):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {amendmentInitiatives.map((init) => (
              <button
                key={init.id}
                onClick={() => setSelectedAmendmentInitiativeId(init.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeInitiative.id === init.id
                    ? 'bg-emerald-700 text-white shadow-2xs font-bold'
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

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'requests'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Active Amendment Register</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-800 text-white font-mono">
            {amendmentsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('new_request')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'new_request'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Initiate Amendment Request</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'history'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Version History & Audit Log</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
            {activeInitiative.transitions.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Active Amendment Register */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Formal Project Amendment Requests & Version History
              </h3>
              <p className="text-xs text-slate-500">
                Review proposed modifications against the baseline project agreement with side-by-side comparison.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('new_request')}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>
          </div>

          {amendmentsList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
              No formal amendment requests filed for this initiative yet. Click "Initiate Amendment Request" to submit a change.
            </div>
          ) : (
            <div className="space-y-4">
              {amendmentsList.map((amd) => (
                <div
                  key={amd.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3.5 hover:border-slate-300 transition-colors"
                >
                  {/* Amendment Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                        {amd.versionNumber}
                      </span>
                      <span className="font-mono font-bold text-slate-700 text-xs">
                        {amd.amendmentId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {amd.changeType} Change
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        Requested by: <strong>{amd.requestedBy}</strong> ({formatDate(amd.dateRequested)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          amd.approvalStatus === 'Approved by CEO'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : amd.approvalStatus === 'Endorsed'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : amd.approvalStatus === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {amd.approvalStatus}
                      </span>

                      {/* Executive Review Trigger */}
                      {isDirectorOrBoard && amd.approvalStatus === 'Pending Review' && (
                        <button
                          onClick={() => handleOpenReview(amd)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Stamp className="w-3.5 h-3.5" />
                          <span>Review & Decide</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description & Justification */}
                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-800 font-medium">
                      <strong>Proposed Change:</strong> {amd.description}
                    </p>
                    <p className="text-slate-600 italic">
                      <strong>Substantive Rationale:</strong> {amd.reason}
                    </p>
                  </div>

                  {/* Side-by-Side Comparison Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Original Baseline Parameter
                      </span>
                      <p className="font-semibold text-slate-800">{amd.originalValue}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                        Proposed Amended Parameter
                      </span>
                      <p className="font-semibold text-emerald-950">{amd.proposedValue}</p>
                    </div>
                  </div>

                  {/* Variance Impact Tags */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
                    <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      <strong>Budget Variance:</strong> {amd.budgetImpact}
                    </div>
                    <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      <strong>Schedule Variance:</strong> {amd.timelineImpact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Initiate New Amendment Request Form */}
      {activeTab === 'new_request' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Formulate Controlled Project Amendment Request
            </h3>
            <p className="text-xs text-slate-500">
              Formal submission requires side-by-side metric comparison, budget impact analysis, and justification.
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Target Version Number:
                </label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Amendment Category:
                </label>
                <select
                  value={newChangeType}
                  onChange={(e) => setNewChangeType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Scope">Scope / Output Adjustment</option>
                  <option value="Budget">Budget Reallocation / Co-funding Increase</option>
                  <option value="Timeline">Timeline / Implementation Extension</option>
                  <option value="Partner">Development Partner / Recipient Consortium</option>
                  <option value="Strategic alignment">Strategic Alignment / Regional Coverage</option>
                  <option value="Results framework">Results Framework Indicator Revision</option>
                  <option value="Financing terms">Financing Terms & Disbursement Tranches</option>
                  <option value="Other">Other Institutional Governance Change</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Requested By Officer:
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.role})`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Detailed Narrative of Proposed Modification:
              </label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe precisely what operational parameters, geographic boundaries, or target outputs are being adjusted..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Substantive Justification & Root Cause Rationale:
              </label>
              <textarea
                rows={3}
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Provide empirical rationale, changes in member state legislation, additional counterpart funding availability, or external shocks..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Side-by-side comparison inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Original Baseline Value / Target:
                </label>
                <input
                  type="text"
                  value={newOriginalValue}
                  onChange={(e) => setNewOriginalValue(e.target.value)}
                  placeholder="e.g. 40M hectares protected; budget $65,000,000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  Proposed Amended Value / Target:
                </label>
                <input
                  type="text"
                  value={newProposedValue}
                  onChange={(e) => setNewProposedValue(e.target.value)}
                  placeholder="e.g. 45M hectares protected; budget $71,000,000"
                  className="w-full px-3 py-2 bg-emerald-50/60 border border-emerald-300 rounded-xl text-emerald-950 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Budget Variance / Impact ($):
                </label>
                <input
                  type="text"
                  value={newBudgetImpact}
                  onChange={(e) => setNewBudgetImpact(e.target.value)}
                  placeholder="e.g. +$6,000,000 (Funded 100% by sovereign counterpart)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Timeline / Schedule Impact:
                </label>
                <input
                  type="text"
                  value={newTimelineImpact}
                  onChange={(e) => setNewTimelineImpact(e.target.value)}
                  placeholder="e.g. No extension required or +6 months"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => setActiveTab('requests')}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitNewAmendment}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Submit Amendment Request</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Version History & Audit Log */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Initiative Version Control Ledger & Audit Trail
          </h3>

          <div className="space-y-4">
            {activeInitiative.transitions.map((trans, i) => (
              <div
                key={trans.id || i}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
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
                    <span>Officer: </span>
                    <strong className="text-slate-800">{trans.performedBy}</strong>
                    <span className="text-slate-400"> ({trans.performerRole})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{trans.fromStage}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-emerald-700">{trans.toStage}</span>
                  </div>
                  {trans.comments && (
                    <p className="p-2 bg-white rounded border border-slate-200 text-slate-700 italic mt-1">
                      "{trans.comments}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Executive Review Decision Modal */}
      {showReviewModal && selectedAmendmentForReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stamp className="w-4 h-4 text-emerald-700" />
                <span>Statutory Amendment Review Decision</span>
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-800">
                  {selectedAmendmentForReview.amendmentId} ({selectedAmendmentForReview.versionNumber})
                </span>
                <span className="text-slate-500 font-medium">
                  {selectedAmendmentForReview.changeType}
                </span>
              </div>
              <p className="text-slate-800">{selectedAmendmentForReview.description}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Select Governance Action:
              </label>

              <div className="space-y-2">
                {isCEO && (
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                      reviewDecision === 'Approved by CEO'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      checked={reviewDecision === 'Approved by CEO'}
                      onChange={() => setReviewDecision('Approved by CEO')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-xs block">Approved by CEO (Statutory Decree)</span>
                      <span className="text-[11px] text-slate-500">
                        Formally adopts modified scope/budget and updates project baseline.
                      </span>
                    </div>
                  </label>
                )}

                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                    reviewDecision === 'Endorsed'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    checked={reviewDecision === 'Endorsed'}
                    onChange={() => setReviewDecision('Endorsed')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">Endorsed (Board/Directorate Clearances)</span>
                    <span className="text-[11px] text-slate-500">
                      Endorses technical merit for final CEO sanction.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                    reviewDecision === 'Rejected'
                      ? 'border-rose-600 bg-rose-50/70 text-rose-950'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    checked={reviewDecision === 'Rejected'}
                    onChange={() => setReviewDecision('Rejected')}
                    className="mt-0.5 text-rose-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">Rejected (Maintain Original Baseline)</span>
                    <span className="text-[11px] text-slate-500">
                      Disapproves modification and keeps original scope/budget.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Executive Review Comments & Directives:
              </label>
              <textarea
                rows={3}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter executive comments, gazette references..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReview}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition-colors"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Official Amendment Sanction Order Warrant */}
      {showWarrantModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-8 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-extrabold text-sm">
                  AUDA
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                    African Union Development Agency (AUDA-NEPAD)
                  </h2>
                  <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                    Executive Change Control Commission • Amendment Warrant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWarrantModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-emerald-50/50 p-4 border-b border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Target Initiative
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {activeInitiative.title} ({activeInitiative.code})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Effective Version
                  </span>
                  <span className="font-mono font-bold text-emerald-900">
                    {amendmentsList[0]?.versionNumber || 'v1.0 (Baseline)'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Adopted Amendment Register
                </span>
                {amendmentsList.length === 0 ? (
                  <p className="text-slate-400 italic">No formal amendments recorded.</p>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[11px] text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-1">ID</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Description</th>
                        <th className="py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {amendmentsList.map((a) => (
                        <tr key={a.id}>
                          <td className="py-1.5 font-mono font-bold text-slate-800">{a.amendmentId}</td>
                          <td className="py-1.5 text-slate-600">{a.changeType}</td>
                          <td className="py-1.5 text-slate-800 max-w-xs">{a.description}</td>
                          <td className="py-1.5 font-bold text-emerald-800">{a.approvalStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowWarrantModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Amendment Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
