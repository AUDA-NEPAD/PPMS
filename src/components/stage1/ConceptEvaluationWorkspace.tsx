import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Initiative,
  EvaluationDecision,
  WorkflowTransition
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { StageProgressTracker } from '../common/StageProgressTracker';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Users,
  CheckCircle2,
  RotateCcw,
  GitMerge,
  PauseCircle,
  XCircle,
  Tv,
  FileText,
  AlertTriangle,
  Building,
  User,
  Globe,
  DollarSign,
  Calendar,
  Lock,
  ArrowRight,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export const ConceptEvaluationWorkspace: React.FC = () => {
  const {
    initiatives,
    currentUser,
    users,
    recordBoardEvaluationDecision,
    setSelectedInitiativeId
  } = useApp();

  // Find all concepts awaiting evaluation or in Stage 1
  const eligibleConcepts = initiatives.filter(
    (i) => i.stageCode === 1 || i.status === 'Submitted to Board'
  );

  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    eligibleConcepts[0]?.id || ''
  );

  const selectedConcept = initiatives.find((i) => i.id === selectedConceptId) || eligibleConcepts[0];

  // Presentation Mode Toggle (Section 7)
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationSlide, setPresentationSlide] = useState(0);

  // Decision Modal state
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<EvaluationDecision['decisionType']>(
    'Proceed to full project development'
  );
  const [collectiveBoardComment, setCollectiveBoardComment] = useState('');
  
  // Return fields
  const [clarificationComments, setClarificationComments] = useState('');
  const [clarificationFields, setClarificationFields] = useState<string[]>([
    'Problem Statement & Evidence',
    'Indicative Budget Breakdown'
  ]);
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [assignedPerson, setAssignedPerson] = useState(selectedConcept?.ownerName || '');

  // Merge fields
  const [targetInitiativeId, setTargetInitiativeId] = useState('');
  const [mergeExplanation, setMergeExplanation] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');

  // Hold fields
  const [holdReason, setHoldReason] = useState('');
  const [reviewDate, setReviewDate] = useState('2026-12-01');

  // Reject fields
  const [rejectionReason, setRejectionReason] = useState('');
  const [canResubmit, setCanResubmit] = useState(true);

  // Error state
  const [decisionError, setDecisionError] = useState('');

  const canRecordDecision =
    currentUser.role === 'Programme Board Member' ||
    currentUser.role === 'System Administrator';

  if (!selectedConcept) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
        <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
        <h3 className="font-bold text-slate-800 text-base">
          No Concepts Awaiting Program Board Evaluation
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          All registered concepts have either been evaluated or remain in draft stage. Check Stage 0 Concepts to submit new records.
        </p>
      </div>
    );
  }

  // Handle Board Decision Submit
  const handleSubmitDecision = () => {
    if (!collectiveBoardComment.trim()) {
      setDecisionError('Collective Board Comment is mandatory prior to recording decision.');
      return;
    }

    if (decisionType === 'Return for clarification') {
      if (!clarificationComments.trim()) {
        setDecisionError('Clarification comments are required.');
        return;
      }
      if (!dueDate) {
        setDecisionError('Due date for clarification submission is required.');
        return;
      }
    }

    if (decisionType === 'Merge with existing initiative') {
      if (!targetInitiativeId) {
        setDecisionError('Please select target initiative to merge with.');
        return;
      }
      if (!mergeExplanation.trim()) {
        setDecisionError('Explanation for merger is required.');
        return;
      }
    }

    if (decisionType === 'Put on hold') {
      if (!holdReason.trim()) {
        setDecisionError('Reason for holding concept is required.');
        return;
      }
      if (!reviewDate) {
        setDecisionError('Future review date is required.');
        return;
      }
    }

    if (decisionType === 'Reject') {
      if (!rejectionReason.trim()) {
        setDecisionError('Formal justification for rejection is required.');
        return;
      }
    }

    setDecisionError('');

    const targetTitle = initiatives.find((x) => x.id === targetInitiativeId)?.title;

    const decisionPayload: EvaluationDecision = {
      decisionType,
      collectiveBoardComment,
      decisionDate: new Date().toISOString(),
      evaluatedBy: [currentUser.name, 'Prof. Fatima Al-Mansoor', 'Amb. Samuel Osei'],
      clarificationComments: decisionType === 'Return for clarification' ? clarificationComments : undefined,
      clarificationFields: decisionType === 'Return for clarification' ? clarificationFields : undefined,
      dueDate: decisionType === 'Return for clarification' ? dueDate : undefined,
      assignedPerson: decisionType === 'Return for clarification' ? (assignedPerson || selectedConcept.ownerName) : undefined,
      targetInitiativeId: decisionType === 'Merge with existing initiative' ? targetInitiativeId : undefined,
      targetInitiativeTitle: decisionType === 'Merge with existing initiative' ? targetTitle : undefined,
      mergeExplanation: decisionType === 'Merge with existing initiative' ? mergeExplanation : undefined,
      responsiblePerson: decisionType === 'Merge with existing initiative' ? responsiblePerson : undefined,
      holdReason: decisionType === 'Put on hold' ? holdReason : undefined,
      reviewDate: decisionType === 'Put on hold' ? reviewDate : undefined,
      rejectionReason: decisionType === 'Reject' ? rejectionReason : undefined,
      canResubmit: decisionType === 'Reject' ? canResubmit : undefined
    };

    recordBoardEvaluationDecision(selectedConcept.id, decisionPayload);
    setShowDecisionModal(false);
  };

  // Presentation Mode View (Section 7)
  if (presentationMode) {
    const slides = [
      {
        title: 'Initiative Overview & Context',
        content: (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {selectedConcept.code}
              </span>
              <span className="text-sm px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                {selectedConcept.classification}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {selectedConcept.title}
            </h1>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 pt-4">
              <div>
                <span className="text-slate-500 block text-xs uppercase font-bold">Directorate</span>
                <span className="font-bold text-white text-base">{selectedConcept.directorate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-bold">Concept Owner</span>
                <span className="font-bold text-white text-base">{selectedConcept.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-bold">Target Geography</span>
                <span className="font-bold text-white text-base">
                  {selectedConcept.isContinental ? 'Continental (55 AU Member States)' : selectedConcept.countries.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-bold">Indicative Budget</span>
                <span className="font-mono font-bold text-emerald-400 text-xl">
                  {formatCurrency(selectedConcept.estimatedCost, selectedConcept.currency)}
                </span>
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Problem Statement & Stakes of Inaction',
        content: (
          <div className="space-y-6 text-sm">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                What Problem are We Trying to Solve?
              </span>
              <p className="text-slate-100 text-base leading-relaxed">
                {selectedConcept.problemStatement}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Consequences of Inaction
              </span>
              <p className="text-rose-100 text-base leading-relaxed">
                {selectedConcept.consequencesOfInaction}
              </p>
            </div>
          </div>
        )
      },
      {
        title: 'Proposed Intervention & Expected Results',
        content: (
          <div className="space-y-6 text-sm">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Proposed Technical Intervention
              </span>
              <p className="text-emerald-100 text-base leading-relaxed font-medium">
                {selectedConcept.proposedIntervention}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Expected Beneficiaries
                </span>
                <p className="text-slate-200 text-sm">{selectedConcept.expectedBeneficiaries}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Expected Measurable Results
                </span>
                <p className="text-slate-200 text-sm">{selectedConcept.expectedResults}</p>
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Strategic Alignment & Coherence',
        content: (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Agenda 2063 Strategic Objective
              </span>
              <p className="text-slate-100 text-base">{selectedConcept.strategicObjective}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Partners & Financing Outlook
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedConcept.possibleFundingPartners.map((p, idx) => (
                  <span key={idx} className="px-3 py-1 rounded bg-slate-700 text-white font-medium text-xs">
                    {p}
                  </span>
                ))}
              </div>
              {selectedConcept.fundingNotes && (
                <p className="text-xs text-slate-400 mt-2 italic">{selectedConcept.fundingNotes}</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 block">
                  Duplicate Check Result
                </span>
                <span className="font-bold text-white text-sm">
                  {selectedConcept.duplicateStatus || 'No duplicate found'}
                </span>
              </div>
              <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                Verified
              </span>
            </div>
          </div>
        )
      }
    ];

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 sm:p-10 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              AU
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Program Board Presentation Workspace
              </span>
              <span className="text-xs text-slate-400 block">
                Slide {presentationSlide + 1} of {slides.length} • {slides[presentationSlide].title}
              </span>
            </div>
          </div>

          <button
            onClick={() => setPresentationMode(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Exit Presentation Mode (ESC)
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full py-8">
          <div className="w-full">
            <h2 className="text-xl font-bold text-slate-400 mb-6">
              {slides[presentationSlide].title}
            </h2>
            {slides[presentationSlide].content}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            disabled={presentationSlide === 0}
            onClick={() => setPresentationSlide((p) => Math.max(0, p - 1))}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold disabled:opacity-40"
          >
            ← Previous Slide
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setPresentationSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  presentationSlide === i ? 'bg-emerald-500 w-6' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            disabled={presentationSlide === slides.length - 1}
            onClick={() => setPresentationSlide((p) => Math.min(slides.length - 1, p + 1))}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold disabled:opacity-40"
          >
            Next Slide →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Workspace Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Stage 1: Program Board Concept Evaluation Workspace
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                Decision Gate
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Collective statutory board appraisal of submitted initiatives to endorse for full project development, return, merge, hold, or reject.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Presentation Mode Button */}
          <button
            type="button"
            onClick={() => {
              setPresentationSlide(0);
              setPresentationMode(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Launch Fullscreen Presentation View for Board Room"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span>Presentation Mode</span>
          </button>

          {/* Record Board Decision Button */}
          {canRecordDecision && (
            <button
              type="button"
              onClick={() => setShowDecisionModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Board Evaluation Decision</span>
            </button>
          )}
        </div>
      </div>

      {/* Concept Selector Pill Ribbon */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 px-2 flex-shrink-0">
          Queue ({eligibleConcepts.length}):
        </span>
        {eligibleConcepts.map((c) => {
          const isSelected = c.id === selectedConcept.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedConceptId(c.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
              }`}
            >
              <span>{c.code}</span>
              <span className="opacity-80 truncate max-w-[140px]">{c.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Concept Evaluation Dossier View (Section 7) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                {selectedConcept.code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium">
                {selectedConcept.classification}
              </span>
              <StatusBadge status={selectedConcept.status} size="sm" />
              <LifecycleAgeBadge initiative={selectedConcept} compact />
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span>Submitted: {formatDate(selectedConcept.dateSubmitted)}</span>
              <span>•</span>
              <span>Updated: {formatDate(selectedConcept.lastUpdated)}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {selectedConcept.title}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Directorate</span>
              <span className="font-semibold text-slate-800">{selectedConcept.directorate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Concept Owner</span>
              <span className="font-semibold text-slate-800">{selectedConcept.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Indicative Budget</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatCurrency(selectedConcept.estimatedCost, selectedConcept.currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Region</span>
              <span className="font-semibold text-slate-800 truncate block">
                {selectedConcept.isContinental ? 'Continental' : selectedConcept.regions.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Evaluation Dossier Sections (Section 7) */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Progress Ribbon */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Lifecycle Governance Progression
            </span>
            <StageProgressTracker
              currentStageCode={selectedConcept.stageCode}
              currentStatus={selectedConcept.status}
              transitions={selectedConcept.transitions}
              initiative={selectedConcept}
            />
          </div>

          {/* Problem & Inaction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Problem Statement
              </span>
              <p className="text-xs text-slate-900 leading-relaxed font-medium">
                {selectedConcept.problemStatement}
              </p>
            </div>

            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                Consequences of Inaction
              </span>
              <p className="text-xs text-rose-950 leading-relaxed font-medium">
                {selectedConcept.consequencesOfInaction}
              </p>
            </div>
          </div>

          {/* Intervention & Strategic Alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Proposed Intervention & Solution Pathway
              </span>
              <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                {selectedConcept.proposedIntervention}
              </p>
            </div>

            <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                Strategic Alignment & Umbrella Programme
              </span>
              <p className="text-xs text-sky-950 leading-relaxed font-medium">
                {selectedConcept.strategicObjective}
              </p>
              {selectedConcept.existingProgramme && (
                <div className="text-[11px] font-bold text-sky-900 pt-1">
                  Umbrella: {selectedConcept.programmeName}
                </div>
              )}
            </div>
          </div>

          {/* Beneficiaries & Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Target Beneficiaries
              </span>
              <p className="text-xs text-slate-800">{selectedConcept.expectedBeneficiaries}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Expected Measurable Results
              </span>
              <p className="text-xs text-slate-800">{selectedConcept.expectedResults}</p>
            </div>
          </div>

          {/* Similarity Check Results (Section 7) */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span className="font-bold text-amber-950 text-xs">
                  Thematic Similarity & Duplicate Check Result
                </span>
              </div>
              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-amber-100 text-amber-900 border border-amber-300">
                {selectedConcept.duplicateStatus || 'No relevant duplicate found'}
              </span>
            </div>
            {selectedConcept.similarInitiativeRef ? (
              <p className="text-xs text-amber-900">
                Matches flagged against reference initiative: <strong>{selectedConcept.similarInitiativeRef}</strong>. The Board should review synergies prior to sanctioning.
              </p>
            ) : (
              <p className="text-xs text-amber-900">
                Initial duplicate screening indicates distinct regional corridor and thematic intervention.
              </p>
            )}
          </div>

          {/* Attached Documents (Section 7) */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Attached Technical Evidence & Briefs ({selectedConcept.documents.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedConcept.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 truncate block text-xs">
                        {doc.fileName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {doc.fileSize} • {doc.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Simulating download of ${doc.fileName}`)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recorded Board Decision History (Section 7) */}
          {selectedConcept.evaluationDecision && (
            <div className="p-5 bg-indigo-50/60 border-2 border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    Recorded Board Evaluation Decision
                  </span>
                  <h4 className="text-sm font-bold text-indigo-950 mt-0.5">
                    Decision: {selectedConcept.evaluationDecision.decisionType}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {formatDateTime(selectedConcept.evaluationDecision.decisionDate)}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-800 italic">
                "{selectedConcept.evaluationDecision.collectiveBoardComment}"
              </div>

              {selectedConcept.evaluationDecision.clarificationComments && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <span className="font-bold block">Clarification Directives:</span>
                  <p>{selectedConcept.evaluationDecision.clarificationComments}</p>
                  <div className="text-[11px] text-amber-800 mt-1">
                    Due Date: <strong>{selectedConcept.evaluationDecision.dueDate}</strong> • Assigned: <strong>{selectedConcept.evaluationDecision.assignedPerson}</strong>
                  </div>
                </div>
              )}

              {selectedConcept.evaluationDecision.mergeExplanation && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                  <span className="font-bold block">Merger Recommendation:</span>
                  <p>{selectedConcept.evaluationDecision.mergeExplanation}</p>
                  <div className="text-[11px] text-purple-800 mt-1">
                    Target: <strong>{selectedConcept.evaluationDecision.targetInitiativeTitle}</strong>
                  </div>
                </div>
              )}

              {selectedConcept.evaluationDecision.holdReason && (
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 text-xs text-yellow-900 space-y-1">
                  <span className="font-bold block">Hold Justification:</span>
                  <p>{selectedConcept.evaluationDecision.holdReason}</p>
                  <div className="text-[11px] text-yellow-800 mt-1">
                    Review Date: <strong>{selectedConcept.evaluationDecision.reviewDate}</strong>
                  </div>
                </div>
              )}

              {selectedConcept.evaluationDecision.rejectionReason && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                  <span className="font-bold block">Rejection Cause:</span>
                  <p>{selectedConcept.evaluationDecision.rejectionReason}</p>
                  <div className="text-[11px] text-rose-800 mt-1">
                    Resubmission Allowed: <strong>{selectedConcept.evaluationDecision.canResubmit ? 'Yes' : 'No'}</strong>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-indigo-700">
                Evaluated by Board Panel: {selectedConcept.evaluationDecision.evaluatedBy.join(', ')}
              </div>
            </div>
          )}

          {/* Audit History Timeline (Section 7) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Complete Decision & Transition Audit History
            </span>
            <div className="space-y-2">
              {selectedConcept.transitions.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900">{t.decision}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      By <strong>{t.performedBy}</strong> ({t.performerRole}) — "{t.comments}"
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDateTime(t.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECORD BOARD EVALUATION DECISION MODAL (Section 7 Requirements) */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in duration-100 my-auto text-xs">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  Record Program Board Decision: {selectedConcept.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {decisionError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{decisionError}</span>
                </div>
              )}

              {/* Decision Options (Section 7) */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">
                  Statutory Board Determination *
                </label>
                <div className="space-y-2">
                  {[
                    {
                      type: 'Proceed to full project development',
                      label: 'Proceed to Full Project Development (Stage 2)',
                      desc: 'Concept is endorsed. Generates project record for technical TOC, Results Framework, and detailed costing.',
                      icon: CheckCircle2,
                      color: 'text-emerald-600'
                    },
                    {
                      type: 'Return for clarification',
                      label: 'Return for Clarification',
                      desc: 'Concept requires technical revisions or further evidence before board approval.',
                      icon: RotateCcw,
                      color: 'text-amber-600'
                    },
                    {
                      type: 'Merge with existing initiative',
                      label: 'Merge with Existing Initiative',
                      desc: 'Substantial overlap identified. Consolidate activities under an existing project.',
                      icon: GitMerge,
                      color: 'text-purple-600'
                    },
                    {
                      type: 'Put on hold',
                      label: 'Put on Hold',
                      desc: 'Defer consideration pending external alignment or funding agreements.',
                      icon: PauseCircle,
                      color: 'text-yellow-600'
                    },
                    {
                      type: 'Reject',
                      label: 'Reject Concept',
                      desc: 'Concept does not meet AUDA-NEPAD mandate or strategic priorities.',
                      icon: XCircle,
                      color: 'text-rose-600'
                    }
                  ].map((opt) => (
                    <label
                      key={opt.type}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        decisionType === opt.type
                          ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decisionType"
                        value={opt.type}
                        checked={decisionType === opt.type}
                        onChange={() => setDecisionType(opt.type as any)}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <opt.icon className={`w-3.5 h-3.5 ${opt.color}`} />
                          <span>{opt.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Collective Board Comment (Mandatory for all decisions - Section 7) */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Collective Board Comment & Deliberation Record *
                </label>
                <textarea
                  rows={3}
                  placeholder="Record consensus board synthesis, key findings, and strategic guidance..."
                  value={collectiveBoardComment}
                  onChange={(e) => setCollectiveBoardComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Dynamic Sub-form for RETURN FOR CLARIFICATION */}
              {decisionType === 'Return for clarification' && (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                  <span className="font-bold text-amber-950 text-xs block">
                    Clarification Requirements (Section 7)
                  </span>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">
                      Clarification Directives & Detailed Feedback *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify exactly what needs correction or deeper data..."
                      value={clarificationComments}
                      onChange={(e) => setClarificationComments(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">
                        Clarification Due Date *
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">
                        Assigned Person for Correction *
                      </label>
                      <input
                        type="text"
                        value={assignedPerson || selectedConcept.ownerName}
                        onChange={(e) => setAssignedPerson(e.target.value)}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Sub-form for MERGE */}
              {decisionType === 'Merge with existing initiative' && (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                  <span className="font-bold text-purple-950 text-xs block">
                    Merger Integration Details (Section 7)
                  </span>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-purple-900 mb-1">
                      Target Project or Initiative to Merge With *
                    </label>
                    <select
                      value={targetInitiativeId}
                      onChange={(e) => setTargetInitiativeId(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-300 rounded-lg text-slate-800"
                    >
                      <option value="">-- Choose Target Project --</option>
                      {initiatives
                        .filter((i) => i.id !== selectedConcept.id)
                        .map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.code} — {i.title} ({i.stage})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-purple-900 mb-1">
                      Merger Explanation & Operational Rationale *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain how the interventions combine and avoid duplicate overhead..."
                      value={mergeExplanation}
                      onChange={(e) => setMergeExplanation(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-purple-900 mb-1">
                      Responsible Person for Integration *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Project Manager or Directorate Director"
                      value={responsiblePerson}
                      onChange={(e) => setResponsiblePerson(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Sub-form for PUT ON HOLD */}
              {decisionType === 'Put on hold' && (
                <div className="p-4 bg-yellow-50/50 border border-yellow-200 rounded-xl space-y-3">
                  <span className="font-bold text-yellow-950 text-xs block">
                    Hold Conditions (Section 7)
                  </span>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-yellow-900 mb-1">
                      Reason for Putting on Hold *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="State strategic, diplomatic, or budgetary dependency..."
                      value={holdReason}
                      onChange={(e) => setHoldReason(e.target.value)}
                      className="w-full p-2 bg-white border border-yellow-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-yellow-900 mb-1">
                      Scheduled Review Date *
                    </label>
                    <input
                      type="date"
                      value={reviewDate}
                      onChange={(e) => setReviewDate(e.target.value)}
                      className="w-full p-2 bg-white border border-yellow-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Sub-form for REJECT */}
              {decisionType === 'Reject' && (
                <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                  <span className="font-bold text-rose-950 text-xs block">
                    Rejection Grounds (Section 7)
                  </span>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-rose-900 mb-1">
                      Reason for Rejection *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="State statutory conflict, non-viability, or policy incompatibility..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-950">
                    <input
                      type="checkbox"
                      checked={canResubmit}
                      onChange={(e) => setCanResubmit(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Concept may be restructured and resubmitted in a future cycle</span>
                  </label>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDecision}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Record Decision</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
