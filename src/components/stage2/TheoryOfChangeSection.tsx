import React, { useState } from 'react';
import { TheoryOfChangeEntry } from '../../types';
import {
  GitMerge,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown,
  BookOpen,
  Eye,
  LayoutGrid,
  List,
  CheckCircle2
} from 'lucide-react';

interface TheoryOfChangeSectionProps {
  entries: TheoryOfChangeEntry[];
  onChangeEntries: (entries: TheoryOfChangeEntry[]) => void;
  isLocked?: boolean;
}

const TOC_TYPES: {
  type: TheoryOfChangeEntry['type'];
  label: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  description: string;
  icon: string;
}[] = [
  {
    type: 'root_cause',
    label: 'Root Cause / Structural Need',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    borderClass: 'border-rose-400',
    bgClass: 'bg-rose-50/60',
    description: 'Underlying structural, regulatory, market, or systemic drivers.',
    icon: '🌱'
  },
  {
    type: 'core_problem',
    label: 'Core Problem Statement',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    borderClass: 'border-amber-400',
    bgClass: 'bg-amber-50/60',
    description: 'The primary bottleneck or developmental failure hindering progress.',
    icon: '⚠️'
  },
  {
    type: 'intervention',
    label: 'Key Strategic Intervention',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderClass: 'border-emerald-400',
    bgClass: 'bg-emerald-50/60',
    description: 'Direct institutional, technical, or financial activities deployed.',
    icon: '⚡'
  },
  {
    type: 'assumption',
    label: 'Critical Assumption / Enabler',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    borderClass: 'border-indigo-400',
    bgClass: 'bg-indigo-50/60',
    description: 'External conditions, political will, or policies required for success.',
    icon: '🔮'
  },
  {
    type: 'consequence',
    label: 'Expected Long-Term Impact',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    borderClass: 'border-sky-400',
    bgClass: 'bg-sky-50/60',
    description: 'Transformative continental outcome for citizens and Member States.',
    icon: '🎯'
  }
];

