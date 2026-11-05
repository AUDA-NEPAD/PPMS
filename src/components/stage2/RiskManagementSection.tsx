import React, { useState, useMemo } from 'react';
import { RiskItem } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Layers,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

interface RiskManagementSectionProps {
  risks: RiskItem[];
  onChangeRisks: (risks: RiskItem[]) => void;
  currentUser: { name: string };
  isLocked?: boolean;
}

const RISK_CATEGORIES: RiskItem['category'][] = [
  'Institutional',
  'Operational',
  'Financial',
  'Environmental & Social',
  'Political & Governance'
];

const LIKELIHOOD_LEVELS: RiskItem['likelihood'][] = ['High', 'Medium', 'Low'];
const IMPACT_LEVELS: RiskItem['impact'][] = ['High', 'Medium', 'Low'];

/**
 * Calculates risk rating & color based on Likelihood x Impact matrix
 */
export const calculateRiskSeverity = (
  likelihood: RiskItem['likelihood'],
  impact: RiskItem['impact']
): { severity: RiskItem['severity']; badgeClass: string; score: number } => {
  if (likelihood === 'High' && impact === 'High') {
    return { severity: 'High', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', score: 9 };
  }
  if ((likelihood === 'High' && impact === 'Medium') || (likelihood === 'Medium' && impact === 'High')) {
    return { severity: 'High', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 font-bold', score: 6 };
  }
  if ((likelihood === 'Medium' && impact === 'Medium') || (likelihood === 'High' && impact === 'Low') || (likelihood === 'Low' && impact === 'High')) {
    return { severity: 'Medium', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-medium', score: 4 };
  }
  return { severity: 'Low', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-normal', score: 2 };
};

export const RiskManagementSection: React.FC<RiskManagementSectionProps> = ({
  risks = [],
  onChangeRisks,
  currentUser,
  isLocked = false
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Risk Form State
  const [newRiskId, setNewRiskId] = useState(`RSK-${String(risks.length + 1).padStart(2, '0')}`);
  const [newCategory, setNewCategory] = useState<RiskItem['category']>('Operational');
  const [newDescription, setNewDescription] = useState('');
  const [newLikelihood, setNewLikelihood] = useState<RiskItem['likelihood']>('Medium');
  const [newImpact, setNewImpact] = useState<RiskItem['impact']>('High');
  const [newMitigation, setNewMitigation] = useState('');
  const [newOwner, setNewOwner] = useState(currentUser.name);
  const [newTargetDate, setNewTargetDate] = useState('2027-06-30');

  // Edit Risk Form State
  const [editRisk, setEditRisk] = useState<RiskItem | null>(null);

  // Filtered risks
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterStatus !== 'all' && r.currentStatus !== filterStatus) return false;
      return true;
    });
  }, [risks, filterCategory, filterStatus]);

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || !newMitigation.trim()) return;

    const { severity } = calculateRiskSeverity(newLikelihood, newImpact);

    const newItem: RiskItem = {
      id: `rsk-${Date.now()}`,
      riskId: newRiskId || `RSK-${String(risks.length + 1).padStart(2, '0')}`,
      description: newDescription.trim(),
      category: newCategory,
      severity,
      likelihood: newLikelihood,
      impact: newImpact,
      mitigationMeasures: newMitigation.trim(),
      riskOwner: newOwner.trim() || currentUser.name,
      targetDate: newTargetDate,
      currentStatus: 'Active'
    };

    onChangeRisks([...risks, newItem]);
    setNewDescription('');
    setNewMitigation('');
    setNewRiskId(`RSK-${String(risks.length + 2).padStart(2, '0')}`);
    setShowAddForm(false);
  };

  const handleStartEdit = (risk: RiskItem) => {
    setEditingId(risk.id);
    setEditRisk({ ...risk });
  };

  const handleSaveEdit = () => {
    if (!editRisk || !editRisk.description.trim()) return;
    const { severity } = calculateRiskSeverity(editRisk.likelihood, editRisk.impact);
    const updated = risks.map((r) =>
      r.id === editRisk.id ? { ...editRisk, severity } : r
    );
    onChangeRisks(updated);
    setEditingId(null);
    setEditRisk(null);
  };

  const handleDeleteRisk = (id: string) => {
    if (isLocked) return;
    onChangeRisks(risks.filter((r) => r.id !== id));
  };

  const handleStatusChange = (id: string, status: RiskItem['currentStatus']) => {
    if (isLocked) return;
    onChangeRisks(
      risks.map((r) => (r.id === id ? { ...r, currentStatus: status } : r))
    );
  };

  // Severity count badges
  const highRiskCount = risks.filter((r) => r.severity === 'High').length;
  const medRiskCount = risks.filter((r) => r.severity === 'Medium').length;
  const lowRiskCount = risks.filter((r) => r.severity === 'Low').length;

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      {/* Overview Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-amber-950 text-sm">
                2.3 Risk Management Matrix
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900">
                {risks.length} Documented Risks
              </span>
            </div>
            <p className="text-amber-800/90 text-xs mt-0.5 leading-relaxed">
              Identify and score institutional, operational, financial, and governance threats. Formulate actionable mitigation protocols with assigned risk owners.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Quick Metrics */}
          <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-xl border border-amber-200 shadow-2xs text-[11px]">
            <span className="flex items-center gap-1 text-rose-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {highRiskCount} High
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-amber-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {medRiskCount} Med
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              {lowRiskCount} Low
            </span>
          </div>

          {!isLocked && (
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Risk</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Risk Form */}
      {showAddForm && !isLocked && (
        <form
          onSubmit={handleAddRisk}
          className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-md space-y-4 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Record New Risk Event</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Risk Identifier *
              </label>
              <input
                type="text"
                required
                value={newRiskId}
                onChange={(e) => setNewRiskId(e.target.value)}
                placeholder="e.g. RSK-01"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Risk Category *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RiskItem['category'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
              >
                {RISK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Likelihood *
              </label>
              <select
                value={newLikelihood}
                onChange={(e) => setNewLikelihood(e.target.value as RiskItem['likelihood'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold"
              >
                {LIKELIHOOD_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Impact *
              </label>
              <select
                value={newImpact}
                onChange={(e) => setNewImpact(e.target.value as RiskItem['impact'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold"
              >
                {IMPACT_LEVELS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Risk Description & Root Scenario *
            </label>
            <textarea
              rows={2}
              required
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Articulate the uncertain event, trigger condition, and potential disruption..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Mitigation Protocol & Preventative Safeguards *
            </label>
            <textarea
              rows={2}
              required
              value={newMitigation}
              onChange={(e) => setNewMitigation(e.target.value)}
              placeholder="Concrete contractual, technical, or governance safeguards deployed..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Risk Owner (Responsible Person) *
              </label>
              <input
                type="text"
                required
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Designated focal person"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Target Resolution / Mitigation Date *
              </label>
              <input
                type="date"
                required
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Risk into Register</span>
            </button>
          </div>
        </form>
      )}

      {/* Risk Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Project Risk Register
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
              Showing {filteredRisks.length} of {risks.length}
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs bg-transparent border-none text-slate-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {RISK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-transparent border-none text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table content */}
        {filteredRisks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No risk records match the active criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4">Risk ID & Category</th>
                  <th className="py-2.5 px-4 min-w-[220px]">Scenario & Disruption</th>
                  <th className="py-2.5 px-3 text-center">Likelihood</th>
                  <th className="py-2.5 px-3 text-center">Impact</th>
                  <th className="py-2.5 px-3 text-center">Severity</th>
                  <th className="py-2.5 px-4 min-w-[240px]">Mitigation Protocol</th>
                  <th className="py-2.5 px-3">Owner & Target</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  {!isLocked && <th className="py-2.5 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRisks.map((risk) => {
                  const isEditing = editingId === risk.id;
                  const severityConfig = calculateRiskSeverity(risk.likelihood, risk.impact);

                  if (isEditing && editRisk) {
                    return (
                      <tr key={risk.id} className="bg-amber-50/40">
                        <td colSpan={9} className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Category
                              </label>
                              <select
                                value={editRisk.category}
                                onChange={(e) =>
                                  setEditRisk({
                                    ...editRisk,
                                    category: e.target.value as RiskItem['category']
                                  })
                                }
                                className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              >
                                {RISK_CATEGORIES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Likelihood
                              </label>
                              <select
                                value={editRisk.likelihood}
                                onChange={(e) =>
                                  setEditRisk({
                                    ...editRisk,
                                    likelihood: e.target.value as RiskItem['likelihood']
                                  })
                                }
                                className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              >
                                {LIKELIHOOD_LEVELS.map((l) => (
                                  <option key={l} value={l}>
                                    {l}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Impact
                              </label>
                              <select
                                value={editRisk.impact}
                                onChange={(e) =>
                                  setEditRisk({
                                    ...editRisk,
                                    impact: e.target.value as RiskItem['impact']
                                  })
                                }
                                className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              >
                                {IMPACT_LEVELS.map((i) => (
                                  <option key={i} value={i}>
                                    {i}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Status
                              </label>
                              <select
                                value={editRisk.currentStatus}
                                onChange={(e) =>
                                  setEditRisk({
                                    ...editRisk,
                                    currentStatus: e.target.value as RiskItem['currentStatus']
                                  })
                                }
                                className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              >
                                <option value="Active">Active</option>
                                <option value="Mitigated">Mitigated</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Description
                              </label>
                              <textarea
                                rows={2}
                                value={editRisk.description}
                                onChange={(e) =>
                                  setEditRisk({ ...editRisk, description: e.target.value })
                                }
                                className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Mitigation
                              </label>
                              <textarea
                                rows={2}
                                value={editRisk.mitigationMeasures}
                                onChange={(e) =>
                                  setEditRisk({
                                    ...editRisk,
                                    mitigationMeasures: e.target.value
                                  })
                                }
                                className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditRisk(null);
                              }}
                              className="px-3 py-1 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Update Risk Entry</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={risk.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* ID & Category */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {risk.riskId}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {risk.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 align-top">
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {risk.description}
                        </p>
                      </td>

                      {/* Likelihood */}
                      <td className="py-3 px-3 align-top text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            risk.likelihood === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : risk.likelihood === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {risk.likelihood}
                        </span>
                      </td>

                      {/* Impact */}
                      <td className="py-3 px-3 align-top text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            risk.impact === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : risk.impact === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {risk.impact}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 align-top text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] border ${severityConfig.badgeClass}`}
                        >
                          {risk.severity}
                        </span>
                      </td>

                      {/* Mitigation */}
                      <td className="py-3 px-4 align-top">
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          {risk.mitigationMeasures}
                        </p>
                      </td>

                      {/* Owner & Target */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-slate-800 font-semibold">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{risk.riskOwner}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(risk.targetDate)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 align-top text-center">
                        <select
                          disabled={isLocked}
                          value={risk.currentStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              risk.id,
                              e.target.value as RiskItem['currentStatus']
                            )
                          }
                          className={`text-[10px] font-bold rounded-lg px-2 py-1 border transition-colors ${
                            risk.currentStatus === 'Active'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : risk.currentStatus === 'Mitigated'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Mitigated">Mitigated</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      {!isLocked && (
                        <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(risk)}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-100"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRisk(risk.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
