import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DevelopmentPartner } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Handshake,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Globe,
  Building,
  User,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  DollarSign,
  FileText,
  X,
  Check,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Info
} from 'lucide-react';

const PARTNER_TYPES: DevelopmentPartner['type'][] = [
  'Multilateral Financial Institution',
  'Bilateral Agency',
  'UN Agency',
  'Regional Financial Institution',
  'Pan-African Multilateral Bank',
  'Bilateral & Regional Development Partner',
  'Philanthropic Foundation',
  'Private Sector / DFI',
  'Other'
];

export const PartnersDatabaseWorkspace: React.FC = () => {
  const {
    partners,
    addPartner,
    updatePartner,
    deletePartner,
    initiatives,
    setSelectedInitiativeId,
    currentUser
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<DevelopmentPartner | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<DevelopmentPartner | null>(null);
  const [inspectingPartner, setInspectingPartner] = useState<DevelopmentPartner | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formType, setFormType] = useState<DevelopmentPartner['type']>('Multilateral Financial Institution');
  const [formStatus, setFormStatus] = useState<DevelopmentPartner['status']>('Active');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formFocalArea, setFormFocalArea] = useState('');
  const [formCommitments, setFormCommitments] = useState<number>(0);
  const [formWebsite, setFormWebsite] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormName('');
    setFormShortName('');
    setFormCountry('');
    setFormType('Multilateral Financial Institution');
    setFormStatus('Active');
    setFormContactPerson('');
    setFormContactEmail('');
    setFormContactPhone('');
    setFormFocalArea('');
    setFormCommitments(0);
    setFormWebsite('');
    setFormNotes('');
    setFormError(null);
    setShowAddEditModal(true);
  };

  // Open Edit modal
  const handleOpenEdit = (partner: DevelopmentPartner) => {
    setEditingPartner(partner);
    setFormName(partner.name);
    setFormShortName(partner.shortName || '');
    setFormCountry(partner.country);
    setFormType(partner.type);
    setFormStatus(partner.status);
    setFormContactPerson(partner.contactPerson || '');
    setFormContactEmail(partner.contactEmail || '');
    setFormContactPhone(partner.contactPhone || '');
    setFormFocalArea(partner.focalArea || '');
    setFormCommitments(partner.totalCommitments || 0);
    setFormWebsite(partner.website || '');
    setFormNotes(partner.notes || '');
    setFormError(null);
    setShowAddEditModal(true);
  };

  // Save Add/Edit
  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Partner organization name is required.');
      return;
    }
    if (!formCountry.trim()) {
      setFormError('Country / Headquarters is required.');
      return;
    }

    if (editingPartner) {
      updatePartner(editingPartner.id, {
        name: formName.trim(),
        shortName: formShortName.trim() || undefined,
        country: formCountry.trim(),
        type: formType,
        status: formStatus,
        contactPerson: formContactPerson.trim() || undefined,
        contactEmail: formContactEmail.trim() || undefined,
        contactPhone: formContactPhone.trim() || undefined,
        focalArea: formFocalArea.trim() || undefined,
        totalCommitments: Number(formCommitments) || 0,
        website: formWebsite.trim() || undefined,
        notes: formNotes.trim() || undefined
      });
      showToast(`Partner "${formName.trim()}" updated successfully.`);
    } else {
      addPartner({
        name: formName.trim(),
        shortName: formShortName.trim() || undefined,
        country: formCountry.trim(),
        type: formType,
        status: formStatus,
        contactPerson: formContactPerson.trim() || undefined,
        contactEmail: formContactEmail.trim() || undefined,
        contactPhone: formContactPhone.trim() || undefined,
        focalArea: formFocalArea.trim() || undefined,
        totalCommitments: Number(formCommitments) || 0,
        website: formWebsite.trim() || undefined,
        notes: formNotes.trim() || undefined
      });
      showToast(`Partner "${formName.trim()}" added to database.`);
    }

    setShowAddEditModal(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!partnerToDelete) return;
    deletePartner(partnerToDelete.id);
    showToast(`Partner "${partnerToDelete.name}" removed from database.`);
    setPartnerToDelete(null);
    if (inspectingPartner?.id === partnerToDelete.id) {
      setInspectingPartner(null);
    }
  };

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      if (filterType !== 'all' && p.type !== filterType) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchShort = p.shortName?.toLowerCase().includes(query);
        const matchCountry = p.country.toLowerCase().includes(query);
        const matchContact = p.contactPerson?.toLowerCase().includes(query);
        const matchArea = p.focalArea?.toLowerCase().includes(query);
        if (!matchName && !matchShort && !matchCountry && !matchContact && !matchArea) {
          return false;
        }
      }
      return true;
    });
  }, [partners, filterType, filterStatus, searchTerm]);

  // Map initiatives linked to each partner
  const partnerInitiativeLinks = useMemo(() => {
    const map: Record<string, { count: number; initiatives: typeof initiatives }> = {};
    partners.forEach((p) => {
      const pNameLower = p.name.toLowerCase();
      const pShortLower = p.shortName?.toLowerCase();
      const matches = initiatives.filter((init) => {
        const fundingMatches = init.possibleFundingPartners?.some((fp) => {
          const fpLower = fp.toLowerCase();
          return fpLower.includes(pNameLower) || pNameLower.includes(fpLower) ||
            (pShortLower && fpLower.includes(pShortLower));
        });
        const leadPartnerMatches = init.outcomes?.some((o) =>
          o.outputs?.some((outp) =>
            outp.activities?.some((act) =>
              act.leadPartner?.toLowerCase().includes(pNameLower) ||
              (pShortLower && act.leadPartner?.toLowerCase().includes(pShortLower))
            )
          )
        );
        const agreementMatch = init.financingAgreement?.implementingPartner?.toLowerCase().includes(pNameLower);
        return fundingMatches || leadPartnerMatches || agreementMatch;
      });
      map[p.id] = { count: matches.length, initiatives: matches };
    });
    return map;
  }, [partners, initiatives]);

  // Statistics
  const activeCount = partners.filter((p) => p.status === 'Active').length;
  const prospectiveCount = partners.filter((p) => p.status === 'Prospective').length;
  const totalCommitments = partners.reduce((sum, p) => sum + (p.totalCommitments || 0), 0);
  const multilateralCount = partners.filter((p) =>
    p.type.includes('Multilateral') || p.type.includes('Bank')
  ).length;

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Partner ID',
      'Organization Name',
      'Short Name / Acronym',
      'Country of Headquarters',
      'Type',
      'Status',
      'Focal Development Areas',
      'Focal Contact Person',
      'Contact Email',
      'Contact Phone',
      'Total Commitments (USD)',
      'Website',
      'Notes'
    ];

    const rows = filteredPartners.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.shortName || '').replace(/"/g, '""')}"`,
      `"${p.country.replace(/"/g, '""')}"`,
      `"${p.type}"`,
      `"${p.status}"`,
      `"${(p.focalArea || '').replace(/"/g, '""')}"`,
      `"${(p.contactPerson || '').replace(/"/g, '""')}"`,
      `"${p.contactEmail || ''}"`,
      `"${p.contactPhone || ''}"`,
      p.totalCommitments || 0,
      `"${p.website || ''}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AUDA_NEPAD_Development_Partners_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-700 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Institutional Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Handshake className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Development Partner's Database
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Strategic Portfolio Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            Central institutional repository of bilateral development agencies, multilateral development banks, UN bodies, and philanthropic partners.
            This register dynamically populates the funding partner drop-down menus across Concept Development (Stage 0) and Project Formulation (Stage 2).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-center flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors border border-slate-300 shadow-2xs cursor-pointer"
            title="Export Partner Directory to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Directory</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Partner</span>
          </button>
        </div>
      </div>

      {/* Macro Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Partners</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {partners.length}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {activeCount} active development agreements
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Multilateral / MDBs</span>
            <Globe className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono">
            {multilateralCount}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Pan-African & global institutions
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pipeline Mobilization</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
            {formatCurrency(totalCommitments, 'USD')}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block">
            Indicative envelope tracked
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pipeline Usage</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {Object.values(partnerInitiativeLinks).filter((p) => p.count > 0).length}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Partners linked in active projects
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search partners by name, acronym, country, focal area, or lead contact..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Organization Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Organization Types</option>
              {PARTNER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Partners</option>
              <option value="Prospective">Prospective Partners</option>
              <option value="Inactive">Inactive Partners</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN PARTNER DIRECTORY VIEW */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <Handshake className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-800 text-base">No Partners Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No development partner records matched the search or filter criteria. You can clear active filters or register a new partner.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Development Partner</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Partner Name & Acronym</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">HQ Country</th>
                  <th className="py-3 px-4 min-w-[200px]">Strategic Focal Areas</th>
                  <th className="py-3 px-3 min-w-[150px]">Focal Contact</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Pipeline Links</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map((partner) => {
                  const links = partnerInitiativeLinks[partner.id] || { count: 0, initiatives: [] };
                  return (
                    <tr
                      key={partner.id}
                      className="hover:bg-purple-50/20 transition-colors group cursor-pointer"
                      onClick={() => setInspectingPartner(partner)}
                    >
                      {/* Name & Acronym */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {partner.shortName ? partner.shortName.slice(0, 3) : partner.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block group-hover:text-purple-700 transition-colors">
                              {partner.name}
                            </span>
                            {partner.shortName && (
                              <span className="text-[10px] font-mono text-slate-400">
                                Acronym: {partner.shortName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {partner.type}
                        </span>
                      </td>

                      {/* Country */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{partner.country}</span>
                        </div>
                      </td>

                      {/* Focal Area */}
                      <td className="py-3 px-4">
                        <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                          {partner.focalArea || 'Cross-cutting Pan-African Development'}
                        </p>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3">
                        {partner.contactPerson ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 text-xs block">
                              {partner.contactPerson}
                            </span>
                            {partner.contactEmail && (
                              <a
                                href={`mailto:${partner.contactEmail}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-purple-600 hover:text-purple-800 block truncate"
                              >
                                {partner.contactEmail}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            partner.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : partner.status === 'Prospective'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          {partner.status}
                        </span>
                      </td>

                      {/* Pipeline Usage */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            links.count > 0
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {links.count} project{links.count !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectingPartner(partner)}
                            className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Partner Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(partner)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Partner Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartnerToDelete(partner)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Partner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS / GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => {
            const links = partnerInitiativeLinks[partner.id] || { count: 0, initiatives: [] };
            return (
              <div
                key={partner.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                onClick={() => setInspectingPartner(partner)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {partner.shortName ? partner.shortName.slice(0, 3) : partner.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs group-hover:text-purple-700 transition-colors line-clamp-1">
                          {partner.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{partner.country}</span>
                          {partner.shortName && (
                            <>
                              <span>•</span>
                              <span>{partner.shortName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                        partner.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : partner.status === 'Prospective'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {partner.status}
                    </span>
                  </div>

                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {partner.type}
                  </span>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {partner.focalArea || 'Cross-cutting continental development partner.'}
                  </p>

                  {/* Contact Summary */}
                  {partner.contactPerson && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <User className="w-3 h-3 text-purple-600" />
                        <span>{partner.contactPerson}</span>
                      </div>
                      {partner.contactEmail && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] truncate">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{partner.contactEmail}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] font-bold font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                    {links.count} Linked Project{links.count !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(partner)}
                      className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Partner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerToDelete(partner)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Partner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT PARTNER */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingPartner ? 'Edit Development Partner Record' : 'Register New Development Partner'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Saves to the institutional database for concept and project drop-down selection.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePartner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Partner Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. African Development Bank (AfDB)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Acronym / Short Name
                  </label>
                  <input
                    type="text"
                    value={formShortName}
                    onChange={(e) => setFormShortName(e.target.value)}
                    placeholder="e.g. AfDB"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Organization Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as DevelopmentPartner['type'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {PARTNER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Headquarters / Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder="e.g. Cote d'Ivoire or Belgium"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Partnership Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as DevelopmentPartner['status'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Active">Active Partner</option>
                    <option value="Prospective">Prospective Partner</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Strategic Focal Areas & Sectors
                </label>
                <input
                  type="text"
                  value={formFocalArea}
                  onChange={(e) => setFormFocalArea(e.target.value)}
                  placeholder="e.g. Renewable Energy, PIDA Cross-border Infrastructure, Climate Adaptation"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Focal Contact Person
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="Name & Title"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    value={formContactEmail}
                    onChange={(e) => setFormContactEmail(e.target.value)}
                    placeholder="official.liaison@partner.org"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone / Hotline
                  </label>
                  <input
                    type="text"
                    value={formContactPhone}
                    onChange={(e) => setFormContactPhone(e.target.value)}
                    placeholder="+225 ... or +32 ..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Total Historical / Pledged Commitments (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500000}
                    value={formCommitments}
                    onChange={(e) => setFormCommitments(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Official Website / Portal
                  </label>
                  <input
                    type="url"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://www.partner-agency.org"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Institutional Notes & Governance Arrangements
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Co-financing mechanisms, procurement arrangements, bilateral agreement covenants..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPartner ? 'Update Partner Record' : 'Save to Partner Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Delete Development Partner
                </h3>
                <p className="text-xs text-slate-500">
                  {partnerToDelete.name}
                </p>
              </div>
            </div>

            {partnerInitiativeLinks[partnerToDelete.id]?.count > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Pipeline Linkage Warning</span>
                </div>
                <p>
                  This partner is currently referenced by{' '}
                  <strong>{partnerInitiativeLinks[partnerToDelete.id].count} active project(s)</strong> in the PPMS pipeline.
                  Deleting it will remove it from the selectable drop-down menu for future concepts.
                </p>
              </div>
            )}

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently remove this partner organization from the strategic registry?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPartnerToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: PARTNER PROFILE INSPECTOR */}
      {inspectingPartner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {inspectingPartner.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {inspectingPartner.id} • {inspectingPartner.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingPartner(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="p-4 bg-gradient-to-r from-purple-50 via-slate-50 to-purple-50/40 rounded-xl border border-purple-200/80 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{inspectingPartner.name}</span>
                    {inspectingPartner.shortName && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-purple-800 border border-purple-200 font-mono">
                        {inspectingPartner.shortName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{inspectingPartner.country}</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold">{inspectingPartner.type}</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    inspectingPartner.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : inspectingPartner.status === 'Prospective'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {inspectingPartner.status}
                </span>
              </div>

              {inspectingPartner.totalCommitments ? (
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Indicative Financing Commitment:</span>
                  <span className="font-mono font-extrabold text-emerald-800 text-sm">
                    {formatCurrency(inspectingPartner.totalCommitments, 'USD')}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Strategic Focus */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                Primary Development Focal Areas:
              </span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-medium">
                {inspectingPartner.focalArea || 'Cross-sectoral Pan-African Development, Agenda 2063 Infrastructure and Capacity Building.'}
              </p>
            </div>

            {/* Contact Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Institutional Liaison Focal Person
                </span>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>{inspectingPartner.contactPerson || 'Official Institutional Representative'}</span>
                </div>
                {inspectingPartner.contactEmail && (
                  <div className="flex items-center gap-1.5 text-slate-600 pt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a
                      href={`mailto:${inspectingPartner.contactEmail}`}
                      className="text-purple-600 hover:underline"
                    >
                      {inspectingPartner.contactEmail}
                    </a>
                  </div>
                )}
                {inspectingPartner.contactPhone && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inspectingPartner.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Website & Archival Registry
                </span>
                {inspectingPartner.website ? (
                  <a
                    href={inspectingPartner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-purple-700 hover:underline flex items-center gap-1.5 pt-0.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{inspectingPartner.website.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic block pt-0.5">No website registered</span>
                )}
                <div className="text-[11px] text-slate-500 pt-1">
                  Registered: {inspectingPartner.dateAdded ? formatDate(inspectingPartner.dateAdded) : '2024-01-01'}
                </div>
              </div>
            </div>

            {/* Notes */}
            {inspectingPartner.notes && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Partnership Protocol & MoU Notes:
                </span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed italic">
                  "{inspectingPartner.notes}"
                </p>
              </div>
            )}

            {/* Linked Pipeline Projects */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Associated PPMS Pipeline Initiatives:
                </span>
                <span className="text-[10px] font-bold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {partnerInitiativeLinks[inspectingPartner.id]?.count || 0} Linked
                </span>
              </div>

              {partnerInitiativeLinks[inspectingPartner.id]?.count === 0 ? (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                  This partner has not yet been selected by any active pipeline initiatives.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {partnerInitiativeLinks[inspectingPartner.id]?.initiatives.map((init) => (
                    <div
                      key={init.id}
                      onClick={() => {
                        setSelectedInitiativeId(init.id);
                        setInspectingPartner(null);
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-800 text-[10px]">{init.code}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-500">{init.stage}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs truncate mt-0.5">
                          {init.title}
                        </h5>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setPartnerToDelete(inspectingPartner);
                }}
                className="px-3.5 py-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Partner</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingPartner(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(inspectingPartner);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
