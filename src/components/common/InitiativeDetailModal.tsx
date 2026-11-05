import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Initiative } from '../../types';
import { StatusBadge } from './StatusBadge';
import { StageProgressTracker } from './StageProgressTracker';
import { LifecycleAgeBadge } from './LifecycleAgeBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  calculateInitiativeLifecycleAge,
  getRAGConfig,
  GATE_SLAS
} from '../../utils/lifecycleAgeCalculations';
import {
  X,
  FileText,
  Sparkles,
  Compass,
  CheckCircle2,
  Award,
  FileSignature,
  History,
  FileStack,
  Globe,
  DollarSign,
  Calendar,
  Building,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Download,
  ExternalLink,
  Clock,
  RefreshCw,
  Handshake
} from 'lucide-react';

interface InitiativeDetailModalProps {
  initiative: Initiative | null;
  onClose: () => void;
}

export const InitiativeDetailModal: React.FC<InitiativeDetailModalProps> = ({
  initiative,
  onClose
}) => {
  const {
    setCurrentPage,
    setSelectedProjectDevelopmentId,
    setSelectedAppraisalId,
    setSelectedCeoApprovalId,
    setSelectedContractingId,
    setSelectedAmendmentInitiativeId
  } = useApp();
  const [activeTab, setActiveTab] = useState<'concept' | 'strategic' | 'results' | 'appraisal' | 'contracting' | 'amendments' | 'audit' | 'documents'>('concept');

  if (!initiative) return null;

  const tabs = [
    { id: 'concept', label: 'Concept & Problem', icon: FileText },
    { id: 'strategic', label: 'Strategic Alignment & Risks', icon: Compass },
    { id: 'results', label: 'Results & Budget Rollup', icon: DollarSign },
    { id: 'appraisal', label: 'Appraisal & CEO Approval', icon: Award },
    { id: 'contracting', label: 'Contracting & Tranches', icon: FileSignature },
    { id: 'amendments', label: 'Amendments & Change Control', icon: RefreshCw },
    { id: 'audit', label: 'Workflow & Audit Trail', icon: History },
    { id: 'documents', label: 'Documents', icon: FileStack }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {initiative.code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {initiative.classification}
              </span>
              <StatusBadge status={initiative.status} size="sm" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate leading-snug">
              {initiative.title}
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{initiative.directorate}</span>
              <span>•</span>
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Owner: {initiative.ownerName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('open-ai-chat', {
                    detail: {
                      prompt: `Provide an executive analysis and risk appraisal for ${initiative.code} (${initiative.title}). Highlight its stage progress, gate requirements, and strategic recommendations.`
                    }
                  })
                );
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs border border-emerald-400/30 cursor-pointer"
              title="Query AI Assistant about this initiative"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Tracker Ribbon */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <StageProgressTracker
            currentStageCode={initiative.stageCode}
            currentStatus={initiative.status}
            transitions={initiative.transitions}
            initiative={initiative}
          />
        </div>

        {/* Metrics Banner */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Total Budget
            </span>
            <span className="text-slate-900 font-bold text-sm text-emerald-700">
              {formatCurrency(initiative.estimatedCost, initiative.currency)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Implementation Period
            </span>
            <span className="text-slate-900 font-semibold">
              {initiative.implementationPeriod}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Process Age & SLA
            </span>
            <div className="mt-0.5">
              <LifecycleAgeBadge initiative={initiative} compact />
            </div>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Target Geography
            </span>
            <span className="text-slate-900 font-semibold truncate block">
              {initiative.isContinental
                ? 'Continental'
                : initiative.regions.join(', ')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Last Updated
            </span>
            <span className="text-slate-900 font-semibold">
              {formatDate(initiative.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-white border-b border-slate-200 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          {/* TAB 1: Concept & Problem Statement */}
          {activeTab === 'concept' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    What Problem are We Trying to Solve?
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {initiative.problemStatement}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Who is Affected?
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {initiative.affectedParties}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Why Does It Matter?
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {initiative.importanceStatement}
                  </p>
                </div>
                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Consequences of Inaction
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    {initiative.consequencesOfInaction}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Proposed Intervention
                </h4>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  {initiative.proposedIntervention}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Expected Beneficiaries
                  </h4>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {initiative.expectedBeneficiaries}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Expected Measurable Results
                  </h4>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {initiative.expectedResults}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Targeted Funding Partners & Notes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {initiative.possibleFundingPartners.map((partner, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
                {initiative.fundingNotes && (
                  <p className="text-xs text-slate-600 italic mt-2">
                    Note: {initiative.fundingNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Strategic Alignment & Risks */}
          {activeTab === 'strategic' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Strategic Result Areas (SRA)
                </h4>
                <div className="space-y-1.5">
                  {initiative.sras && initiative.sras.length > 0 ? (
                    initiative.sras.map((sra, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold"
                      >
                        {sra}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Not specified</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Strategic Delivery Pathways (SDP)
                </h4>
                <div className="space-y-1.5">
                  {initiative.sdps && initiative.sdps.length > 0 ? (
                    initiative.sdps.map((sdp, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold"
                      >
                        {sdp}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Not specified</span>
                  )}
                </div>
              </div>

              {initiative.strategicAlignmentNarrative && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    AU Agenda 2063 Alignment Narrative
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {initiative.strategicAlignmentNarrative}
                  </p>
                </div>
              )}

              {/* Risks Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Risk Assessment &amp; Mitigation Matrix
                  </h4>
                  <button
                    onClick={() => {
                      setCurrentPage('Risk Matrix');
                      onClose();
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Portfolio Risk Heat Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {initiative.risks && initiative.risks.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-2.5">Risk ID</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Description</th>
                          <th className="p-2.5">Severity</th>
                          <th className="p-2.5">Mitigation Plan</th>
                          <th className="p-2.5">Owner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {initiative.risks.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-800">
                              {r.riskId}
                            </td>
                            <td className="p-2.5 text-slate-600">{r.category}</td>
                            <td className="p-2.5 text-slate-800">{r.description}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.severity === 'High'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {r.severity}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-700">{r.mitigationMeasures}</td>
                            <td className="p-2.5 text-slate-600">{r.riskOwner}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                    Risk matrix entries are finalized during Stage 2 Project Development.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Results & Budget Rollup */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-800">
                    Total Project Budget Roll-up
                  </span>
                  <div className="text-2xl font-black text-emerald-900 mt-0.5">
                    {formatCurrency(initiative.estimatedCost, initiative.currency)}
                  </div>
                </div>
                <div className="text-right text-xs text-emerald-800">
                  <span>Currency: </span>
                  <span className="font-bold">{initiative.currency}</span>
                </div>
              </div>

              {initiative.outcomes && initiative.outcomes.length > 0 ? (
                initiative.outcomes.map((outcome) => (
                  <div
                    key={outcome.id}
                    className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {outcome.outcomeNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {outcome.narrative}
                        </h4>
                        <p className="text-xs text-slate-500 italic mt-0.5">
                          Assumptions: {outcome.assumptions}
                        </p>
                      </div>
                    </div>

                    {/* Outputs & Activities */}
                    <div className="space-y-3">
                      {outcome.outputs.map((output) => (
                        <div
                          key={output.id}
                          className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {output.outputNumber}: {output.narrative}
                            </span>
                            <span className="text-xs text-slate-500">
                              Target: {output.target}
                            </span>
                          </div>

                          {/* Activities table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead className="text-[11px] text-slate-500 border-b border-slate-200">
                                <tr>
                                  <th className="py-1">Activity</th>
                                  <th className="py-1">Description</th>
                                  <th className="py-1">Partner</th>
                                  <th className="py-1">Timeline</th>
                                  <th className="py-1 text-right">Cost</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {output.activities.map((act) => (
                                  <tr key={act.id}>
                                    <td className="py-1.5 font-mono font-semibold text-slate-700">
                                      {act.activityNumber}
                                    </td>
                                    <td className="py-1.5 text-slate-800">
                                      {act.description}
                                    </td>
                                    <td className="py-1.5 text-slate-600">
                                      {act.leadPartner}
                                    </td>
                                    <td className="py-1.5 text-slate-500">
                                      {act.timeline}
                                    </td>
                                    <td className="py-1.5 text-right font-bold text-slate-900">
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
                ))
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                  Hierarchical Results Framework (Outcomes, Outputs & Activities) is created during Stage 2 Project Development.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Appraisal & CEO Approval */}
          {activeTab === 'appraisal' && (
            <div className="space-y-6">
              {initiative.boardAppraisal ? (
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Program Board Appraisal
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        Appraisal Record: {initiative.boardAppraisal.appraisalId}
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {initiative.boardAppraisal.recommendation}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    "{initiative.boardAppraisal.overallComment}"
                  </p>

                  {/* Ratings breakdown */}
                  {initiative.boardAppraisal.ratings.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-slate-700 mb-2">
                        Criteria Scores & Evidence
                      </h5>
                      <div className="space-y-2">
                        {initiative.boardAppraisal.ratings.map((r, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {r.criteriaName}
                              </span>
                              <span className="text-slate-600 text-[11px]">
                                {r.evidence}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {r.score} / {r.maxScore} pts
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                {r.rating}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                  No Program Board appraisal has been registered yet for this initiative.
                </div>
              )}

              {/* CEO Approval Block */}
              {initiative.ceoApproval ? (
                <div className="border-2 border-emerald-500/40 rounded-xl p-5 bg-emerald-50/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Formal Executive Sanction
                      </span>
                      <h4 className="text-base font-bold text-emerald-950 mt-0.5 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        <span>CEO Approval Warrant</span>
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                      {initiative.ceoApproval.decision}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-emerald-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Warrant Ref
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {initiative.ceoApproval.referenceNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Signatory
                      </span>
                      <span className="font-semibold text-slate-900">
                        {initiative.ceoApproval.ceoName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Date Sanctioned
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatDateTime(initiative.ceoApproval.decisionDate)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-900 block mb-1">
                      CEO Executive Guidance Directive:
                    </span>
                    <p className="text-xs text-slate-800 italic leading-relaxed">
                      "{initiative.ceoApproval.guidanceText}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                  Awaiting Stage 4 CEO Approval decree.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Contracting & Tranches */}
          {activeTab === 'contracting' && (
            <div className="space-y-6">
              {initiative.financingAgreement ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Master Financing Terms Sheet
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Reference</span>
                        <span className="font-mono font-bold text-slate-900">
                          {initiative.financingAgreement.reference}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Instrument</span>
                        <span className="font-semibold text-slate-900">
                          {initiative.financingAgreement.instrument}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Procurement Rule</span>
                        <span className="font-semibold text-slate-900">
                          {initiative.financingAgreement.procurementStandard}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Grant Amount</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(initiative.financingAgreement.grantAmount, initiative.financingAgreement.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tranches Table */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Disbursement Tranches & Milestone Conditions
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <tr>
                            <th className="p-2.5">Tranche</th>
                            <th className="p-2.5">Share %</th>
                            <th className="p-2.5">Amount</th>
                            <th className="p-2.5">Milestone Pre-condition</th>
                            <th className="p-2.5">Target Date</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {initiative.financingAgreement.tranches.map((tr) => (
                            <tr key={tr.id}>
                              <td className="p-2.5 font-bold text-slate-800">
                                Tranche {tr.trancheNumber}: {tr.trancheName}
                              </td>
                              <td className="p-2.5 font-bold text-slate-700">{tr.percentage}%</td>
                              <td className="p-2.5 font-bold text-emerald-700">
                                {formatCurrency(tr.amount, initiative.financingAgreement?.currency || 'USD')}
                              </td>
                              <td className="p-2.5 text-slate-700">{tr.preconditionMilestone}</td>
                              <td className="p-2.5 text-slate-600">{tr.targetDate}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    tr.status === 'Disbursed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : tr.status === 'Eligible'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {tr.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bilateral MoUs & Protocol Agreements */}
                  {initiative.mous && initiative.mous.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Institutional Memoranda of Understanding (MoUs)
                      </h4>
                      <div className="space-y-2">
                        {initiative.mous.map((mou) => (
                          <div key={mou.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{mou.title}</span>
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                {mou.referenceNumber}
                              </span>
                            </div>
                            <div className="text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                              <div><span className="text-slate-400 block">Partner:</span> {mou.partner}</div>
                              <div><span className="text-slate-400 block">Signatories:</span> {mou.signingParties}</div>
                              <div><span className="text-slate-400 block">Effective:</span> {mou.effectiveDate} to {mou.expiryDate}</div>
                              <div><span className="text-slate-400 block">Status:</span> <span className="font-bold text-emerald-700">{mou.status}</span></div>
                            </div>
                            <div className="text-slate-600 text-[11px] bg-white p-2 rounded border border-slate-100 italic">
                              Scope: {mou.scope}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negotiation Logs & Partner Dialogues */}
                  {initiative.negotiations && initiative.negotiations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Financing Negotiation Minutes & Action Log
                      </h4>
                      <div className="space-y-2">
                        {initiative.negotiations.map((neg) => (
                          <div key={neg.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{neg.topic}</span>
                              <span className="text-slate-500 text-[11px]">{neg.date} • {neg.partner}</span>
                            </div>
                            <p className="text-slate-700">{neg.summary}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                              <div>
                                <span className="font-bold text-slate-700 block">Decisions Made:</span>
                                <span className="text-slate-600">{neg.decisionsMade}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-700 block">Actions Required (Due: {neg.dueDate}):</span>
                                <span className="text-slate-600">{neg.actionsRequired} ({neg.responsiblePerson})</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                  Financing agreements, MoUs, and disbursement tranches are executed in Stage 5 Contracting after CEO approval.
                </div>
              )}
            </div>
          )}

          {/* TAB: Amendments & Change Control */}
          {activeTab === 'amendments' && (
            <div className="space-y-6">
              {initiative.amendments && initiative.amendments.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Formal Version-Controlled Amendment Records
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {initiative.amendments.length} change order(s) filed for this initiative
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAmendmentInitiativeId(initiative.id);
                        setCurrentPage('Amendments');
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Amendments Workspace</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {initiative.amendments.map((amd) => (
                      <div key={amd.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                              {amd.amendmentId}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                              {amd.versionNumber}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                              {amd.changeType} Change
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                              amd.approvalStatus === 'Approved by CEO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : amd.approvalStatus === 'Endorsed'
                                ? 'bg-sky-100 text-sky-800'
                                : amd.approvalStatus === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {amd.approvalStatus}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{amd.description}</h5>
                          <p className="text-xs text-slate-600 mt-1 italic">
                            Substantive Justification: "{amd.reason}"
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">
                              Original Baseline Value:
                            </span>
                            <span className="font-mono text-slate-800">{amd.originalValue}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">
                              Proposed Amended Value:
                            </span>
                            <span className="font-mono font-bold text-slate-900">{amd.proposedValue}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">
                              Budget Impact:
                            </span>
                            <span className="font-semibold text-slate-800">{amd.budgetImpact}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">
                              Timeline Impact:
                            </span>
                            <span className="font-semibold text-slate-800">{amd.timelineImpact}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>Requested by: <strong>{amd.requestedBy}</strong></span>
                          <span>Filed on: {formatDate(amd.dateRequested)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <RefreshCw className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No amendment requests have been registered for this initiative yet. Project managers and directors can request changes to budget, timeline, scope, or financing terms in Stage 6.
                  </p>
                  {(initiative.stageCode >= 4 || initiative.status === 'Approved' || initiative.status === 'Under Contracting' || initiative.status === 'Financing Finalized') && (
                    <button
                      onClick={() => {
                        setSelectedAmendmentInitiativeId(initiative.id);
                        setCurrentPage('Amendments');
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Initiate Amendment in Stage 6</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Workflow & Audit Trail */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Chronological Workflow Decision History
              </h4>
              <div className="space-y-3">
                {initiative.transitions.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{t.decision}</span>
                      <span className="text-slate-400 text-[11px]">
                        {formatDateTime(t.timestamp)}
                      </span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.performedBy} ({t.performerRole})</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 italic">
                      "{t.comments}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attached Institutional Documentation
              </h4>
              {initiative.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {initiative.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors text-xs flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-900 truncate block">
                          {doc.fileName}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>{doc.confidentiality}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      </div>
                      <button
                        onClick={() => alert(`Simulating secure download of ${doc.fileName}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                  No documents attached to this record yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">
            Pipeline Projects Management System • Record {initiative.code}
          </span>
          <div className="flex items-center gap-2">
            {initiative.stageCode <= 1 && (
              <button
                onClick={() => {
                  setCurrentPage('Concepts');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
              >
                Go to Stage 0 Concepts
              </button>
            )}

            {(initiative.stageCode === 1 || initiative.status === 'Submitted to Board') && (
              <button
                onClick={() => {
                  setCurrentPage('Program Board Evaluation');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Evaluate in Board Workspace
              </button>
            )}

            {(initiative.stageCode === 2 || initiative.status === 'Under Development' || initiative.status === 'Approved for Development') && (
              <button
                onClick={() => {
                  setSelectedProjectDevelopmentId(initiative.id);
                  setCurrentPage('Project Development');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Open in Stage 2 Workspace
              </button>
            )}

            {(initiative.stageCode === 3 || initiative.status === 'Submitted for Appraisal' || initiative.status === 'Appraisal in Progress') && (
              <button
                onClick={() => {
                  setSelectedAppraisalId(initiative.id);
                  setCurrentPage('Project Appraisal');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
              >
                Appraise in Stage 3 Workspace
              </button>
            )}

            {(initiative.stageCode === 4 || initiative.status === 'Awaiting CEO Decision' || initiative.status === 'Recommended for Approval' || initiative.status === 'Recommended with Conditions') && (
              <button
                onClick={() => {
                  setSelectedCeoApprovalId(initiative.id);
                  setCurrentPage('CEO Approval');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
              >
                Review in Stage 4 CEO Approval
              </button>
            )}

            {(initiative.stageCode === 5 || initiative.status === 'Under Contracting' || initiative.status === 'Financing Finalized' || initiative.status === 'Approved' || initiative.status === 'Conditionally Approved') && (
              <button
                onClick={() => {
                  setSelectedContractingId(initiative.id);
                  setCurrentPage('Contracting');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>Open in Stage 5 Contracting</span>
              </button>
            )}

            {(initiative.stageCode === 6 || (initiative.amendments && initiative.amendments.length > 0) || initiative.stageCode >= 4) && (
              <button
                onClick={() => {
                  setSelectedAmendmentInitiativeId(initiative.id);
                  setCurrentPage('Amendments');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Stage 6 Change Control</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
