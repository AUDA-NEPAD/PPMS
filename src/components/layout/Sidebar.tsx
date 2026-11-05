import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';
import {
  LayoutDashboard,
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
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemConfig {
  page: NavigationPage;
  label: string;
  icon: React.ElementType;
  badge?: (counts: any) => number | string | null;
  stageCode?: number;
}

interface NavSection {
  title: string;
  items: NavItemConfig[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse
}) => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    hasAccessToPage,
    tasks,
    initiatives,
    partners
  } = useApp();

  // Dynamic counts for badges
  const myTasksCount = tasks.filter(
    (t) => t.assignedToRole === currentUser.role && t.status !== 'Completed'
  ).length;

  const awaitingEvaluationCount = initiatives.filter(
    (i) => i.stageCode === 1 && i.status === 'Submitted to Board'
  ).length;

  const projectDevCount = initiatives.filter(
    (i) =>
      i.stageCode === 2 ||
      i.status === 'Under Development' ||
      i.status === 'Approved for Development'
  ).length;

  const awaitingAppraisalCount = initiatives.filter(
    (i) => i.stageCode === 3
  ).length;

  const awaitingCEOCount = initiatives.filter(
    (i) => i.stageCode === 4 && i.status === 'Awaiting CEO Decision'
  ).length;

  const contractingCount = initiatives.filter(
    (i) => i.stageCode === 5
  ).length;

  const totalActiveRisksCount = initiatives.reduce(
    (count, init) => count + (init.risks?.filter((r) => r.currentStatus === 'Active').length || 0),
    0
  );

  const SECTIONS: NavSection[] = [
    {
      title: 'Initiative Management',
      items: [
        {
          page: 'Dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard
        },
        {
          page: 'Project Pipeline',
          label: 'Project Pipeline',
          icon: Layers,
          badge: () => initiatives.length
        },
        {
          page: 'My Assignments',
          label: 'My Assignments',
          icon: CheckSquare,
          badge: () => (myTasksCount > 0 ? myTasksCount : null)
        }
      ]
    },
    {
      title: 'Lifecycle Stages',
      items: [
        {
          page: 'Concepts',
          label: 'Stage 0: Concepts',
          icon: FileText,
          stageCode: 0
        },
        {
          page: 'Program Board Evaluation',
          label: 'Stage 1: Concept Eval',
          icon: Users,
          stageCode: 1,
          badge: () => (awaitingEvaluationCount > 0 ? awaitingEvaluationCount : null)
        },
        {
          page: 'Project Development',
          label: 'Stage 2: Project Dev',
          icon: Compass,
          stageCode: 2,
          badge: () => (projectDevCount > 0 ? projectDevCount : null)
        },
        {
          page: 'Project Appraisal',
          label: 'Stage 3: Appraisal',
          icon: ClipboardCheck,
          stageCode: 3,
          badge: () => (awaitingAppraisalCount > 0 ? awaitingAppraisalCount : null)
        },
        {
          page: 'CEO Approval',
          label: 'Stage 4: CEO Approval',
          icon: Award,
          stageCode: 4,
          badge: () => (awaitingCEOCount > 0 ? awaitingCEOCount : null)
        },
        {
          page: 'Contracting',
          label: 'Stage 5: Contracting',
          icon: FileSignature,
          stageCode: 5,
          badge: () => (contractingCount > 0 ? contractingCount : null)
        },
        {
          page: 'Amendments',
          label: 'Stage 6: Amendments',
          icon: RefreshCw,
          stageCode: 6
        }
      ]
    },
    {
      title: 'Strategic Portfolio',
      items: [
        {
          page: 'Partners',
          label: "Partner's Database",
          icon: Handshake,
          badge: () => (partners.length > 0 ? partners.length : null)
        },
        {
          page: 'Programmes',
          label: 'Programmes',
          icon: FolderGit2
        },
        {
          page: 'Risk Matrix',
          label: 'Risk Matrix & Heat Map',
          icon: ShieldAlert,
          badge: () => (totalActiveRisksCount > 0 ? totalActiveRisksCount : null)
        },
        {
          page: 'Reports',
          label: 'Reports & Analytics',
          icon: BarChart3
        },
        {
          page: 'Executive Dashboard',
          label: 'Executive Dashboard',
          icon: LayoutDashboard,
          badge: () => 'New'
        },
        {
          page: 'Documents',
          label: 'Document Library',
          icon: FileStack
        }
      ]
    },
    {
      title: 'Governance & System',
      items: [
        {
          page: 'Administration',
          label: 'Administration',
          icon: ShieldAlert
        },
        {
          page: 'Audit Trail',
          label: 'Audit Trail',
          icon: History
        },
        {
          page: 'Settings',
          label: 'Settings',
          icon: Settings
        }
      ]
    }
  ];

  const handleNavClick = (page: NavigationPage) => {
    setCurrentPage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 lg:static bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Top Header inside mobile sidebar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 lg:hidden text-white">
          <span className="font-bold text-sm tracking-wide">PPMS Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Current Role Banner in Sidebar */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Access Scope
                </span>
                <span className="text-xs font-semibold text-emerald-300 truncate block">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {SECTIONS.map((section) => {
            // Filter items by role permission
            const visibleItems = section.items.filter((item) =>
              hasAccessToPage(item.page, currentUser.role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </div>
                )}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = currentPage === item.page;
                    const Icon = item.icon;
                    const badgeVal = item.badge ? item.badge({}) : null;

                    return (
                      <button
                        key={item.page}
                        onClick={() => handleNavClick(item.page)}
                        title={collapsed ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        } ${collapsed ? 'justify-center' : ''}`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />

                        {!collapsed && (
                          <span className="flex-1 text-left truncate">{item.label}</span>
                        )}

                        {!collapsed && badgeVal !== null && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-800 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {badgeVal}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapse toggle at bottom for desktop */}
        <div className="p-3 border-t border-slate-800 hidden lg:flex items-center justify-between">
          {!collapsed && (
            <div className="text-[11px] text-slate-400 truncate">
              {currentUser.directorate.split(',')[0]}
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