export const TheoryOfChangeSection: React.FC<TheoryOfChangeSectionProps> = ({
  entries = [],
  onChangeEntries,
  isLocked = false
}) => {
  const [viewMode, setViewMode] = useState<'diagram' | 'list'>('diagram');
  const [editingEntry, setEditingEntry] = useState<TheoryOfChangeEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New entry form state
  const [newType, setNewType] = useState<TheoryOfChangeEntry['type']>('root_cause');
  const [newDescription, setNewDescription] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  // Edit entry form state
  const [editType, setEditType] = useState<TheoryOfChangeEntry['type']>('root_cause');
  const [editDescription, setEditDescription] = useState('');
  const [editEvidence, setEditEvidence] = useState('');
  const [editOrder, setEditOrder] = useState<number>(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStartEdit = (entry: TheoryOfChangeEntry) => {
    if (isLocked) return;
    setEditingEntry(entry);
    setEditType(entry.type);
    setEditDescription(entry.description);
    setEditEvidence(entry.evidenceReference || '');
    setEditOrder(entry.order || entries.findIndex((e) => e.id === entry.id) + 1);
    setConfirmDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingEntry) return;
    if (!editDescription.trim()) return;

    let updated = entries.map((item) => {
      if (item.id === editingEntry.id) {
        return {
          ...item,
          type: editType,
          description: editDescription.trim(),
          evidenceReference: editEvidence.trim(),
          order: editOrder
        };
      }
      return item;
    });

    // Re-sort based on updated order if changed
    updated = [...updated].sort((a, b) => (a.order || 0) - (b.order || 0));
    // Normalize order index
    const normalized = updated.map((item, idx) => ({ ...item, order: idx + 1 }));

    onChangeEntries(normalized);
    setEditingEntry(null);
    showToast('Theory of Change node updated successfully.');
  };

  const handleDelete = (id: string) => {
    if (isLocked) return;
    const remaining = entries.filter((e) => e.id !== id);
    const normalized = remaining.map((item, idx) => ({ ...item, order: idx + 1 }));
    onChangeEntries(normalized);
    if (editingEntry?.id === id) {
      setEditingEntry(null);
    }
    setConfirmDeleteId(null);
    showToast('Causal node removed from framework.');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (isLocked) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) return;

    const reordered = [...entries];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // update order field
    const normalized = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    onChangeEntries(normalized);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    const newEntry: TheoryOfChangeEntry = {
      id: `toc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: newType,
      description: newDescription.trim(),
      evidenceReference: newEvidence.trim(),
      order: entries.length + 1
    };

    onChangeEntries([...entries, newEntry]);
    setNewDescription('');
    setNewEvidence('');
    setShowAddForm(false);
    showToast('New causal node added to framework.');
  };

  const handleApplyTemplate = () => {
    if (isLocked) return;
    const template: TheoryOfChangeEntry[] = [
      {
        id: `toc-tpl-1`,
        type: 'root_cause',
        description: 'Fragmented national regulatory standards and insufficient domestic manufacturing infrastructure across Member States.',
        evidenceReference: 'AU Continental Industrialization Assessment (2024)',
        order: 1
      },
      {
        id: `toc-tpl-2`,
        type: 'core_problem',
        description: 'Vulnerability to international supply chain shocks, prolonged procurement lead times, and prohibitive costs.',
        evidenceReference: 'AfCFTA Trade & Logistics Monitoring Report',
        order: 2
      },
      {
        id: `toc-tpl-3`,
        type: 'intervention',
        description: 'Harmonize regional regulatory frameworks, provide technical assistance, and establish pooled regional procurement facilities.',
        evidenceReference: 'AUDA-NEPAD Strategic Delivery Plan',
        order: 3
      },
      {
        id: `toc-tpl-4`,
        type: 'assumption',
        description: 'Regional Economic Communities ratify mutual recognition protocols and maintain co-funding commitments.',
        evidenceReference: 'REC Ministerial Declarations',
        order: 4
      },
      {
        id: `toc-tpl-5`,
        type: 'consequence',
        description: 'Self-reliant continental capacity achieved, fostering regional value chains, job creation, and socio-economic resilience.',
        evidenceReference: 'Agenda 2063 Aspiration 1 Target Metrics',
        order: 5
      }
    ];
    onChangeEntries(template);
    showToast('Standard AUDA-NEPAD TOC baseline loaded.');
  };

  // Group entries by type for diagram
  const getEntriesByType = (type: TheoryOfChangeEntry['type']) =>
    entries.filter((e) => e.type === type);

  return (
    <div className="space-y-6 text-xs animate-in fade-in relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs flex-shrink-0">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-indigo-950 text-sm">
                2.2 Theory of Change (TOC) Causal Framework
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-200/70 text-indigo-800">
                {entries.length} Nodes Configured
              </span>
            </div>
            <p className="text-indigo-800/90 text-xs mt-0.5 leading-relaxed">
              Model the logical causal pathway: map Root Causes and Core Problems to Strategic Interventions, critical Assumptions, and transformative Impacts.
              {!isLocked && ' Click any node to edit its narrative, classification, evidence, or sequence.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* View mode toggle */}
          <div className="bg-white/80 p-0.5 rounded-xl border border-indigo-200 flex items-center shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'diagram'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Causal Diagram</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Structured List</span>
            </button>
          </div>

          {!isLocked && entries.length === 0 && (
            <button
              type="button"
              onClick={handleApplyTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold text-xs shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Best-Practice Starter</span>
            </button>
          )}

          {!isLocked && (
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Causal Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Entry Form Drawer */}
      {showAddForm && !isLocked && (
        <form
          onSubmit={handleAddEntry}
          className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-md space-y-4 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Add Theory of Change Causal Node</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Node Classification *
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as TheoryOfChangeEntry['type'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {TOC_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Evidence Reference / Research Source
              </label>
              <input
                type="text"
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                placeholder="e.g. WHO Report 2024 / African Union Commission Baseline Study / REC Masterplan"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Causal Proposition & Narrative Description *
            </label>
            <textarea
              rows={3}
              required
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="State with clarity the causal mechanism, condition, or transformation..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 leading-relaxed"
            />
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
              <span>Insert Node into Framework</span>
            </button>
          </div>
        </form>
      )}

      {/* DIAGRAM VIEW */}
      {viewMode === 'diagram' && (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
                <GitMerge className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Theory of Change Defined Yet</h4>
              <p className="text-slate-500 max-w-md mx-auto text-xs">
                Map the foundational logic connecting underlying needs and challenges with AUDA-NEPAD interventions and expected continental outcomes.
              </p>
              {!isLocked && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleApplyTemplate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Load Best-Practice Starter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Entry</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-6 overflow-x-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Causal Sequence Architecture
                  </span>
                  <span className="text-[11px] text-slate-400">• Left to right logical progression</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Interactive: click any node card to edit</span>
                </div>
              </div>

              {/* Responsive Flow Pathway */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
                {TOC_TYPES.map((tocType) => {
                  const itemsInCol = getEntriesByType(tocType.type);
                  return (
                    <div
                      key={tocType.type}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${tocType.bgClass} ${tocType.borderClass}`}
                    >
                      {/* Column Header */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base">{tocType.icon}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 border border-slate-200 text-slate-700 shadow-2xs">
                            {itemsInCol.length}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs leading-snug">
                          {tocType.label}
                        </h5>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {tocType.description}
                        </p>
                      </div>

                      {/* Column Items */}
                      <div className="space-y-2 flex-1">
                        {itemsInCol.length === 0 ? (
                          <div className="p-3 bg-white/60 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-[11px]">
                            None defined
                          </div>
                        ) : (
                          itemsInCol.map((item) => {
                            const isBeingEdited = editingEntry?.id === item.id;
                            const itemOrder = item.order || entries.findIndex((e) => e.id === item.id) + 1;

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  if (!isLocked) handleStartEdit(item);
                                }}
                                className={`p-2.5 bg-white border rounded-xl shadow-2xs transition-all space-y-1.5 group relative ${
                                  isBeingEdited
                                    ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/20'
                                    : 'border-slate-200 hover:border-indigo-400 hover:shadow-xs'
                                } ${!isLocked ? 'cursor-pointer' : ''}`}
                                title={!isLocked ? 'Click to edit this node' : undefined}
                              >
                                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400">
                                  <span className="font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    Node #{itemOrder}
                                  </span>
                                  {!isLocked && (
                                    <span className="text-[10px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                      <Edit2 className="w-2.5 h-2.5" />
                                      <span>Edit</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-slate-800 text-[11px] font-medium leading-relaxed">
                                  {item.description}
                                </p>

                                {item.evidenceReference && (
                                  <div className="flex items-center gap-1 text-[10px] text-indigo-700 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                    <BookOpen className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate">{item.evidenceReference}</span>
                                  </div>
                                )}

                                {!isLocked && (
                                  <div className="flex items-center justify-end gap-1 pt-1 opacity-60 group-hover:opacity-100 transition-opacity border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEdit(item);
                                      }}
                                      className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                      title="Edit node"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id);
                                      }}
                                      className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                      title="Delete node"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add button inside column */}
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewType(tocType.type);
                            setShowAddForm(true);
                          }}
                          className="w-full py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white rounded-lg border border-slate-200/80 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add to Column</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STRUCTURED LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Ordered Theory of Change Statements
            </h4>
            <span className="text-[11px] text-slate-500">
              Arrange by priority or causal sequence
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No Theory of Change entries available.
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => {
                const typeConfig =
                  TOC_TYPES.find((t) => t.type === entry.type) || TOC_TYPES[0];
                const isSelectedForEdit = editingEntry?.id === entry.id;

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      if (!isLocked) handleStartEdit(entry);
                    }}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 group ${
                      isSelectedForEdit
                        ? 'border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-200'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                    } ${!isLocked ? 'cursor-pointer' : ''}`}
                  >
                    <div
                      className="flex flex-col items-center gap-0.5 pt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isLocked && (
                        <>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMove(index, 'up')}
                            className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                            title="Move Up"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === entries.length - 1}
                            onClick={() => handleMove(index, 'down')}
                            className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                            title="Move Down"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeConfig.badgeClass}`}
                        >
                          {typeConfig.icon} {typeConfig.label}
                        </span>
                        {entry.evidenceReference && (
                          <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                            Ref: {entry.evidenceReference}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 ml-auto font-mono">
                          Node #{entry.order || index + 1}
                        </span>
                      </div>
                      <p className="text-slate-900 text-xs leading-relaxed font-medium">
                        {entry.description}
                      </p>
                    </div>

                    {!isLocked && (
                      <div
                        className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleStartEdit(entry)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EDIT NODE MODAL DIALOG */}
      {editingEntry && !isLocked && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Edit Theory of Change Causal Node
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update causal proposition, evidence references, classification, and sequence.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Node Classification */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Causal Classification *
                  </label>
                  <select
                    value={editType}
                    onChange={(e) =>
                      setEditType(e.target.value as TheoryOfChangeEntry['type'])
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    {TOC_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {TOC_TYPES.find((t) => t.type === editType)?.description}
                  </p>
                </div>

                {/* Sequence Order */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Sequence Order #
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={entries.length}
                    value={editOrder}
                    onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 font-mono text-center font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block text-center">
                    of {entries.length} nodes
                  </span>
                </div>
              </div>

              {/* Narrative Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Causal Proposition & Narrative Description *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {editDescription.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="State with clarity the causal mechanism, condition, or transformation..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 leading-relaxed font-medium"
                />
              </div>

              {/* Evidence Reference */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Evidence Reference / Research Source
                </label>
                <input
                  type="text"
                  value={editEvidence}
                  onChange={(e) => setEditEvidence(e.target.value)}
                  placeholder="e.g. WHO Report 2024 / African Union Commission Baseline Study / REC Masterplan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Statutory studies, continental strategy declarations, or sector assessments supporting this link.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div>
                  {confirmDeleteId === editingEntry.id ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in">
                      <span className="text-[11px] text-rose-600 font-bold">
                        Confirm remove node?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(editingEntry.id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(editingEntry.id)}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Node</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Node Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
