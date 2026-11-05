import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Initiative,
  FinancingAgreement,
  MoUItem,
  NegotiationRecord,
  WorkflowTransition
} from '../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { StageProgressTracker } from '../common/StageProgressTracker';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import {
  FileSignature,
  Handshake,
  DollarSign,
  Calendar,
  Building,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  Sliders,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertCircle,
  FileCheck,
  CheckCheck,
  Ban,
  Layers,
  Sparkles
} from 'lucide-react';

export const ContractingWorkspace: React.FC = () => {
  const {
    initiatives,
    currentUser,
    selectedContractingId,
    setSelectedContractingId,
    saveFinancingAgreement,
    addNegotiationRecord,
    updateNegotiationStatus,
    addMoUItem,
    updateMoUStatus,
    finalizeFinancing,
    setSelectedInitiativeId,
    setCurrentPage
  } = useApp();

  // Role permissions: Contracting Officer and Admin have operational authority
  const isContractingOfficer =
    currentUser.role === 'Contracting Officer' || currentUser.role === 'System Administrator';

  // Find all initiatives in Stage 5 or approved for contracting
  const contractingInitiatives = useMemo(() => {
    return initiatives.filter(
      (i) =>
        i.stageCode === 5 ||
        i.status === 'Under Contracting' ||
        i.status === 'Financing Finalized' ||
        i.status === 'Approved' ||
        i.status === 'Conditionally Approved'
    );
  }, [initiatives]);

  // Fallback to init-10 or first available
  const activeInitiative = useMemo(() => {
    if (selectedContractingId) {
      const found = initiatives.find((i) => i.id === selectedContractingId);
      if (found) return found;
    }
    if (contractingInitiatives.length > 0) {
      return contractingInitiatives[0];
    }
    return initiatives.find((i) => i.id === 'init-10') || initiatives[0];
  }, [initiatives, selectedContractingId, contractingInitiatives]);

  // Working state for active initiative's Financing Agreement
  const [faData, setFaData] = useState<Partial<FinancingAgreement>>(() => {
    return (
      activeInitiative?.financingAgreement || {
        reference: `FA-AUDA-${Date.now().toString().slice(-4)}`,
        instrument: 'Non-reimbursable grant',
        grantAmount: activeInitiative?.totalCalculatedBudget || activeInitiative?.estimatedCost || 0,
        currency: activeInitiative?.currency || 'USD',
        procurementStandard: 'Joint Harmonized Standards',
        auditCadence: 'Annually',
        reportingCadence: 'Quarterly',
        counterpartFunding: 0,
        agreementDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2030-12-31',
        implementingPartner: activeInitiative?.possibleFundingPartners?.[0] || 'Implementing Partner',
        focalPerson: currentUser.name,
        conditions: ''
      }
    );
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'agreement' | 'negotiations' | 'mous'>('agreement');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal states
  const [showAddNegModal, setShowAddNegModal] = useState(false);
  const [showAddMouModal, setShowAddMouModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [finalizeNotes, setFinalizeNotes] = useState('');

  // New Negotiation Form State
  const [negPartner, setNegPartner] = useState(activeInitiative?.possibleFundingPartners?.[0] || 'Strategic Partner');
  const [negDate, setNegDate] = useState(new Date().toISOString().split('T')[0]);
  const [negParticipants, setNegParticipants] = useState(`${currentUser.name} (AUDA-NEPAD), Partner Mission`);
  const [negTopic, setNegTopic] = useState('');
  const [negSummary, setNegSummary] = useState('');
  const [negIssues, setNegIssues] = useState('');
  const [negDecisions, setNegDecisions] = useState('');
  const [negActions, setNegActions] = useState('');
  const [negDueDate, setNegDueDate] = useState('2026-11-15');

  // New MoU Form State
  const [mouRef, setMouRef] = useState(`MOU-AUDA-${Date.now().toString().slice(-4)}`);
  const [mouTitle, setMouTitle] = useState('');
  const [mouPartner, setMouPartner] = useState(activeInitiative?.possibleFundingPartners?.[0] || 'Partner Institution');
  const [mouCountry, setMouCountry] = useState(activeInitiative?.countries?.[0] || 'Regional');
  const [mouParties, setMouParties] = useState('AUDA-NEPAD CEO & Partner Authorized Representative');
  const [mouSignDate, setMouSignDate] = useState(new Date().toISOString().split('T')[0]);
  const [mouEffectiveDate, setMouEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [mouExpiryDate, setMouExpiryDate] = useState('2031-12-31');
  const [mouScope, setMouScope] = useState('');

  // Sync state whenever activeInitiative changes
  useEffect(() => {
    if (activeInitiative) {
      if (activeInitiative.financingAgreement) {
        setFaData(activeInitiative.financingAgreement);
      } else {
        setFaData({
          reference: `FA-AUDA-${Date.now().toString().slice(-4)}`,
          instrument: 'Non-reimbursable grant',
          grantAmount: activeInitiative.totalCalculatedBudget || activeInitiative.estimatedCost || 0,
          currency: activeInitiative.currency || 'USD',
          procurementStandard: 'Joint Harmonized Standards',
          auditCadence: 'Annually',
          reportingCadence: 'Quarterly',
          counterpartFunding: 0,
          agreementDate: new Date().toISOString().split('T')[0],
          startDate: new Date().toISOString().split('T')[0],
          endDate: '2030-12-31',
          implementingPartner: activeInitiative.possibleFundingPartners?.[0] || 'Implementing Partner',
          focalPerson: currentUser.name,
          conditions: ''
        });
      }
      setSaveSuccessMessage(null);
      setFormError(null);
    }
  }, [activeInitiative?.id]);

  const handleSaveAgreement = () => {
    if (!activeInitiative || !isContractingOfficer) return;
    saveFinancingAgreement(activeInitiative.id, faData);
    setSaveSuccessMessage('Financing Agreement parameters saved successfully.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleCreateNegotiation = () => {
    if (!activeInitiative || !isContractingOfficer) return;
    if (!negTopic.trim() || !negSummary.trim()) {
      setFormError('Topic and summary are mandatory.');
      return;
    }

    addNegotiationRecord(activeInitiative.id, {
      partner: negPartner,
      date: negDate,
      participants: negParticipants,
      topic: negTopic,
      summary: negSummary,
      issuesRaised: negIssues,
      decisionsMade: negDecisions,
      actionsRequired: negActions,
      responsiblePerson: currentUser.name,
      dueDate: negDueDate,
      status: 'Open'
    });

    setShowAddNegModal(false);
    setNegTopic('');
    setNegSummary('');
    setNegIssues('');
    setNegDecisions('');
    setNegActions('');
    setSaveSuccessMessage('Bilateral partner negotiation session logged.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleCreateMoU = () => {
    if (!activeInitiative || !isContractingOfficer) return;
    if (!mouTitle.trim() || !mouPartner.trim()) {
      setFormError('MoU title and partner name are required.');
      return;
    }

    addMoUItem(activeInitiative.id, {
      referenceNumber: mouRef,
      title: mouTitle,
      partner: mouPartner,
      partnerCountry: mouCountry,
      signingParties: mouParties,
      signingDate: mouSignDate,
      effectiveDate: mouEffectiveDate,
      expiryDate: mouExpiryDate,
      scope: mouScope || 'Institutional bilateral cooperation and financing execution.',
      status: 'Signed'
    });

    setShowAddMouModal(false);
    setMouTitle('');
    setMouScope('');
    setSaveSuccessMessage('Memorandum of Understanding registered in the institutional repository.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleConfirmFinalize = () => {
    if (!activeInitiative || !isContractingOfficer) return;
    finalizeFinancing(activeInitiative.id, finalizeNotes || undefined);
    setShowFinalizeModal(false);
    setSaveSuccessMessage('Financing successfully finalized and sealed! Initiative is authorized for active implementation.');
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  if (!activeInitiative) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <FileSignature className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">No Initiatives Under Contracting</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          All approved projects will automatically transition into this workspace once CEO sanction is granted.
        </p>
      </div>
    );
  }

  const isFinalized = activeInitiative.status === 'Financing Finalized';

  return (
    <div className="space-y-6">
      {/* Top Banner: Stage 5 Contracting Gate */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyan-50/70 via-white to-teal-50/50">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-700 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-cyan-900 bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-300">
                  Stage 5: Contracting & Financing Execution Gate
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
                  Envelope: {formatCurrency(activeInitiative.totalCalculatedBudget || activeInitiative.estimatedCost, activeInitiative.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Print */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-300"
              title="Official Financing Agreement Document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Contracting Dossier</span>
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

        {/* Role Permission Notice Banner */}
        {!isContractingOfficer ? (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Consultative Review Mode:</strong> You are logged in as{' '}
                <span className="font-bold underline">{currentUser.role}</span>. In accordance with
                contracting policies, only <strong>Contracting Officers</strong> and{' '}
                <strong>System Administrators</strong> can modify legal covenants or seal financing agreements.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              Read-Only
            </span>
          </div>
        ) : (
          <div className="px-5 py-2.5 bg-cyan-50/80 border-b border-cyan-200 text-xs text-cyan-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-700" />
              <span>
                <strong>Contracting & Compliance Officer Active:</strong> Authorized to execute financing agreements,
                manage partner negotiations, and register signed MoUs.
              </span>
            </div>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-300">
              Contracting Authority Active
            </span>
          </div>
        )}

        {/* Initiatives Switcher */}
        <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700 flex-shrink-0">
            <Sliders className="w-3.5 h-3.5 text-cyan-700" />
            <span>Contracting Pipeline ({contractingInitiatives.length}):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {contractingInitiatives.map((init) => (
              <button
                key={init.id}
                onClick={() => setSelectedContractingId(init.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeInitiative.id === init.id
                    ? 'bg-cyan-700 text-white shadow-2xs font-bold'
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
          onClick={() => setActiveTab('agreement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'agreement'
              ? 'bg-cyan-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Master Financing Agreement</span>
        </button>

        <button
          onClick={() => setActiveTab('negotiations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'negotiations'
              ? 'bg-cyan-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Bilateral Negotiation Logs</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
            {activeInitiative.negotiations?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mous')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'mous'
              ? 'bg-cyan-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>MoU & Bilateral Agreements</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
            {activeInitiative.mous?.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: Master Financing Agreement */}
      {activeTab === 'agreement' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                Statutory Contracting Terms
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Master Financing Agreement Parameters
              </h3>
            </div>
            {isFinalized && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Financing Finalized & Sealed</span>
              </span>
            )}
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Agreement Reference:
              </label>
              <input
                type="text"
                disabled={!isContractingOfficer || isFinalized}
                value={faData.reference || ''}
                onChange={(e) => setFaData((prev) => ({ ...prev, reference: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Financing Instrument:
              </label>
              <select
                disabled={!isContractingOfficer || isFinalized}
                value={faData.instrument || 'Non-reimbursable grant'}
                onChange={(e) => setFaData((prev) => ({ ...prev, instrument: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              >
                <option value="Non-reimbursable grant">Non-reimbursable grant</option>
                <option value="Blended financing facility">Blended financing facility</option>
                <option value="Technical assistance">Technical assistance</option>
                <option value="In-kind or Member State contribution">In-kind or Member State contribution</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Primary Implementing Partner:
              </label>
              <input
                type="text"
                disabled={!isContractingOfficer || isFinalized}
                value={faData.implementingPartner || ''}
                onChange={(e) => setFaData((prev) => ({ ...prev, implementingPartner: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Total Grant Envelope ({faData.currency || 'USD'}):
              </label>
              <input
                type="number"
                disabled={!isContractingOfficer || isFinalized}
                value={faData.grantAmount || 0}
                onChange={(e) => setFaData((prev) => ({ ...prev, grantAmount: Number(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Counterpart Co-Funding ({faData.currency || 'USD'}):
              </label>
              <input
                type="number"
                disabled={!isContractingOfficer || isFinalized}
                value={faData.counterpartFunding || 0}
                onChange={(e) => setFaData((prev) => ({ ...prev, counterpartFunding: Number(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Procurement Standard:
              </label>
              <select
                disabled={!isContractingOfficer || isFinalized}
                value={faData.procurementStandard || 'Joint Harmonized Standards'}
                onChange={(e) => setFaData((prev) => ({ ...prev, procurementStandard: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              >
                <option value="AU Procurement Rule">AU Procurement Rule</option>
                <option value="Partner Procurement Rule">Partner Procurement Rule</option>
                <option value="Joint Harmonized Standards">Joint Harmonized Standards</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Audit Cadence:
              </label>
              <select
                disabled={!isContractingOfficer || isFinalized}
                value={faData.auditCadence || 'Annually'}
                onChange={(e) => setFaData((prev) => ({ ...prev, auditCadence: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              >
                <option value="Quarterly">Quarterly</option>
                <option value="Biannually">Biannually</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Reporting Cadence:
              </label>
              <select
                disabled={!isContractingOfficer || isFinalized}
                value={faData.reportingCadence || 'Quarterly'}
                onChange={(e) => setFaData((prev) => ({ ...prev, reportingCadence: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              >
                <option value="Quarterly">Quarterly</option>
                <option value="Biannually">Biannually</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                AUDA Focal Contracting Officer:
              </label>
              <input
                type="text"
                disabled={!isContractingOfficer || isFinalized}
                value={faData.focalPerson || currentUser.name}
                onChange={(e) => setFaData((prev) => ({ ...prev, focalPerson: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Agreement Execution Date:
              </label>
              <input
                type="date"
                disabled={!isContractingOfficer || isFinalized}
                value={faData.agreementDate || ''}
                onChange={(e) => setFaData((prev) => ({ ...prev, agreementDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Implementation Start Date:
              </label>
              <input
                type="date"
                disabled={!isContractingOfficer || isFinalized}
                value={faData.startDate || ''}
                onChange={(e) => setFaData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Implementation End Date:
              </label>
              <input
                type="date"
                disabled={!isContractingOfficer || isFinalized}
                value={faData.endDate || ''}
                onChange={(e) => setFaData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Covenants & Special Conditions */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Special Fiduciary & Legal Covenants:
            </label>
            <textarea
              rows={3}
              disabled={!isContractingOfficer || isFinalized}
              value={faData.conditions || ''}
              onChange={(e) => setFaData((prev) => ({ ...prev, conditions: e.target.value }))}
              placeholder="e.g. Establishment of multi-state steering committee, submission of initial procurement plan..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-100"
            />
          </div>

          {/* Action Bar */}
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              <span>Agreement Status: </span>
              <strong className="text-slate-800">
                {isFinalized ? 'Ratified & Active' : 'Draft / Under Negotiation'}
              </strong>
            </div>

            <div className="flex items-center gap-2.5">
              {isContractingOfficer && !isFinalized && (
                <>
                  <button
                    onClick={handleSaveAgreement}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors border border-slate-300"
                  >
                    <Check className="w-4 h-4 text-slate-600" />
                    <span>Save Agreement Parameters</span>
                  </button>

                  <button
                    onClick={() => setShowFinalizeModal(true)}
                    className="px-5 py-2 bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-800 hover:to-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Finalize Financing & Seal Execution</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Bilateral Negotiation Logs */}
      {activeTab === 'negotiations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Strategic Partner Bilateral Negotiation Register
              </h3>
              <p className="text-xs text-slate-500">
                Log dialogue sessions, issues raised, joint decisions, and legal action items.
              </p>
            </div>

            {isContractingOfficer && (
              <button
                onClick={() => setShowAddNegModal(true)}
                className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Negotiation</span>
              </button>
            )}
          </div>

          {(!activeInitiative.negotiations || activeInitiative.negotiations.length === 0) ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
              No bilateral partner negotiations recorded yet. Click "Log Negotiation" to register a consultative session.
            </div>
          ) : (
            <div className="space-y-3">
              {activeInitiative.negotiations.map((neg) => (
                <div
                  key={neg.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Handshake className="w-4 h-4 text-cyan-700" />
                      <span className="font-extrabold text-slate-900 text-sm">{neg.topic}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-cyan-800">{neg.partner}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">{neg.date}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          neg.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : neg.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {neg.status}
                      </span>
                      {isContractingOfficer && neg.status !== 'Resolved' && (
                        <button
                          onClick={() => updateNegotiationStatus(activeInitiative.id, neg.id, 'Resolved')}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-medium">{neg.summary}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-500 block uppercase text-[10px]">
                        Issues Raised
                      </span>
                      <p className="text-slate-800 mt-0.5">{neg.issuesRaised || 'None'}</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-500 block uppercase text-[10px]">
                        Decisions Made
                      </span>
                      <p className="text-slate-800 mt-0.5">{neg.decisionsMade || 'None'}</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-500 block uppercase text-[10px]">
                        Required Actions
                      </span>
                      <p className="text-slate-800 mt-0.5">
                        {neg.actionsRequired} (Due: {neg.dueDate})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MoU & Bilateral Agreements */}
      {activeTab === 'mous' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Memoranda of Understanding (MoU) Vault
              </h3>
              <p className="text-xs text-slate-500">
                Track formal bilateral declarations, inter-governmental protocols, and multilateral accords.
              </p>
            </div>

            {isContractingOfficer && (
              <button
                onClick={() => setShowAddMouModal(true)}
                className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register MoU</span>
              </button>
            )}
          </div>

          {(!activeInitiative.mous || activeInitiative.mous.length === 0) ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
              No Memoranda of Understanding catalogued for this initiative. Click "Register MoU" to record an agreement.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {activeInitiative.mous.map((mou) => (
                <div
                  key={mou.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {mou.referenceNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{mou.title}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Partner: <strong>{mou.partner}</strong> ({mou.partnerCountry})
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                        mou.status === 'Signed' || mou.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {mou.status}
                    </span>
                  </div>

                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    <strong>Scope:</strong> {mou.scope}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <div>
                      <span>Signed: </span>
                      <strong className="text-slate-700">{mou.signingDate}</strong>
                    </div>
                    <div>
                      <span>Expiry: </span>
                      <strong className="text-slate-700">{mou.expiryDate}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Add Negotiation Session Modal */}
      {showAddNegModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Handshake className="w-4 h-4 text-cyan-700" />
                <span>Log Bilateral Partner Negotiation</span>
              </h3>
              <button
                onClick={() => setShowAddNegModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Partner Institution:
                  </label>
                  <input
                    type="text"
                    value={negPartner}
                    onChange={(e) => setNegPartner(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date of Session:
                  </label>
                  <input
                    type="date"
                    value={negDate}
                    onChange={(e) => setNegDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Negotiation Topic / Objective:
                </label>
                <input
                  type="text"
                  value={negTopic}
                  onChange={(e) => setNegTopic(e.target.value)}
                  placeholder="e.g. Financing Instrument and Counterpart Co-Financing"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Discussion Summary:
                </label>
                <textarea
                  rows={2}
                  value={negSummary}
                  onChange={(e) => setNegSummary(e.target.value)}
                  placeholder="Summary of mutual positions, terms explored..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Issues Raised:
                  </label>
                  <textarea
                    rows={2}
                    value={negIssues}
                    onChange={(e) => setNegIssues(e.target.value)}
                    placeholder="Contingencies, tax exemptions..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Decisions Reached:
                  </label>
                  <textarea
                    rows={2}
                    value={negDecisions}
                    onChange={(e) => setNegDecisions(e.target.value)}
                    placeholder="Agreed clauses, financing shares..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddNegModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNegotiation}
                className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold transition-colors"
              >
                Record Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add MoU Modal */}
      {showAddMouModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-700" />
                <span>Register Memorandum of Understanding (MoU)</span>
              </h3>
              <button
                onClick={() => setShowAddMouModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  MoU Reference Number:
                </label>
                <input
                  type="text"
                  value={mouRef}
                  onChange={(e) => setMouRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  MoU Title:
                </label>
                <input
                  type="text"
                  value={mouTitle}
                  onChange={(e) => setMouTitle(e.target.value)}
                  placeholder="e.g. Bilateral Accord on Energy Terminal Logistics"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Partner Institution:
                  </label>
                  <input
                    type="text"
                    value={mouPartner}
                    onChange={(e) => setMouPartner(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Partner Country:
                  </label>
                  <input
                    type="text"
                    value={mouCountry}
                    onChange={(e) => setMouCountry(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Scope of Cooperation:
                </label>
                <textarea
                  rows={2}
                  value={mouScope}
                  onChange={(e) => setMouScope(e.target.value)}
                  placeholder="Technical coordination, land titling, joint procurement..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddMouModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMoU}
                className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold transition-colors"
              >
                Register MoU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Finalize Financing Confirmation Modal */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Finalize Financing & Authorize Active Implementation</span>
              </h3>
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1.5">
              <span className="font-bold block">Statutory Clearance Notice:</span>
              <p>
                Finalizing financing certifies that all legal instruments, master agreements, and bilateral
                MoUs have been ratified by legal counsel. This marks <strong>{activeInitiative.title}</strong> as{' '}
                <strong>Financing Finalized</strong> and authorizes active project rollout.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Final Legal Ratification Remarks:
              </label>
              <textarea
                rows={3}
                value={finalizeNotes}
                onChange={(e) => setFinalizeNotes(e.target.value)}
                placeholder="All bilateral donor signatures validated; counterpart co-financing escrow verified..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFinalize}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-sm"
              >
                Confirm & Seal Financing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Official Contracting Certificate / Print View */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-8 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-cyan-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-800 text-white flex items-center justify-center font-extrabold text-sm">
                  AUDA
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                    African Union Development Agency (AUDA-NEPAD)
                  </h2>
                  <p className="text-xs text-cyan-800 font-bold uppercase tracking-wider">
                    Office of Contracting & Legal Affairs • Master Financing Instrument
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-cyan-50/50 p-4 border-b border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Financing Reference
                  </span>
                  <span className="font-mono font-extrabold text-cyan-900 text-sm">
                    {faData.reference}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Financing Instrument
                  </span>
                  <span className="font-bold text-slate-800">{faData.instrument}</span>
                </div>
              </div>

              <div className="p-4 border-b border-slate-200 space-y-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Programmatic Initiative
                </span>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {activeInitiative.title} ({activeInitiative.code})
                </h4>
                <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                  <span>
                    Grant Envelope:{' '}
                    <strong className="text-slate-900">
                      {formatCurrency(faData.grantAmount || 0, activeInitiative.currency)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Counterpart Co-Funding:{' '}
                    <strong className="text-slate-900">
                      {formatCurrency(faData.counterpartFunding || 0, activeInitiative.currency)}
                    </strong>
                  </span>
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
                onClick={() => window.print()}
                className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Contracting Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
