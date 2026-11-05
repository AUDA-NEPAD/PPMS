import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage, Initiative } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { LifecycleAgeBadge } from '../common/LifecycleAgeBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Layers,
  CheckSquare,
  FileText,
  Compass,
  Users,
  ClipboardCheck,
  Award,
  FileSignature,
  RefreshCw,
  Handshake,
  FolderGit2,
  BarChart3,
  FileStack,
  ShieldAlert,
  History,
  Settings as SettingsIcon,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface GenericModuleViewProps {
  page: NavigationPage;
}

export const GenericModuleView: React.FC<GenericModuleViewProps> = ({ page }) => {
  const {
    initiatives,
    currentUser,
    tasks,
    auditLogs,
    setSelectedInitiativeId,
    setSelectedProjectDevelopmentId,
    setSelectedAppraisalId,
    setSelectedCeoApprovalId,
    setSelectedContractingId,
    setSelectedAmendmentInitiativeId,
    setCurrentPage
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Filter initiatives relevant to this module
  let filteredInitiatives = initiatives.filter((i) => {
    if (searchTerm) {
      const match =
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.directorate.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }

    switch (page) {
      case 'Concepts':
        return i.stageCode === 0 || i.stageCode === 1;
      case 'Program Board Evaluation':
        return i.stageCode === 1;
      case 'Project Development':
        return i.stageCode === 2;
      case 'Project Appraisal':
        return i.stageCode === 3;
      case 'CEO Approval':
        return i.stageCode === 4;
      case 'Contracting':
        return i.stageCode === 5;
      case 'Amendments':
        return i.stageCode === 6 || (i.amendments && i.amendments.length > 0);
      default:
        return true;
    }
  });

  // Get module metadata
  const getModuleMeta = () => {
    switch (page) {
      case 'Project Pipeline':
        return {
          title: 'Master Project Pipeline Register',
          subtitle: 'Comprehensive portfolio of continental initiatives across all lifecycle stages.',
          icon: Layers,
          badge: `${initiatives.length} Active Records`,
          badgeColor: 'bg-emerald-100 text-emerald-800'
        };
      case 'My Assignments':
        return {
          title: 'My Actionable Assignments & Governance Tasks',
          subtitle: `Initiatives and review queues assigned to ${currentUser.name} (${currentUser.role}).`,
          icon: CheckSquare,
          badge: `${tasks.filter((t) => t.assignedToRole === currentUser.role).length} Pending`,
          badgeColor: 'bg-amber-100 text-amber-800'
        };
      case 'Concepts':
        return {
          title: 'Stage 0: Concept Registration & Development',
          subtitle: 'Register new project ideas, conduct similarity & duplicate checks, and prepare for board submission.',
          icon: FileText,
          badge: 'Stage 0 Gateway',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'Program Board Evaluation':
        return {
          title: 'Stage 1: Program Board Concept Evaluation Workspace',
          subtitle: 'Collective board review to endorse for development, return for clarification, hold, or reject.',
          icon: Users,
          badge: 'Stage 1 Board Gate',
          badgeColor: 'bg-indigo-100 text-indigo-800'
        };
      case 'Project Development':
        return {
          title: 'Stage 2: Full Project Proposal Development',
          subtitle: 'Formulate strategic alignment, theory of change, risks, results framework, and budget rollups.',
          icon: Compass,
          badge: 'Stage 2 Technical Gate',
          badgeColor: 'bg-teal-100 text-teal-800'
        };
      case 'Project Appraisal':
        return {
          title: 'Stage 3: Program Board Project Appraisal',
          subtitle: 'Evaluate 6 standard appraisal criteria, score proposals, and transmit consolidated recommendations to the CEO.',
          icon: ClipboardCheck,
          badge: 'Stage 3 Appraisal Gate',
          badgeColor: 'bg-purple-100 text-purple-800'
        };
      case 'CEO Approval':
        return {
          title: 'Stage 4: Executive CEO Approval Page',
          subtitle: 'Official CEO sanction workspace to formally approve, conditionally approve, or return projects.',
          icon: Award,
          badge: 'Stage 4 Executive Gate',
          badgeColor: 'bg-orange-100 text-orange-800'
        };
      case 'Contracting':
        return {
          title: 'Stage 5: Post-Approval Contracting Workspace',
          subtitle: 'Manage bilateral partner negotiations, MoUs, master financing agreements, and milestone disbursement tranches.',
          icon: FileSignature,
          badge: 'Stage 5 Contracting Gate',
          badgeColor: 'bg-cyan-100 text-cyan-800'
        };
      case 'Amendments':
        return {
          title: 'Stage 6: Controlled Amendment & Change Management',
          subtitle: 'Reopen approved projects through structured amendment requests with audit version preservation.',
          icon: RefreshCw,
          badge: 'Stage 6 Change Gate',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        };
      case 'Partners':
        return {
          title: 'Strategic Development Partners Database',
          subtitle: 'Directory of bilateral donors, development banks, and institutional co-financiers.',
          icon: Handshake,
          badge: '8 Active Partners',
          badgeColor: 'bg-slate-100 text-slate-800'
        };
      case 'Programmes':
        return {
          title: 'Flagship Continental Programmes',
          subtitle: 'Strategic umbrella frameworks including PIDA, CAADP, AfCFTA support, and Science Hubs.',
          icon: FolderGit2,
          badge: '5 Umbrella Programmes',
          badgeColor: 'bg-slate-100 text-slate-800'
        };
      case 'Risk Matrix':
        return {
          title: 'Continental Portfolio Risk Matrix & Heat Map',
          subtitle: 'Aggregated project risk registers, 3x3 Likelihood vs Impact heat mapping, and mitigation action plans.',
          icon: ShieldAlert,
          badge: 'Portfolio Surveillance',
          badgeColor: 'bg-rose-100 text-rose-800'
        };
      case 'Reports':
        return {
          title: 'Executive Reporting & Excel Data Export',
          subtitle: 'Portfolio analytical rollups, pipeline trends, financial commitments, and tabular export.',
          icon: BarChart3,
          badge: 'Export Ready',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        };
      case 'Documents':
        return {
          title: 'Centralized Institutional Document Repository',
          subtitle: 'Secure storage of concept notes, project appraisal dossiers, CEO directives, and executed MoUs.',
          icon: FileStack,
          badge: 'Governance Vault',
          badgeColor: 'bg-slate-100 text-slate-800'
        };
      case 'Administration':
        return {
          title: 'System Administration & Reference Data Configuration',
          subtitle: 'Manage directorates, appraisal criteria, financing instruments, and security roles.',
          icon: ShieldAlert,
          badge: 'Admin Only',
          badgeColor: 'bg-rose-100 text-rose-800'
        };
      case 'Audit Trail':
        return {
          title: 'System-wide Immutable Audit Log',
          subtitle: 'Chronological recording of every workflow transition, decision, field change, and document upload.',
          icon: History,
          badge: 'Audit Grade',
          badgeColor: 'bg-slate-100 text-slate-800'
        };
      case 'Settings':
      default:
        return {
          title: 'User Preferences & Workflow Settings',
          subtitle: 'Configure in-app notification alerts, default display currency, and session preferences.',
          icon: SettingsIcon,
          badge: 'System v2.4',
          badgeColor: 'bg-slate-100 text-slate-800'
        };
    }
  };

  const meta = getModuleMeta();
  const Icon = meta.icon;

  const exportToCSV = () => {
    const headers = ['Code', 'Title', 'Classification', 'Directorate', 'Stage', 'Status', 'Budget', 'Currency', 'Owner'];
    const rows = filteredInitiatives.map((i) => [
      i.code,
      `"${i.title.replace(/"/g, '""')}"`,
      i.classification,
      `"${i.directorate}"`,
      `"${i.stage}"`,
      i.status,
      i.estimatedCost,
      i.currency,
      `"${i.ownerName}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${page.replace(/\s+/g, '_')}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Module Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {meta.title}
              </h1>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${meta.badgeColor}`}>
                {meta.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Special Content for MY ASSIGNMENTS */}
      {page === 'My Assignments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tasks Assigned to: {currentUser.role}
                </h3>
                <p className="text-xs text-slate-500">
                  Switch roles in the top-right header to simulate tasks for CEO, Board Member, Concept Owner, etc.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {tasks.filter((t) => t.assignedToRole === currentUser.role).length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    No pending assignments for {currentUser.role}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try switching to 'CEO' or 'Programme Board Member' to see pending approvals and appraisals.
                  </p>
                </div>
              ) : (
                tasks
                  .filter((t) => t.assignedToRole === currentUser.role)
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedInitiativeId(task.initiativeId)}
                      className="py-4 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : task.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {task.actionType}
                          </span>
                          <span className="text-xs text-slate-400">
                            Due: {task.dueDate}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Related Initiative: <strong>{task.initiativeTitle}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5">
                          <span>Open Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Special Content for AUDIT TRAIL */}
      {page === 'Audit Trail' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              System Audit Events & Workflow Traceability Log
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Recorded: {auditLogs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Initiative / Target</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">User & Role</th>
                  <th className="p-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedInitiativeId(log.entityId)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 max-w-xs truncate">
                      {log.entityTitle}
                    </td>
                    <td className="p-3 font-semibold text-emerald-800">
                      {log.action}
                    </td>
                    <td className="p-3 text-slate-700">
                      <div>{log.user}</div>
                      <div className="text-[10px] text-slate-400">{log.userRole}</div>
                    </td>
                    <td className="p-3 text-slate-600 max-w-md truncate italic">
                      "{log.comment}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Initiatives Table for Pipeline & Stage Views */}
      {page !== 'Audit Trail' && page !== 'My Assignments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Table Search Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search in ${page}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredInitiatives.length} initiative(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Code & Title</th>
                  <th className="p-3.5">Directorate</th>
                  <th className="p-3.5">Lifecycle Stage</th>
                  <th className="p-3.5 min-w-[170px]">Process Age & Gate SLA (RAG)</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 text-right">Budget (USD)</th>
                  <th className="p-3.5">Target Geography</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInitiatives.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No initiatives currently in this stage or matching query.
                    </td>
                  </tr>
                ) : (
                  filteredInitiatives.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedInitiativeId(item.id)}
                      className="hover:bg-emerald-50/30 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {item.code}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-50 text-slate-500 border border-slate-200">
                            {item.classification}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 mt-1 line-clamp-1">
                          {item.title}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-[180px] truncate">
                        {item.directorate}
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">
                        Stage {item.stageCode}: {item.stage.split(':')[1]?.trim() || item.stage}
                      </td>
                      <td className="p-3.5">
                        <LifecycleAgeBadge initiative={item} compact />
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.estimatedCost, item.currency)}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {item.isContinental ? 'Continental' : item.regions.join(', ')}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInitiativeId(item.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                          >
                            Inspect
                          </button>
                          {item.stageCode === 2 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProjectDevelopmentId(item.id);
                                setCurrentPage('Project Development');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                            >
                              Develop
                            </button>
                          )}
                          {item.stageCode === 3 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppraisalId(item.id);
                                setCurrentPage('Project Appraisal');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] transition-colors"
                            >
                              Appraise
                            </button>
                          )}
                          {item.stageCode === 4 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCeoApprovalId(item.id);
                                setCurrentPage('CEO Approval');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {(item.stageCode === 5 || item.status === 'Under Contracting' || item.status === 'Financing Finalized') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContractingId(item.id);
                                setCurrentPage('Contracting');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors"
                            >
                              Contract
                            </button>
                          )}
                          {(item.stageCode === 6 || (item.amendments && item.amendments.length > 0)) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAmendmentInitiativeId(item.id);
                                setCurrentPage('Amendments');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition-colors"
                            >
                              Amend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
