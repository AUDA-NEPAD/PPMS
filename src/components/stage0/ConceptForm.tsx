import React, { useState, useEffect } from 'react';
import {
  Initiative,
  Directorate,
  AfricanRegion,
  ClassificationType,
  DocumentItem
} from '../../types';
import {
  DIRECTORATES,
  AFRICAN_REGIONS,
  AFRICAN_COUNTRIES,
  PARTNERS_DATABASE,
  EXISTING_PROGRAMMES
} from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { DocumentUploadManager } from '../common/DocumentUploadManager';
import { AiDocumentImportModal } from './AiDocumentImportModal';
import { SimilarityCheckModal } from './SimilarityCheckModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Save,
  Send,
  Sparkles,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Building,
  User,
  Globe,
  DollarSign,
  Calendar,
  Lock,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  Handshake,
  ShieldCheck,
  X
} from 'lucide-react';

interface ConceptFormProps {
  concept?: Initiative | null;
  onBackToList: () => void;
}

export const ConceptForm: React.FC<ConceptFormProps> = ({
  concept,
  onBackToList
}) => {
  const {
    currentUser,
    users,
    initiatives,
    partners,
    saveConcept,
    submitConceptToBoard,
    withdrawConceptDraft,
    duplicateConcept,
    setSelectedInitiativeId
  } = useApp();

  const isEditingExisting = Boolean(concept?.id);
  const isLocked = concept ? concept.stageCode > 0 && concept.status !== 'Returned for Clarification' : false;

  // Form State
  const [formData, setFormData] = useState<Partial<Initiative>>(() => {
    if (concept) return { ...concept };

    return {
      id: `init-${Date.now()}`,
      code: `CON-2026-${String(initiatives.length + 1).padStart(3, '0')}`,
      title: '',
      classification: 'Project',
      stage: 'Stage 0: Concept Development',
      stageCode: 0,
      status: 'Draft',
      directorate: (currentUser.directorate as Directorate) || DIRECTORATES[0],
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      dateSubmitted: '',
      lastUpdated: new Date().toISOString(),
      regions: ['West African Region'],
      countries: ['Senegal'],
      isContinental: false,
      existingProgramme: false,
      programmeName: '',
      strategicObjective: '',
      implementationPeriod: '2–3 years',
      problemStatement: '',
      affectedParties: '',
      importanceStatement: '',
      consequencesOfInaction: '',
      proposedIntervention: '',
      expectedBeneficiaries: '',
      expectedResults: '',
      estimatedCost: 5000000,
      currency: 'USD',
      possibleFundingPartners: ['African Development Bank (AfDB)'],
      fundingNotes: '',
      documents: [],
      transitions: [],
      duplicateStatus: 'No relevant duplicate found'
    };
  });

  // Modal controls
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSimilarityModal, setShowSimilarityModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationAlertMsg, setValidationAlertMsg] = useState<string | null>(null);
  const [validationChecklistOpen, setValidationChecklistOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'identification' | 'geography' | 'problem' | 'proposal' | 'documents'>('identification');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Validation Rules (Section 1.6 & 19)
  const validationErrors = {
    title: !formData.title?.trim() ? 'Concept title is required' : null,
    directorate: !formData.directorate ? 'Directorate is required' : null,
    owner: !formData.ownerName ? 'Concept owner is required' : null,
    geography:
      !formData.isContinental && (!formData.countries || formData.countries.length === 0)
        ? 'Select at least one country or choose Continental'
        : null,
    strategicObjective: !formData.strategicObjective?.trim()
      ? 'Strategic objective supported is required'
      : null,
    problemStatement: !formData.problemStatement?.trim()
      ? 'Problem statement is required'
      : null,
    affectedParties: !formData.affectedParties?.trim()
      ? 'Affected parties is required'
      : null,
    importanceStatement: !formData.importanceStatement?.trim()
      ? 'Why it matters is required'
      : null,
    consequencesOfInaction: !formData.consequencesOfInaction?.trim()
      ? 'Consequences of inaction is required'
      : null,
    proposedIntervention: !formData.proposedIntervention?.trim()
      ? 'Proposed intervention is required'
      : null,
    expectedBeneficiaries: !formData.expectedBeneficiaries?.trim()
      ? 'Expected beneficiaries is required'
      : null,
    expectedResults: !formData.expectedResults?.trim()
      ? 'Expected results is required'
      : null,
    estimatedCost:
      (formData.estimatedCost || 0) <= 0 ? 'Rough cost estimate must be greater than zero' : null
  };

  const missingFieldsList = Object.entries(validationErrors)
    .filter(([_, err]) => err !== null)
    .map(([_, err]) => err as string);

  const isValidForSubmission = missingFieldsList.length === 0;

  const getTabForField = (field: string): 'identification' | 'geography' | 'problem' | 'proposal' | 'documents' => {
    switch (field) {
      case 'title':
      case 'directorate':
      case 'owner':
        return 'identification';
      case 'geography':
      case 'strategicObjective':
        return 'geography';
      case 'problemStatement':
      case 'affectedParties':
      case 'importanceStatement':
      case 'consequencesOfInaction':
        return 'problem';
      case 'proposedIntervention':
      case 'expectedBeneficiaries':
      case 'expectedResults':
      case 'estimatedCost':
      default:
        return 'proposal';
    }
  };

  const getTabForError = (err: string): 'identification' | 'geography' | 'problem' | 'proposal' | 'documents' => {
    const lower = err.toLowerCase();
    if (lower.includes('title') || lower.includes('directorate') || lower.includes('owner')) return 'identification';
    if (lower.includes('country') || lower.includes('continental') || lower.includes('strategic objective')) return 'geography';
    if (lower.includes('problem statement') || lower.includes('affected parties') || lower.includes('why it matters') || lower.includes('consequences')) return 'problem';
    return 'proposal';
  };

  // Handle Save Draft
  const handleSaveDraft = () => {
    const updated: Initiative = {
      ...(formData as Initiative),
      lastUpdated: new Date().toISOString()
    };
    saveConcept(updated);
    setSaveSuccessMsg('Concept draft saved successfully!');
    setValidationAlertMsg(null);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Handle Submission to Board - opens confirmation modal or navigates to missing fields
  const handleSubmitToBoard = () => {
    if (!isValidForSubmission) {
      setValidationChecklistOpen(true);
      const firstInvalidEntry = Object.entries(validationErrors).find(([_, err]) => err !== null);
      if (firstInvalidEntry) {
        const targetTab = getTabForField(firstInvalidEntry[0]);
        setActiveTab(targetTab);
      }
      setValidationAlertMsg(
        `Cannot submit yet: ${missingFieldsList.length} mandatory field${
          missingFieldsList.length > 1 ? 's are' : ' is'
        } incomplete. Switched to section needing your input.`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationAlertMsg(null);
    setShowSubmitModal(true);
  };

  // Confirm Transmission to Board
  const handleConfirmSubmitToBoard = () => {
    setIsSubmitting(true);
    const timestamp = new Date().toISOString();
    const finalConcept: Initiative = {
      ...(formData as Initiative),
      lastUpdated: timestamp
    };

    // Save concept to state first to guarantee persistence
    saveConcept(finalConcept);
    // Submit to board with full payload to transition directly into Stage 1
    submitConceptToBoard(finalConcept.id, finalConcept);

    setSaveSuccessMsg(`Concept "${finalConcept.title}" successfully transmitted to the Programme Board!`);
    setShowSubmitModal(false);
    setIsSubmitting(false);

    setTimeout(() => {
      onBackToList();
    }, 600);
  };

  // Handle Withdraw
  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = () => {
    withdrawConceptDraft(formData.id!);
    setFormData((prev) => ({ ...prev, status: 'Draft', stageCode: 0 }));
    setShowWithdrawModal(false);
    setSaveSuccessMsg('Submission withdrawn back to Draft status.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Handle Duplicate
  const handleDuplicate = () => {
    setShowDuplicateModal(true);
  };

  const handleConfirmDuplicate = () => {
    duplicateConcept(formData.id!);
    setShowDuplicateModal(false);
    onBackToList();
  };

  // Handle AI Import data application
  const handleApplyExtractedData = (
    extracted: Record<string, any>,
    sourceDoc: DocumentItem
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...extracted,
      documents: [...(prev.documents || []), sourceDoc]
    }));
    setSaveSuccessMsg('Extracted values applied and source document attached!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Toggle Country Selection
  const handleToggleCountry = (country: string) => {
    if (isLocked) return;
    const current = formData.countries || [];
    if (current.includes(country)) {
      setFormData((prev) => ({
        ...prev,
        countries: current.filter((c) => c !== country)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        countries: [...current, country]
      }));
    }
  };

  // Toggle Region Selection
  const handleToggleRegion = (region: AfricanRegion) => {
    if (isLocked) return;
    const current = formData.regions || [];
    if (current.includes(region)) {
      setFormData((prev) => ({
        ...prev,
        regions: current.filter((r) => r !== region)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        regions: [...current, region]
      }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToList}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to concepts list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                {formData.code}
              </span>
              <StatusBadge status={formData.status || 'Draft'} size="sm" />
              {isLocked && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Locked for Evaluation</span>
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
              {formData.title || 'New Initiative Concept Registration'}
            </h1>
          </div>
        </div>

        {/* Action Buttons Toolbar (Section 1.6) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* AI Import Button (Section 1.7) */}
          {!isLocked && (
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Import from Document</span>
            </button>
          )}

          {/* Similarity Check Button (Section 1.8) */}
          <button
            type="button"
            onClick={() => setShowSimilarityModal(true)}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-amber-600" />
            <span>Check for Similar Concepts</span>
          </button>

          {/* Duplicate Draft */}
          {isEditingExisting && (
            <button
              type="button"
              onClick={handleDuplicate}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Duplicate as Draft
            </button>
          )}

          {/* Save Draft */}
          {!isLocked && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Draft</span>
            </button>
          )}

          {/* Submit to Board Button */}
          {!isLocked && (
            <button
              type="button"
              onClick={handleSubmitToBoard}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit to Program Board</span>
            </button>
          )}

          {/* Withdraw Draft */}
          {formData.status === 'Submitted to Board' && (
            <button
              type="button"
              onClick={handleWithdraw}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Withdraw to Draft</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Validation Alert Notice */}
      {validationAlertMsg && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{validationAlertMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationAlertMsg(null)}
            className="text-amber-700 hover:text-amber-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Validation Checklist Banner (Section 1.6) */}
      {validationChecklistOpen && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Submission Readiness Checklist ({missingFieldsList.length} items missing)</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationChecklistOpen(false)}
              className="text-amber-700 hover:text-amber-900 font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-amber-800 text-[11px]">
            The Program Board requires all essential governance fields before entering Stage 1 Evaluation. Click any missing item below to jump directly to its section:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            {missingFieldsList.map((err, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    const targetTab = getTabForError(err);
                    setActiveTab(targetTab);
                  }}
                  className="flex items-center gap-1.5 text-amber-900 hover:text-amber-950 font-medium hover:underline text-left cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                  <span>{err}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Tabs for Long Record */}
      <div className="bg-white border-b border-slate-200 rounded-t-2xl px-6 flex gap-4 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'identification', label: '1.1 Identification & Classification', icon: FileText },
          { id: 'geography', label: '1.2 Geography & Programme Alignment', icon: Globe },
          { id: 'problem', label: '1.3 Problem or Opportunity', icon: AlertTriangle },
          { id: 'proposal', label: '1.4 Intervention & Cost Estimate', icon: DollarSign },
          { id: 'documents', label: '1.5 Supporting Documents', icon: FileCheck2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-1 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Card */}
      <div className="bg-white p-6 rounded-b-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
        {/* SECTION 1.1: IDENTIFICATION FIELDS */}
        {activeTab === 'identification' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Concept ID (Auto-Generated)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  disabled
                  className="w-full p-2.5 bg-slate-100 font-mono font-bold text-slate-700 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Classification *
                </label>
                <select
                  disabled={isLocked}
                  value={formData.classification}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      classification: e.target.value as ClassificationType
                    }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Programme">Programme (Multi-Country / Multi-Year Umbrella)</option>
                  <option value="Project">Project (Discrete Intervention)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Indicative Implementation Period *
                </label>
                <select
                  disabled={isLocked}
                  value={formData.implementationPeriod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      implementationPeriod: e.target.value as any
                    }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="1–2 years">1–2 years</option>
                  <option value="2–3 years">2–3 years</option>
                  <option value="3–4 years">3–4 years</option>
                  <option value="4–5 years">4–5 years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Concept Title *
              </label>
              <input
                type="text"
                disabled={isLocked}
                placeholder="Enter definitive title of the proposed initiative..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className={`w-full p-2.5 bg-white border rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  validationErrors.title ? 'border-amber-300' : 'border-slate-300'
                }`}
              />
              {validationErrors.title && (
                <span className="text-[10px] text-amber-700 mt-1 block">
                  {validationErrors.title}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Directorate (AUDA-NEPAD Division) *
                </label>
                <select
                  disabled={isLocked}
                  value={formData.directorate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      directorate: e.target.value as Directorate
                    }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {DIRECTORATES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Concept Owner / Submitting Lead *
                </label>
                <select
                  disabled={isLocked}
                  value={formData.ownerId}
                  onChange={(e) => {
                    const u = users.find((x) => x.id === e.target.value);
                    if (u) {
                      setFormData((prev) => ({
                        ...prev,
                        ownerId: u.id,
                        ownerName: u.name
                      }));
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title || u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duplicate Status Tag */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Similarity & Duplicate Check Status
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {formData.duplicateStatus || 'No relevant duplicate found'}
                </span>
                {formData.similarInitiativeRef && (
                  <span className="text-[11px] text-slate-500 block">
                    Referenced match: <strong>{formData.similarInitiativeRef}</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSimilarityModal(true)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Inspect / Re-check
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1.2: GEOGRAPHY & PROGRAMME ALIGNMENT */}
        {activeTab === 'geography' && (
          <div className="space-y-6">
            {/* Continental Checkbox */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  Continental Scope Implementation
                </span>
                <span className="text-[11px] text-slate-500">
                  Select if initiative spans all 55 African Union Member States.
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800">
                <input
                  type="checkbox"
                  disabled={isLocked}
                  checked={formData.isContinental}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isContinental: e.target.checked
                    }))
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span>Continental Initiative</span>
              </label>
            </div>

            {!formData.isContinental && (
              <>
                {/* Regions Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                    Target African Regions (Select all applicable) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AFRICAN_REGIONS.filter((r) => r !== 'Continental').map((r) => {
                      const isSelected = formData.regions?.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleToggleRegion(r)}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* African Countries Multi-select */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      Target African Member States ({formData.countries?.length || 0} selected) *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Click to toggle country selection
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {AFRICAN_COUNTRIES.map((country) => {
                      const isSelected = formData.countries?.includes(country);
                      return (
                        <label
                          key={country}
                          className={`flex items-center gap-1.5 p-1 rounded cursor-pointer text-[11px] ${
                            isSelected
                              ? 'bg-emerald-100/70 text-emerald-900 font-bold'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={isSelected}
                            onChange={() => handleToggleCountry(country)}
                            className="text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="truncate">{country}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Programme Alignment (Section 1.2.1) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Alignment with Existing Umbrella Programme?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Does this initiative nest under an established framework like PIDA, CAADP, or AfCFTA?
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="existingProgramme"
                      disabled={isLocked}
                      checked={formData.existingProgramme === true}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, existingProgramme: true }))
                      }
                      className="text-emerald-600"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="existingProgramme"
                      disabled={isLocked}
                      checked={formData.existingProgramme === false}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          existingProgramme: false,
                          programmeName: ''
                        }))
                      }
                      className="text-emerald-600"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {formData.existingProgramme && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Select Established Programme *
                  </label>
                  <select
                    disabled={isLocked}
                    value={formData.programmeName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        programmeName: e.target.value
                      }))
                    }
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose Umbrella Programme --</option>
                    {EXISTING_PROGRAMMES.map((prog) => (
                      <option key={prog.id} value={prog.name}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Strategic Objective Supported *
                </label>
                <textarea
                  disabled={isLocked}
                  rows={2}
                  placeholder="Articulate specific AU Agenda 2063 objective or AUDA-NEPAD Strategic Plan goal addressed..."
                  value={formData.strategicObjective}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      strategicObjective: e.target.value
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1.3: PROBLEM OR OPPORTUNITY */}
        {activeTab === 'problem' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  What Problem are We Trying to Solve? *
                </label>
                <textarea
                  disabled={isLocked}
                  rows={4}
                  placeholder="Describe root developmental challenge, bottleneck, or market failure..."
                  value={formData.problemStatement}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      problemStatement: e.target.value
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Who is Affected? *
                </label>
                <textarea
                  disabled={isLocked}
                  rows={4}
                  placeholder="Detail demographic groups, communities, member states, or institutions affected..."
                  value={formData.affectedParties}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      affectedParties: e.target.value
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Why Does It Matter? *
                </label>
                <textarea
                  disabled={isLocked}
                  rows={4}
                  placeholder="Strategic socio-economic importance and alignment with pan-African integration..."
                  value={formData.importanceStatement}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      importanceStatement: e.target.value
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-rose-700 mb-1">
                  What Happens If Nothing is Done? (Consequences of Inaction) *
                </label>
                <textarea
                  disabled={isLocked}
                  rows={4}
                  placeholder="Projected losses, economic fallout, environmental deterioration, or conflict risks..."
                  value={formData.consequencesOfInaction}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      consequencesOfInaction: e.target.value
                    }))
                  }
                  className="w-full p-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1.4: INITIAL PROPOSAL */}
        {activeTab === 'proposal' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Proposed Intervention *
              </label>
              <textarea
                disabled={isLocked}
                rows={3}
                placeholder="Core transformative solution, catalytic inputs, physical works, or technical assistance..."
                value={formData.proposedIntervention}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposedIntervention: e.target.value
                  }))
                }
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Expected Beneficiaries *
                </label>
                <textarea
                  disabled={isLocked}
                  rows={3}
                  placeholder="Estimated number of citizens, youth, women, farmers, enterprises reached..."
                  value={formData.expectedBeneficiaries}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expectedBeneficiaries: e.target.value
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Expected Measurable Results *
                </label>
                <textarea
                  disabled={isLocked}
                  rows={3}
                  placeholder="Key milestones, outputs, economic rates of return, or policy adoptions..."
                  value={formData.expectedResults}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expectedResults: e.target.value
                    }))
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Budget & Funding Source (Section 1.4) */}
            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-emerald-800 mb-1">
                    Rough Cost Estimate *
                  </label>
                  <input
                    type="number"
                    disabled={isLocked}
                    min={0}
                    step={50000}
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimatedCost: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-emerald-800 mt-1 block">
                    Formatted: <strong>{formatCurrency(formData.estimatedCost || 0, formData.currency || 'USD')}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-emerald-800 mb-1">
                    Currency *
                  </label>
                  <select
                    disabled={isLocked}
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currency: e.target.value
                      }))
                    }
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              {/* Funding Source from Partner's Database */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Possible Funding Partners (Select from Partner's Database)
                  </label>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {partners.length} Partners in Database
                  </span>
                </div>

                {/* Dropdown list to select partner(s) */}
                <div>
                  <select
                    disabled={isLocked}
                    value=""
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      if (!selectedVal) return;
                      const current = formData.possibleFundingPartners || [];
                      if (!current.includes(selectedVal)) {
                        setFormData((prev) => ({
                          ...prev,
                          possibleFundingPartners: [...current, selectedVal]
                        }));
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Choose a Development Partner to add to this Concept --</option>
                    {partners
                      .filter((p) => !(formData.possibleFundingPartners || []).includes(p.name))
                      .map((partner) => (
                        <option key={partner.id} value={partner.name}>
                          {partner.name} ({partner.type} • {partner.country})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selected Partners Badges */}
                {(formData.possibleFundingPartners && formData.possibleFundingPartners.length > 0) ? (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      Selected Development Partners for this Proposal:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {formData.possibleFundingPartners.map((partnerName) => {
                        const partnerObj = partners.find((p) => p.name === partnerName);
                        return (
                          <span
                            key={partnerName}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-xs font-medium shadow-2xs"
                          >
                            <Handshake className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                            <span>{partnerName}</span>
                            {partnerObj?.country && (
                              <span className="text-[10px] text-purple-500 font-normal">
                                ({partnerObj.country})
                              </span>
                            )}
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    possibleFundingPartners: (prev.possibleFundingPartners || []).filter(
                                      (p) => p !== partnerName
                                    )
                                  }));
                                }}
                                className="ml-1 p-0.5 text-purple-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                                title="Remove partner"
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    No development partners currently attached. Select one or more partners from the dropdown list above.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Funding Notes & Co-financing Strategy
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  placeholder="e.g. Blended finance, concessional loan window, national counterpart contribution..."
                  value={formData.fundingNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fundingNotes: e.target.value
                    }))
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1.5: SUPPORTING DOCUMENTS */}
        {activeTab === 'documents' && (
          <DocumentUploadManager
            documents={formData.documents || []}
            currentUser={currentUser}
            readOnly={isLocked}
            onAddDocument={(doc) =>
              setFormData((prev) => ({
                ...prev,
                documents: [...(prev.documents || []), doc]
              }))
            }
            onDeleteDocument={(docId) =>
              setFormData((prev) => ({
                ...prev,
                documents: (prev.documents || []).filter((d) => d.id !== docId)
              }))
            }
          />
        )}

        {/* Form Bottom Action Toolbar */}
        {!isLocked && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              {isValidForSubmission ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All mandatory governance fields completed. Ready for Board Submission.
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {missingFieldsList.length} required field{missingFieldsList.length > 1 ? 's' : ''} remaining before submission.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors flex items-center gap-1.5 shadow-2xs text-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitToBoard}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs text-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Program Board</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Document Import Modal */}
      <AiDocumentImportModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyExtractedData={handleApplyExtractedData}
        currentUser={currentUser}
      />

      {/* Similarity & Duplicate Check Modal */}
      <SimilarityCheckModal
        isOpen={showSimilarityModal}
        onClose={() => setShowSimilarityModal(false)}
        currentConcept={formData}
        allInitiatives={initiatives}
        onSelectDuplicateStatus={(status, refCode) =>
          setFormData((prev) => ({
            ...prev,
            duplicateStatus: status,
            similarInitiativeRef: refCode || prev.similarInitiativeRef
          }))
        }
        onInspectInitiative={(id) => setSelectedInitiativeId(id)}
      />

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Send className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Submit Concept to Programme Board
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Stage 0 Concept Formulation ➔ Stage 1 Board Evaluation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proposal Key Highlights */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-700 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formData.code}
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatCurrency(formData.estimatedCost || 0, formData.currency || 'USD')}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                {formData.title}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Directorate</span>
                  <span className="font-semibold text-slate-800 truncate block">{formData.directorate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Concept Lead</span>
                  <span className="font-semibold text-slate-800 truncate block">{formData.ownerName}</span>
                </div>
              </div>
            </div>

            {/* Potential Duplicate Warning if applicable */}
            {(formData.duplicateStatus === 'Potential duplicate' || formData.duplicateStatus === 'Review required') && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>Similarity Check Acknowledgment</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This concept is flagged as <strong>"{formData.duplicateStatus}"</strong>. By confirming transmission, you certify that the rationale and divergence from existing pipeline initiatives has been verified.
                </p>
              </div>
            )}

            {/* Statutory Gate Notice */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Statutory Governance Gate:</strong> Once transmitted, technical fields will be locked for editing while the Programme Board undertakes strategic and technical evaluation.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmitToBoard}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting...' : 'Confirm & Submit to Programme Board'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW CONFIRMATION MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Withdraw Submission to Draft</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to withdraw this concept from Programme Board evaluation back to Draft status? Technical fields will be unlocked for revisions.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DUPLICATE CONFIRMATION MODAL */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Copy className="w-5 h-5 text-indigo-600" />
              <span>Duplicate Concept Record</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create a new draft concept cloned from this record? A new concept code and tracking ID will be generated.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDuplicate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Create Duplicate Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
