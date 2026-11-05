import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Initiative, InitiativeStatus } from '../../types';
import { ConceptForm } from './ConceptForm';
import { StatusBadge } from '../common/StatusBadge';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Plus,
  Search,
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Lock,
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react';

export const ConceptManagementView: React.FC = () => {
  const {
    initiatives,
    currentUser,
    setSelectedInitiativeId,
    duplicateConcept,
    deleteConcept
  } = useApp();

  const [activeConceptToEdit, setActiveConceptToEdit] = useState<Initiative | null | 'NEW'>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [directorateFilter, setDirectorateFilter] = useState('');

  // If in form mode
  if (activeConceptToEdit === 'NEW') {
    return (
      <ConceptForm
        concept={null}
        onBackToList={() => setActiveConceptToEdit(null)}
      />
    );
  }

  if (activeConceptToEdit) {
    return (
      <ConceptForm
        concept={activeConceptToEdit}
        onBackToList={() => setActiveConceptToEdit(null)}
      />
    );
  }

  // Filter concepts (stageCode 0 & 1)
  const concepts = initiatives.filter((i) => {
    // Stage 0 and 1 are concepts
    if (i.stageCode > 1) return false;

    if (searchTerm) {
      const match =
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.problemStatement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }

    if (statusFilter && i.status !== statusFilter) return false;
    if (directorateFilter && i.directorate !== directorateFilter) return false;

    return true;
  });

  const canCreate =
    currentUser.role === 'Concept Owner / Project Manager' ||
    currentUser.role === 'Directorate Director' ||
    currentUser.role === 'System Administrator';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Stage 0: Concept Registration & Pipeline Ingestion
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                {concepts.length} Concept Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Originate continental ideas, run duplicate detection, attach evidence, and submit to the Programme Board.
            </p>
          </div>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setActiveConceptToEdit('NEW')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 text-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Concept</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search concepts by title, code, owner, problem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted to Board">Submitted to Board</option>
            <option value="Returned for Clarification">Returned for Clarification</option>
            <option value="On Hold">On Hold</option>
            <option value="Rejected">Rejected</option>
          </select>

          {(searchTerm || statusFilter || directorateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDirectorateFilter('');
              }}
              className="text-emerald-700 font-semibold text-xs hover:underline px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Concept Cards Grid */}
      <div className="space-y-4">
        {concepts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs text-slate-400">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No Concepts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No concept records match your filters. Register a new concept or clear your search term.
            </p>
          </div>
        ) : (
          concepts.map((item) => {
            const isOwner = item.ownerId === currentUser.id;
            const canEdit =
              (isOwner || currentUser.role === 'System Administrator') &&
              (item.status === 'Draft' || item.status === 'Returned for Clarification');

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {item.code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-medium">
                      {item.classification}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                    <LifecycleAgeBadge initiative={item} compact />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Updated: {formatDate(item.lastUpdated)}
                    </span>
                  </div>
                </div>

                {/* Title & Problem Preview */}
                <div>
                  <h3
                    onClick={() => setSelectedInitiativeId(item.id)}
                    className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer tracking-tight"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {item.problemStatement}
                  </p>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Directorate
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {item.directorate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Owner
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.ownerName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Indicative Budget
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(item.estimatedCost, item.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Geography
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {item.isContinental ? 'Continental' : item.countries.slice(0, 3).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs">
                    {item.duplicateStatus && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Similarity Check:{' '}
                        <strong className="text-slate-800">{item.duplicateStatus}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInitiativeId(item.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Dossier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicateConcept(item.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1"
                      title="Duplicate as new draft"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>

                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => setActiveConceptToEdit(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Concept</span>
                      </button>
                    ) : item.status === 'Submitted to Board' ? (
                      <button
                        type="button"
                        onClick={() => setActiveConceptToEdit(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Locked Concept</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
