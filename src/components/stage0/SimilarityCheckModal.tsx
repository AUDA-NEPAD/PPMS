import React, { useState } from 'react';
import { Initiative } from '../../types';
import {
  performSimilarityCheck,
  SimilarityResult
} from '../../utils/similarityCheck';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldAlert,
  X,
  Layers,
  ArrowRight,
  GitMerge,
  Info
} from 'lucide-react';

interface SimilarityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConcept: Partial<Initiative>;
  allInitiatives: Initiative[];
  onSelectDuplicateStatus: (
    status:
      | 'No relevant duplicate found'
      | 'Potential duplicate'
      | 'Related initiative'
      | 'Merge recommended'
      | 'Review required',
    referenceCode?: string
  ) => void;
  onInspectInitiative: (id: string) => void;
}

export const SimilarityCheckModal: React.FC<SimilarityCheckModalProps> = ({
  isOpen,
  onClose,
  currentConcept,
  allInitiatives,
  onSelectDuplicateStatus,
  onInspectInitiative
}) => {
  const [selectedStatus, setSelectedStatus] = useState<
    | 'No relevant duplicate found'
    | 'Potential duplicate'
    | 'Related initiative'
    | 'Merge recommended'
    | 'Review required'
  >(currentConcept.duplicateStatus || 'No relevant duplicate found');

  const [selectedRef, setSelectedRef] = useState<string>(
    currentConcept.similarInitiativeRef || ''
  );

  if (!isOpen) return null;

  const matches = performSimilarityCheck(
    currentConcept,
    allInitiatives,
    currentConcept.id
  );

  const handleSaveAssessment = () => {
    onSelectDuplicateStatus(selectedStatus, selectedRef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-xs">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Thematic & Duplicate Similarity Check</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {matches.length} matches detected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Evaluation across titles, problem statements, methodologies, geography, and programme alignment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Active Concept Summary Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Initiative Being Tested
            </span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {currentConcept.title || 'Untitled Draft Concept'}
            </div>
            <div className="text-slate-600 mt-1 flex flex-wrap items-center gap-2 text-[11px]">
              <span>Directorate: {currentConcept.directorate}</span>
              <span>•</span>
              <span>
                Geography:{' '}
                {currentConcept.isContinental
                  ? 'Continental'
                  : currentConcept.countries?.join(', ') || 'N/A'}
              </span>
            </div>
          </div>

          {/* Similarity Matches List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500">
                Coherence & Potential Overlap Register
              </span>
              <span className="text-[11px] text-slate-400">
                Sorted by thematic similarity score
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">
                  No Conflicting Duplicates Identified
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The current title, problem parameters, and geographic corridor appear distinct from active pipeline records.
                </p>
              </div>
            ) : (
              matches.map((match) => {
                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (match.similarityPercentage >= 65) {
                  badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                } else if (match.similarityPercentage >= 40) {
                  badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
                } else {
                  badgeClass = 'bg-sky-100 text-sky-800 border-sky-200';
                }

                return (
                  <div
                    key={match.initiativeId}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {match.code}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 font-medium">
                            {match.stage}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">
                          {match.title}
                        </h4>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs border ${badgeClass}`}
                        >
                          {match.similarityPercentage}% Similarity
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Owner: {match.ownerName}</span>
                      <span>•</span>
                      <span>Directorate: {match.directorate}</span>
                    </div>

                    {/* Matching Factors */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Similarity Analysis:
                      </span>
                      <p className="text-[11px] leading-relaxed font-medium">
                        {match.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRef(match.code);
                          setSelectedStatus('Potential duplicate');
                        }}
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          selectedRef === match.code
                            ? 'text-emerald-700 font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            selectedRef === match.code
                              ? 'text-emerald-600'
                              : 'text-slate-300'
                          }`}
                        />
                        <span>Reference this concept as primary match</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onInspectInitiative(match.initiativeId)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      >
                        <span>Inspect Record</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* User Recorded Determination (Requirement 1.8) */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                Record Official Duplicate Assessment
              </h3>
            </div>
            <p className="text-[11px] text-emerald-900">
              The user must confirm an official duplicate status prior to submitting to the Program Board. Records are not automatically merged.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  value: 'No relevant duplicate found',
                  label: 'No Relevant Duplicate Found',
                  desc: 'Concept is sufficiently distinct in geography, target group, or methodology.'
                },
                {
                  value: 'Potential duplicate',
                  label: 'Potential Duplicate',
                  desc: 'Substantial overlap with existing project; requires board scrutiny.'
                },
                {
                  value: 'Related initiative',
                  label: 'Related Initiative',
                  desc: 'Complements existing initiative without duplicative budgeting.'
                },
                {
                  value: 'Merge recommended',
                  label: 'Merge Recommended',
                  desc: 'Recommend consolidating this concept with target project in Stage 1.'
                },
                {
                  value: 'Review required',
                  label: 'Review Required',
                  desc: 'Technical working group must verify duplication before approval.'
                }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    selectedStatus === opt.value
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white/70 border-slate-200 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="duplicateStatus"
                    value={opt.value}
                    checked={selectedStatus === opt.value}
                    onChange={() => setSelectedStatus(opt.value as any)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      {opt.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {selectedRef && (
              <div className="text-[11px] text-slate-600 font-medium">
                Referenced Related Initiative Code:{' '}
                <strong className="text-slate-900 font-mono">{selectedRef}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAssessment}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <span>Confirm & Record Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
