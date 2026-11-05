import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  Shield,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Menu,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Layers,
  ExternalLink
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dashboardFilters,
    setDashboardFilters,
    resetToSampleData,
    setSelectedInitiativeId,
    setCurrentPage
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setShowRoleDropdown(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (roleName: UserRole) => {
    const targetUser = users.find((u) => u.role === roleName);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
    setShowRoleDropdown(false);
  };

  const handleNotificationClick = (notifId: string, relatedId?: string) => {
    markNotificationAsRead(notifId);
    if (relatedId) {
      setSelectedInitiativeId(relatedId);
    }
    setShowNotifDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Continental Insignia Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md border border-emerald-400/30 flex-shrink-0">
              <span className="text-amber-400 font-extrabold text-sm tracking-wider">AU</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  Pipeline Projects Management System
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PPMS Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AUDA-NEPAD Continental Initiative Lifecycle & Governance
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search initiatives, codes, directorates, partners..."
              value={dashboardFilters.search}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-9 pr-4 py-1.5 bg-slate-800/90 text-sm text-slate-100 placeholder-slate-400 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {dashboardFilters.search && (
              <button
                onClick={() =>
                  setDashboardFilters((prev) => ({ ...prev, search: '' }))
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Demo Reset, Notifications, RBAC Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Reset Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset application data back to demonstration initial state?')) {
                resetToSampleData();
              }
            }}
            title="Reset to Demonstration Data"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo Data</span>
          </button>

          {/* AI Strategic Advisor Launcher Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-ai-chat'));
            }}
            title="Ask AUDA-NEPAD Strategic Intelligence AI Advisor (Alt+K)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 hover:border-emerald-400 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">AI Advisor</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="In-App Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications available
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.relatedId)}
                        className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex-shrink-0">
                            {notif.priority === 'urgent' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                            ) : notif.priority === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            ) : notif.priority === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Info className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {formatDateTime(notif.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setCurrentPage('My Assignments');
                      setShowNotifDropdown(false);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    View All Actionable Assignments &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role-Based Access Control Switcher */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Switch Active User Role for RBAC Testing"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-emerald-400"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                  <span>{currentUser.name.split(' ')[0]}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentUser.role.split(' ')[0]}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Simulate User Role (RBAC)
                    </span>
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select any profile to test role-filtered menus and stage permissions:
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleRoleSelect(u.role)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-emerald-50/80 font-medium' : ''
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {u.name}
                            </span>
                            {isSelected && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 block truncate">
                            {u.role}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {u.directorate}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 pt-2 pb-1 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 text-center">
                  Sidebar navigation updates dynamically per selected role
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
