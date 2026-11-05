import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ConceptManagementView } from './components/stage0/ConceptManagementView';
import { ConceptEvaluationWorkspace } from './components/stage1/ConceptEvaluationWorkspace';
import { ProjectDevelopmentWorkspace } from './components/stage2/ProjectDevelopmentWorkspace';
import { ProjectAppraisalWorkspace } from './components/stage3/ProjectAppraisalWorkspace';
import { CeoApprovalWorkspace } from './components/stage4/CeoApprovalWorkspace';
import { ContractingWorkspace } from './components/stage5/ContractingWorkspace';
import { AmendmentsWorkspace } from './components/stage6/AmendmentsWorkspace';
import { ReportsAndAnalyticsWorkspace } from './components/reports/ReportsAndAnalyticsWorkspace';
import { AlternativeExecutiveDashboard } from './components/reports/AlternativeExecutiveDashboard';
import { RiskMatrixWorkspace } from './components/portfolio/RiskMatrixWorkspace';
import { PartnersDatabaseWorkspace } from './components/portfolio/PartnersDatabaseWorkspace';
import { GenericModuleView } from './components/views/GenericModuleView';
import { InitiativeDetailModal } from './components/common/InitiativeDetailModal';
import { AIChatbotDrawer } from './components/ai/AIChatbotDrawer';
import { ChevronRight, Home, Shield, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    selectedInitiative,
    setSelectedInitiativeId
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Application Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar with Role-Based Visibility */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full space-y-5">
            {/* Breadcrumb Navigation Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pb-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage('Dashboard')}
                  className="flex items-center gap-1 hover:text-slate-800 transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>PPMS</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-semibold text-slate-800">
                  {currentPage === 'Partners' ? "Partner's Database" : currentPage}
                </span>
              </div>

              {/* RBAC Scope Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Logged in as:
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{currentUser.name}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-700 font-bold">{currentUser.role}</span>
                </span>
              </div>
            </div>

            {/* Active View Router */}
            {currentPage === 'Dashboard' ? (
              <DashboardView />
            ) : currentPage === 'Concepts' ? (
              <ConceptManagementView />
            ) : currentPage === 'Program Board Evaluation' ? (
              <ConceptEvaluationWorkspace />
            ) : currentPage === 'Project Development' ? (
              <ProjectDevelopmentWorkspace />
            ) : currentPage === 'Project Appraisal' ? (
              <ProjectAppraisalWorkspace />
            ) : currentPage === 'CEO Approval' ? (
              <CeoApprovalWorkspace />
            ) : currentPage === 'Contracting' ? (
              <ContractingWorkspace />
            ) : currentPage === 'Amendments' ? (
              <AmendmentsWorkspace />
            ) : currentPage === 'Reports' ? (
              <ReportsAndAnalyticsWorkspace />
            ) : currentPage === 'Executive Dashboard' ? (
              <AlternativeExecutiveDashboard isStandalonePage={true} />
            ) : currentPage === 'Risk Matrix' ? (
              <RiskMatrixWorkspace />
            ) : currentPage === 'Partners' ? (
              <PartnersDatabaseWorkspace />
            ) : (
              <GenericModuleView page={currentPage} />
            )}
          </div>

          {/* Institutional Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                Pipeline Projects Management System (PPMS)
              </span>
              <span>•</span>
              <span>African Union Development Agency (AUDA-NEPAD)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Demonstration Prototype v1.0
              </span>
              <span>Agenda 2063 Strategic Framework</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Global Initiative Quick-View Inspector Drawer / Modal */}
      {selectedInitiative && (
        <InitiativeDetailModal
          initiative={selectedInitiative}
          onClose={() => setSelectedInitiativeId(null)}
        />
      )}

      {/* Global AUDA-NEPAD Strategic Intelligence AI Assistant Drawer */}
      <AIChatbotDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
