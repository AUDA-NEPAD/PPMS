import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  User,
  UserRole,
  Initiative,
  TaskItem,
  NotificationItem,
  AuditEvent,
  NavigationPage,
  Directorate,
  AfricanRegion,
  StrategicResultArea,
  InitiativeStatus,
  EvaluationDecision,
  WorkflowTransition,
  BoardAppraisal,
  AppraisalRating,
  FinancingAgreement,
  DisbursementTranche,
  MoUItem,
  NegotiationRecord,
  AmendmentItem,
  RiskItem,
  DevelopmentPartner
} from '../types';
import {
  MOCK_USERS,
  MOCK_INITIATIVES,
  MOCK_TASKS,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  INITIAL_DEVELOPMENT_PARTNERS
} from '../data/mockData';

export interface DashboardFilters {
  search: string;
  directorate: string;
  region: string;
  country: string;
  sra: string;
  sdp: string;
  status: string;
  stage: string;
  partner: string;
  owner: string;
}

export const initialFilters: DashboardFilters = {
  search: '',
  directorate: '',
  region: '',
  country: '',
  sra: '',
  sdp: '',
  status: '',
  stage: '',
  partner: '',
  owner: ''
};

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  initiatives: Initiative[];
  tasks: TaskItem[];
  notifications: NotificationItem[];
  auditLogs: AuditEvent[];
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  selectedInitiative: Initiative | null;
  setSelectedInitiativeId: (id: string | null) => void;
  dashboardFilters: DashboardFilters;
  setDashboardFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  resetFilters: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  hasAccessToPage: (page: NavigationPage, role?: UserRole) => boolean;
  getAllowedPagesForRole: (role: UserRole) => NavigationPage[];
  resetToSampleData: () => void;

  // Stage 0 & Stage 1 Workflow Handlers
  saveConcept: (concept: Initiative) => void;
  submitConceptToBoard: (id: string, conceptData?: Initiative) => void;
  withdrawConceptDraft: (id: string) => void;
  duplicateConcept: (id: string) => void;
  deleteConcept: (id: string) => void;
  recordBoardEvaluationDecision: (id: string, decision: EvaluationDecision) => void;

  // Stage 2 Project Development Handlers
  saveProjectDevelopment: (id: string, projectData: Partial<Initiative>) => void;
  submitProjectForAppraisal: (id: string, appraisalComments?: string) => void;
  selectedProjectDevelopmentId: string | null;
  setSelectedProjectDevelopmentId: (id: string | null) => void;

  // Stage 3 Project Appraisal Handlers
  selectedAppraisalId: string | null;
  setSelectedAppraisalId: (id: string | null) => void;
  saveBoardAppraisal: (id: string, appraisal: Partial<BoardAppraisal>) => void;
  recordAppraisalRating: (id: string, rating: AppraisalRating) => void;
  submitBoardAppraisalDecision: (
    id: string,
    recommendation: BoardAppraisal['recommendation'],
    overallComment: string,
    evidenceAdvice: string,
    conditions: string[],
    requiredRevisions: string[]
  ) => void;

  // Stage 4 CEO Approval Handlers
  selectedCeoApprovalId: string | null;
  setSelectedCeoApprovalId: (id: string | null) => void;
  recordCeoDecision: (
    id: string,
    decision: 'Formally Approved' | 'Conditionally Approved' | 'Returned for Revision',
    guidanceText: string,
    conditions?: {
      condition: string;
      responsiblePerson: string;
      dueDate: string;
      status: 'Pending' | 'Complied' | 'Waived';
    }[],
    resubmissionDeadline?: string,
    customRefNumber?: string
  ) => void;
  updateCeoConditionStatus: (
    id: string,
    conditionIndex: number,
    status: 'Pending' | 'Complied' | 'Waived',
    notes?: string
  ) => void;

  // Stage 5 Contracting Handlers
  selectedContractingId: string | null;
  setSelectedContractingId: (id: string | null) => void;
  saveFinancingAgreement: (initiativeId: string, agreement: Partial<FinancingAgreement>) => void;
  addDisbursementTranche: (initiativeId: string, tranche: Omit<DisbursementTranche, 'id'>) => void;
  updateTrancheStatus: (
    initiativeId: string,
    trancheId: string,
    status: DisbursementTranche['status'],
    notes?: string,
    actualDate?: string
  ) => void;
  addNegotiationRecord: (initiativeId: string, negotiation: Omit<NegotiationRecord, 'id'>) => void;
  updateNegotiationStatus: (
    initiativeId: string,
    negotiationId: string,
    status: NegotiationRecord['status']
  ) => void;
  addMoUItem: (initiativeId: string, mou: Omit<MoUItem, 'id'>) => void;
  updateMoUStatus: (initiativeId: string, mouId: string, status: MoUItem['status']) => void;
  finalizeFinancing: (initiativeId: string, notes?: string) => void;

  // Stage 6 Amendments Handlers
  selectedAmendmentInitiativeId: string | null;
  setSelectedAmendmentInitiativeId: (id: string | null) => void;
  createAmendmentRequest: (
    initiativeId: string,
    amendment: Omit<AmendmentItem, 'id' | 'amendmentId' | 'dateRequested' | 'approvalStatus'>
  ) => void;
  reviewAmendmentDecision: (
    initiativeId: string,
    amendmentId: string,
    decision: 'Endorsed' | 'Approved by CEO' | 'Rejected',
    comments?: string
  ) => void;

  // Portfolio Risk Matrix Handlers
  addRiskToInitiative: (
    initiativeId: string,
    risk: Omit<RiskItem, 'id'>
  ) => void;
  updateRiskStatus: (
    initiativeId: string,
    riskId: string,
    newStatus: 'Active' | 'Mitigated' | 'Closed',
    mitigationNote?: string
  ) => void;

  // Strategic Portfolio Development Partners
  partners: DevelopmentPartner[];
  addPartner: (partner: Omit<DevelopmentPartner, 'id'>) => DevelopmentPartner;
  updatePartner: (id: string, updates: Partial<DevelopmentPartner>) => void;
  deletePartner: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default to Admin for full inspection
  const [initiatives, setInitiatives] = useState<Initiative[]>(MOCK_INITIATIVES);
  const [partners, setPartners] = useState<DevelopmentPartner[]>(INITIAL_DEVELOPMENT_PARTNERS);
  const [tasks, setTasks] = useState<TaskItem[]>(MOCK_TASKS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(MOCK_AUDIT_LOGS);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('Dashboard');
  const [selectedInitiativeId, setSelectedInitiativeIdState] = useState<string | null>(null);
  const [selectedProjectDevelopmentId, setSelectedProjectDevelopmentId] = useState<string | null>(null);
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(null);
  const [selectedCeoApprovalId, setSelectedCeoApprovalId] = useState<string | null>(null);
  const [selectedContractingId, setSelectedContractingId] = useState<string | null>(null);
  const [selectedAmendmentInitiativeId, setSelectedAmendmentInitiativeId] = useState<string | null>(null);
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilters>(initialFilters);

  const selectedInitiative = useMemo(() => {
    if (!selectedInitiativeId) return null;
    return initiatives.find((i) => i.id === selectedInitiativeId) || null;
  }, [initiatives, selectedInitiativeId]);

  const setSelectedInitiativeId = (id: string | null) => {
    setSelectedInitiativeIdState(id);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // 1. Save or Update Concept Draft
  const saveConcept = (concept: Initiative) => {
    setInitiatives((prev) => {
      const exists = prev.some((i) => i.id === concept.id);
      if (exists) {
        return prev.map((i) => (i.id === concept.id ? concept : i));
      }
      return [concept, ...prev];
    });

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entityType: 'Concept',
      entityId: concept.id,
      entityTitle: concept.title,
      action: 'Concept Draft Saved',
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Draft saved with estimated budget ${concept.estimatedCost} ${concept.currency}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 2. Submit Concept to Program Board (Stage 0 -> Stage 1)
  const submitConceptToBoard = (id: string, conceptData?: Initiative) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = conceptData?.title || '';

    setInitiatives((prev) => {
      const exists = prev.some((init) => init.id === id);

      const newTransition: WorkflowTransition = {
        id: `trans-${Date.now()}`,
        initiativeId: id,
        fromStage: conceptData?.stage || 'Stage 0: Concept Development',
        toStage: 'Stage 1: Concept Evaluation',
        fromStatus: conceptData?.status || 'Draft',
        toStatus: 'Submitted to Board',
        performedBy: currentUser.name,
        performerRole: currentUser.role,
        timestamp,
        decision: 'Submitted to Program Board',
        comments: 'Concept documentation and similarity checks completed. Transmitted for statutory evaluation.'
      };

      if (exists) {
        return prev.map((init) => {
          if (init.id !== id) return init;
          updatedTitle = init.title;
          return {
            ...init,
            ...(conceptData || {}),
            stage: 'Stage 1: Concept Evaluation',
            stageCode: 1,
            status: 'Submitted to Board',
            dateSubmitted: timestamp,
            lastUpdated: timestamp,
            transitions: [...(init.transitions || []), newTransition]
          };
        });
      } else if (conceptData) {
        updatedTitle = conceptData.title;
        const newInitiative: Initiative = {
          ...conceptData,
          id,
          stage: 'Stage 1: Concept Evaluation',
          stageCode: 1,
          status: 'Submitted to Board',
          dateSubmitted: timestamp,
          lastUpdated: timestamp,
          transitions: [...(conceptData.transitions || []), newTransition]
        };
        return [newInitiative, ...prev];
      }

      return prev;
    });

    // Audit Log
    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Workflow',
      entityId: id,
      entityTitle: updatedTitle,
      action: 'Submitted to Program Board',
      user: currentUser.name,
      userRole: currentUser.role,
      comment: 'Stage 0 Concept submitted for Stage 1 Board Evaluation.'
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    // Task for Board
    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: `Board Evaluation: ${updatedTitle || 'Concept Proposal'}`,
      initiativeId: id,
      initiativeTitle: updatedTitle || 'Concept Proposal',
      stage: 'Stage 1: Concept Evaluation',
      assignedToRole: 'Programme Board Member',
      assignedToName: 'Prof. Fatima Al-Mansoor',
      assignedBy: currentUser.name,
      dueDate: '2026-10-10',
      priority: 'High',
      status: 'Pending',
      actionType: 'Board Evaluation'
    };
    setTasks((prev) => [newTask, ...prev]);

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Concept Submitted to Board',
      message: `"${updatedTitle || 'Concept'}" was formally submitted to the Programme Board for evaluation.`,
      timestamp,
      read: false,
      priority: 'warning',
      relatedId: id,
      stage: 'Stage 1: Concept Evaluation'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 3. Withdraw Draft back to editing
  const withdrawConceptDraft = (id: string) => {
    const timestamp = new Date().toISOString();
    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id) return init;
        const newTransition: WorkflowTransition = {
          id: `trans-${Date.now()}`,
          initiativeId: id,
          fromStage: init.stage,
          toStage: 'Stage 0: Concept Development',
          fromStatus: init.status,
          toStatus: 'Draft',
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp,
          decision: 'Draft Withdrawn by Owner',
          comments: 'Withdrawn from Board queue for additional internal refinement.'
        };
        return {
          ...init,
          stage: 'Stage 0: Concept Development',
          stageCode: 0,
          status: 'Draft',
          lastUpdated: timestamp,
          transitions: [...init.transitions, newTransition]
        };
      })
    );
  };

  // 4. Duplicate Concept
  const duplicateConcept = (id: string) => {
    const original = initiatives.find((i) => i.id === id);
    if (!original) return;

    const newId = `init-${Date.now()}`;
    const newCode = `CON-2026-${String(initiatives.length + 1).padStart(3, '0')}`;
    const newTitle = `Copy of ${original.title}`;

    const cloned: Initiative = {
      ...original,
      id: newId,
      code: newCode,
      title: newTitle,
      stage: 'Stage 0: Concept Development',
      stageCode: 0,
      status: 'Draft',
      dateSubmitted: '',
      lastUpdated: new Date().toISOString(),
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      transitions: [
        {
          id: `trans-${Date.now()}`,
          initiativeId: newId,
          fromStage: 'Stage 0: Concept Development',
          toStage: 'Stage 0: Concept Development',
          fromStatus: 'Draft',
          toStatus: 'Draft',
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp: new Date().toISOString(),
          decision: 'Concept Duplicated as New Draft',
          comments: `Cloned from source template ${original.code}.`
        }
      ]
    };

    setInitiatives((prev) => [cloned, ...prev]);

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entityType: 'Concept',
      entityId: newId,
      entityTitle: newTitle,
      action: 'Concept Duplicated',
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Duplicated from ${original.code}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 5. Delete Draft
  const deleteConcept = (id: string) => {
    setInitiatives((prev) => prev.filter((i) => i.id !== id));
  };

  // 6. Record Program Board Evaluation Decision (Stage 1)
  const recordBoardEvaluationDecision = (id: string, decision: EvaluationDecision) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id) return init;
        updatedTitle = init.title;

        let toStage = init.stage;
        let toStageCode = init.stageCode;
        let toStatus = init.status;

        switch (decision.decisionType) {
          case 'Proceed to full project development':
            toStage = 'Stage 2: Project Development';
            toStageCode = 2;
            toStatus = 'Approved for Development';
            break;
          case 'Return for clarification':
            toStage = 'Stage 1: Concept Evaluation';
            toStageCode = 1;
            toStatus = 'Returned for Clarification';
            break;
          case 'Merge with existing initiative':
            toStage = 'Stage 1: Concept Evaluation';
            toStageCode = 1;
            toStatus = 'On Hold';
            break;
          case 'Put on hold':
            toStage = 'Stage 1: Concept Evaluation';
            toStageCode = 1;
            toStatus = 'On Hold';
            break;
          case 'Reject':
            toStage = 'Stage 1: Concept Evaluation';
            toStageCode = 1;
            toStatus = 'Rejected';
            break;
        }

        const newTransition: WorkflowTransition = {
          id: `trans-${Date.now()}`,
          initiativeId: id,
          fromStage: init.stage,
          toStage,
          fromStatus: init.status,
          toStatus,
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp,
          decision: decision.decisionType,
          comments: decision.collectiveBoardComment,
          deadline: decision.dueDate
        };

        return {
          ...init,
          stage: toStage,
          stageCode: toStageCode,
          status: toStatus,
          lastUpdated: timestamp,
          evaluationDecision: decision,
          transitions: [...init.transitions, newTransition]
        };
      })
    );

    // Audit Log
    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Workflow',
      entityId: id,
      entityTitle: updatedTitle,
      action: `Board Decision: ${decision.decisionType}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: decision.collectiveBoardComment
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    // Create Tasks / Notifications per decision
    if (decision.decisionType === 'Proceed to full project development') {
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}`,
        title: `Develop Full Project Proposal: ${updatedTitle}`,
        initiativeId: id,
        initiativeTitle: updatedTitle,
        stage: 'Stage 2: Project Development',
        assignedToRole: 'Concept Owner / Project Manager',
        assignedToName: selectedInitiative?.ownerName || 'Jean-Luc Nkurunziza',
        assignedBy: currentUser.name,
        dueDate: '2026-11-15',
        priority: 'High',
        status: 'Pending',
        actionType: 'Clarify Concept'
      };
      setTasks((prev) => [newTask, ...prev]);

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Concept Endorsed for Project Development',
        message: `"${updatedTitle}" was approved by the Board to proceed to Stage 2 Project Development.`,
        timestamp,
        read: false,
        priority: 'success',
        relatedId: id,
        stage: 'Stage 2: Project Development'
      };
      setNotifications((prev) => [notif, ...prev]);
    } else if (decision.decisionType === 'Return for clarification') {
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}`,
        title: `Address Clarification Request: ${updatedTitle}`,
        initiativeId: id,
        initiativeTitle: updatedTitle,
        stage: 'Stage 1: Concept Evaluation',
        assignedToRole: 'Concept Owner / Project Manager',
        assignedToName: decision.assignedPerson || 'Concept Owner',
        assignedBy: currentUser.name,
        dueDate: decision.dueDate || '2026-10-15',
        priority: 'Critical',
        status: 'Pending',
        actionType: 'Clarify Concept'
      };
      setTasks((prev) => [newTask, ...prev]);

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Concept Returned for Clarification',
        message: `Board requested clarifications for "${updatedTitle}". Due date: ${decision.dueDate}.`,
        timestamp,
        read: false,
        priority: 'warning',
        relatedId: id,
        stage: 'Stage 1: Concept Evaluation'
      };
      setNotifications((prev) => [notif, ...prev]);
    } else {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Board Evaluation Decision: ${decision.decisionType}`,
        message: `Board recorded decision "${decision.decisionType}" on initiative "${updatedTitle}".`,
        timestamp,
        read: false,
        priority: decision.decisionType === 'Reject' ? 'urgent' : 'info',
        relatedId: id,
        stage: 'Stage 1: Concept Evaluation'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // 7. Save Project Development (Stage 2)
  const saveProjectDevelopment = (id: string, projectData: Partial<Initiative>) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id) return init;
        updatedTitle = projectData.title || init.title;

        // Calculate rolled-up budget if outcomes are present
        const outcomes = projectData.outcomes || init.outcomes || [];
        const totalBudget = outcomes.reduce(
          (sum, o) =>
            sum +
            (o.outputs?.reduce(
              (s, op) =>
                s +
                (op.activities?.reduce(
                  (actSum, a) => actSum + (Number(a.cost) || 0),
                  0
                ) || 0),
              0
            ) || 0),
          0
        );

        return {
          ...init,
          ...projectData,
          totalCalculatedBudget:
            totalBudget > 0
              ? totalBudget
              : projectData.totalCalculatedBudget ?? init.totalCalculatedBudget,
          lastUpdated: timestamp
        };
      })
    );

    // Audit Event
    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Project',
      entityId: id,
      entityTitle: updatedTitle,
      action: 'Project Development Draft Saved',
      user: currentUser.name,
      userRole: currentUser.role,
      comment:
        'Stage 2 Project Development details, strategic alignment, TOC, risks, and results framework saved.'
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 8. Submit Project for Technical & Board Appraisal (Stage 3)
  const submitProjectForAppraisal = (id: string, appraisalComments?: string) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id) return init;
        updatedTitle = init.title;

        const newTransition: WorkflowTransition = {
          id: `trans-${Date.now()}`,
          initiativeId: id,
          fromStage: 'Stage 2: Project Development',
          toStage: 'Stage 3: Project Appraisal',
          fromStatus: init.status,
          toStatus: 'Submitted for Appraisal',
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp,
          decision: 'Submitted for Technical & Board Appraisal',
          comments:
            appraisalComments ||
            'Detailed Stage 2 Project Proposal, Results Framework, and activity budget finalized and transmitted for formal appraisal.'
        };

        return {
          ...init,
          stage: 'Stage 3: Project Appraisal',
          stageCode: 3,
          status: 'Submitted for Appraisal',
          lastUpdated: timestamp,
          transitions: [...init.transitions, newTransition]
        };
      })
    );

    // Audit Log
    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Workflow',
      entityId: id,
      entityTitle: updatedTitle,
      action: 'Submitted for Project Appraisal',
      user: currentUser.name,
      userRole: currentUser.role,
      comment:
        appraisalComments ||
        'Stage 2 Project Development completed and transmitted for Stage 3 Appraisal.'
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    // Task for Board Appraisal
    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: `Appraise Project Proposal: ${updatedTitle}`,
      initiativeId: id,
      initiativeTitle: updatedTitle,
      stage: 'Stage 3: Project Appraisal',
      assignedToRole: 'Programme Board Member',
      assignedToName: 'Prof. Fatima Al-Mansoor',
      assignedBy: currentUser.name,
      dueDate: '2026-10-25',
      priority: 'High',
      status: 'Pending',
      actionType: 'Appraise Project'
    };
    setTasks((prev) => [newTask, ...prev]);

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Project Submitted for Appraisal',
      message: `"${updatedTitle}" completed Stage 2 Development and is ready for Stage 3 Appraisal review.`,
      timestamp,
      read: false,
      priority: 'warning',
      relatedId: id,
      stage: 'Stage 3: Project Appraisal'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 9. Stage 3: Save Board Appraisal Draft / Scoring Updates
  const saveBoardAppraisal = (id: string, appraisal: Partial<BoardAppraisal>) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id) return init;
        updatedTitle = init.title;

        const currentAppraisal = init.boardAppraisal || {
          appraisalId: `APP-2026-${String(Math.floor(100 + Math.random() * 900))}`,
          submittedDate: timestamp,
          ratings: [],
          overallComment: '',
          evidenceAdvice: '',
          conditions: [],
          requiredRevisions: [],
          recommendation: 'Recommended for Approval',
          appraisedByBoard: [currentUser.name]
        };

        const updatedAppraisal: BoardAppraisal = {
          ...currentAppraisal,
          ...appraisal,
          appraisedByBoard: Array.from(
            new Set([...(currentAppraisal.appraisedByBoard || []), currentUser.name])
          )
        };

        return {
          ...init,
          boardAppraisal: updatedAppraisal,
          status: init.status === 'Submitted for Appraisal' ? 'Appraisal in Progress' : init.status,
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Appraisal',
      entityId: id,
      entityTitle: updatedTitle,
      action: 'Board Appraisal Draft Updated',
      user: currentUser.name,
      userRole: currentUser.role,
      comment: 'Appraisal scorecards, advisory notes, or conditions updated by Programme Board.'
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 10. Record Single Appraisal Rating
  const recordAppraisalRating = (id: string, rating: AppraisalRating) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id) return init;
        updatedTitle = init.title;

        const currentAppraisal = init.boardAppraisal || {
          appraisalId: `APP-2026-${String(Math.floor(100 + Math.random() * 900))}`,
          submittedDate: timestamp,
          ratings: [],
          overallComment: '',
          evidenceAdvice: '',
          conditions: [],
          requiredRevisions: [],
          recommendation: 'Recommended for Approval',
          appraisedByBoard: [currentUser.name]
        };

        const existingIndex = currentAppraisal.ratings.findIndex(
          (r) => r.criteriaId === rating.criteriaId
        );
        let newRatings: AppraisalRating[];
        if (existingIndex >= 0) {
          newRatings = [...currentAppraisal.ratings];
          newRatings[existingIndex] = rating;
        } else {
          newRatings = [...currentAppraisal.ratings, rating];
        }

        return {
          ...init,
          boardAppraisal: {
            ...currentAppraisal,
            ratings: newRatings
          },
          status: init.status === 'Submitted for Appraisal' ? 'Appraisal in Progress' : init.status,
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Appraisal',
      entityId: id,
      entityTitle: updatedTitle,
      action: `Appraisal Criterion Scored: ${rating.criteriaName}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Rating: ${rating.rating} (${rating.score || 0}/${rating.maxScore || 20} pts). Evidence: "${rating.evidence}"`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 11. Submit Formal Board Appraisal Decision
  const submitBoardAppraisalDecision = (
    id: string,
    recommendation: BoardAppraisal['recommendation'],
    overallComment: string,
    evidenceAdvice: string,
    conditions: string[],
    requiredRevisions: string[]
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';
    let ownerName = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id) return init;
        updatedTitle = init.title;
        ownerName = init.ownerName;

        let toStage = init.stage;
        let toStageCode = init.stageCode;
        let toStatus = init.status;

        switch (recommendation) {
          case 'Recommended for Approval':
            toStage = 'Stage 4: Project Approval';
            toStageCode = 4;
            toStatus = 'Awaiting CEO Decision';
            break;
          case 'Recommended with Conditions':
            toStage = 'Stage 4: Project Approval';
            toStageCode = 4;
            toStatus = 'Recommended with Conditions';
            break;
          case 'Deferred for Revision':
            toStage = 'Stage 2: Project Development';
            toStageCode = 2;
            toStatus = 'Deferred for Revision';
            break;
          case 'Not Recommended':
            toStage = 'Stage 3: Project Appraisal';
            toStageCode = 3;
            toStatus = 'Rejected';
            break;
        }

        const newTransition: WorkflowTransition = {
          id: `trans-${Date.now()}`,
          initiativeId: id,
          fromStage: init.stage,
          toStage,
          fromStatus: init.status,
          toStatus,
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp,
          decision: `Board Appraisal: ${recommendation}`,
          comments: overallComment,
          conditions: conditions.length > 0 ? conditions : undefined
        };

        const existingAppraisal: BoardAppraisal = init.boardAppraisal || {
          appraisalId: `APP-2026-${String(Math.floor(100 + Math.random() * 900))}`,
          submittedDate: timestamp,
          ratings: [],
          overallComment: '',
          evidenceAdvice: '',
          conditions: [],
          requiredRevisions: [],
          recommendation: 'Recommended for Approval',
          appraisedByBoard: []
        };

        const updatedAppraisal: BoardAppraisal = {
          ...existingAppraisal,
          recommendation,
          overallComment,
          evidenceAdvice,
          conditions,
          requiredRevisions,
          completedDate: timestamp,
          appraisedByBoard: Array.from(
            new Set([...(existingAppraisal.appraisedByBoard || []), currentUser.name])
          )
        };

        return {
          ...init,
          stage: toStage,
          stageCode: toStageCode,
          status: toStatus,
          lastUpdated: timestamp,
          boardAppraisal: updatedAppraisal,
          transitions: [...init.transitions, newTransition]
        };
      })
    );

    // Audit Event
    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Appraisal',
      entityId: id,
      entityTitle: updatedTitle,
      action: `Board Appraisal Decision: ${recommendation}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: overallComment
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    // Tasks & Notifications based on decision
    if (
      recommendation === 'Recommended for Approval' ||
      recommendation === 'Recommended with Conditions'
    ) {
      // Task for CEO
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}`,
        title: `CEO Executive Approval: ${updatedTitle}`,
        initiativeId: id,
        initiativeTitle: updatedTitle,
        stage: 'Stage 4: Project Approval',
        assignedToRole: 'CEO',
        assignedToName: 'Mrs. Nardos Bekele-Thomas',
        assignedBy: currentUser.name,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Pending',
        actionType: 'CEO Decision'
      };
      setTasks((prev) => [newTask, ...prev]);

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Appraisal Endorsed: Transmitted to CEO`,
        message: `Board appraised "${updatedTitle}" (${recommendation}) and transmitted the dossier to the CEO for executive sanction.`,
        timestamp,
        read: false,
        priority: 'success',
        relatedId: id,
        stage: 'Stage 4: Project Approval'
      };
      setNotifications((prev) => [notif, ...prev]);
    } else if (recommendation === 'Deferred for Revision') {
      // Task for Project Manager
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}`,
        title: `Address Board Appraisal Revisions: ${updatedTitle}`,
        initiativeId: id,
        initiativeTitle: updatedTitle,
        stage: 'Stage 2: Project Development',
        assignedToRole: 'Concept Owner / Project Manager',
        assignedToName: ownerName || 'Project Manager',
        assignedBy: currentUser.name,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        priority: 'Critical',
        status: 'Pending',
        actionType: 'Clarify Concept'
      };
      setTasks((prev) => [newTask, ...prev]);

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Project Deferred for Revision by Board`,
        message: `Board deferred "${updatedTitle}" back to Stage 2 with required revisions.`,
        timestamp,
        read: false,
        priority: 'warning',
        relatedId: id,
        stage: 'Stage 2: Project Development'
      };
      setNotifications((prev) => [notif, ...prev]);
    } else {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Project Appraisal Rejected by Board`,
        message: `Board determined "${updatedTitle}" does not meet appraisal criteria.`,
        timestamp,
        read: false,
        priority: 'urgent',
        relatedId: id,
        stage: 'Stage 3: Project Appraisal'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // 12. Record Formal CEO Approval Decision
  const recordCeoDecision = (
    id: string,
    decision: 'Formally Approved' | 'Conditionally Approved' | 'Returned for Revision',
    guidanceText: string,
    conditions?: {
      condition: string;
      responsiblePerson: string;
      dueDate: string;
      status: 'Pending' | 'Complied' | 'Waived';
    }[],
    resubmissionDeadline?: string,
    customRefNumber?: string
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';
    let ownerName = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id) return init;
        updatedTitle = init.title;
        ownerName = init.ownerName;

        let toStage = init.stage;
        let toStageCode = init.stageCode;
        let toStatus = init.status;

        const refNumber =
          customRefNumber ||
          `AUDA-CEO-DIR-2026-${String(Math.floor(100 + Math.random() * 900))}`;

        if (decision === 'Formally Approved') {
          toStage = 'Stage 5: Contracting';
          toStageCode = 5;
          toStatus = 'Approved';
        } else if (decision === 'Conditionally Approved') {
          toStage = 'Stage 5: Contracting';
          toStageCode = 5;
          toStatus = 'Conditionally Approved';
        } else if (decision === 'Returned for Revision') {
          toStage = 'Stage 2: Project Development';
          toStageCode = 2;
          toStatus = 'Returned by CEO';
        }

        const newTransition: WorkflowTransition = {
          id: `trans-${Date.now()}`,
          initiativeId: id,
          fromStage: init.stage,
          toStage,
          fromStatus: init.status,
          toStatus,
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp,
          decision: `CEO Decision: ${decision}`,
          comments: guidanceText,
          conditions: conditions?.map((c) => c.condition),
          deadline: resubmissionDeadline
        };

        const ceoApprovalData = {
          referenceNumber: refNumber,
          decisionDate: timestamp,
          decision,
          ceoName: currentUser.name,
          guidanceText,
          conditions: conditions || [],
          resubmissionDeadline
        };

        return {
          ...init,
          stage: toStage,
          stageCode: toStageCode,
          status: toStatus,
          lastUpdated: timestamp,
          ceoApproval: ceoApprovalData,
          transitions: [...init.transitions, newTransition]
        };
      })
    );

    // Audit Event
    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'CEO Approval',
      entityId: id,
      entityTitle: updatedTitle,
      action: `CEO Executive Action: ${decision}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: guidanceText
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    // Tasks & Notifications
    if (decision === 'Formally Approved' || decision === 'Conditionally Approved') {
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}`,
        title: `Draft Financing Agreement & Initiate Partner Contracting: ${updatedTitle}`,
        initiativeId: id,
        initiativeTitle: updatedTitle,
        stage: 'Stage 5: Contracting',
        assignedToRole: 'Contracting Officer',
        assignedToName: 'Elena Kouame',
        assignedBy: currentUser.name,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Pending',
        actionType: 'Contracting Action'
      };
      setTasks((prev) => [newTask, ...prev]);

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `CEO Executive Approval Granted!`,
        message: `H.E. CEO sanctioned "${updatedTitle}" (${decision}). Handed over to Contracting & Legal.`,
        timestamp,
        read: false,
        priority: 'success',
        relatedId: id,
        stage: 'Stage 5: Contracting'
      };
      setNotifications((prev) => [notif, ...prev]);
    } else {
      // Returned by CEO
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}`,
        title: `Address CEO Directives & Resubmit Dossier: ${updatedTitle}`,
        initiativeId: id,
        initiativeTitle: updatedTitle,
        stage: 'Stage 2: Project Development',
        assignedToRole: 'Concept Owner / Project Manager',
        assignedToName: ownerName || 'Project Manager',
        assignedBy: currentUser.name,
        dueDate: resubmissionDeadline || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        priority: 'Critical',
        status: 'Pending',
        actionType: 'Clarify Concept'
      };
      setTasks((prev) => [newTask, ...prev]);

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Proposal Returned by CEO`,
        message: `CEO returned "${updatedTitle}" with executive guidance. Resubmission deadline: ${resubmissionDeadline || 'Immediate'}.`,
        timestamp,
        read: false,
        priority: 'urgent',
        relatedId: id,
        stage: 'Stage 2: Project Development'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // 13. Update CEO Pre-condition Status (Pre-condition compliance tracking)
  const updateCeoConditionStatus = (
    id: string,
    conditionIndex: number,
    status: 'Pending' | 'Complied' | 'Waived',
    notes?: string
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';
    let conditionText = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== id || !init.ceoApproval || !init.ceoApproval.conditions) return init;
        updatedTitle = init.title;

        const currentConditions = [...init.ceoApproval.conditions];
        if (!currentConditions[conditionIndex]) return init;

        conditionText = currentConditions[conditionIndex].condition;
        currentConditions[conditionIndex] = {
          ...currentConditions[conditionIndex],
          status
        };

        return {
          ...init,
          ceoApproval: {
            ...init.ceoApproval,
            conditions: currentConditions
          },
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'CEO Approval',
      entityId: id,
      entityTitle: updatedTitle,
      action: `CEO Pre-Condition Marked ${status}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Condition: "${conditionText}". Status updated to ${status}. ${notes || ''}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 14. Stage 5: Save or Update Financing Agreement
  const saveFinancingAgreement = (initiativeId: string, agreement: Partial<FinancingAgreement>) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const currentFa: FinancingAgreement = init.financingAgreement || {
          id: `fa-${Date.now()}`,
          reference: `FA-AUDA-${Date.now().toString().slice(-4)}`,
          instrument: 'Non-reimbursable grant',
          grantAmount: init.totalCalculatedBudget || init.estimatedCost,
          currency: init.currency || 'USD',
          procurementStandard: 'Joint Harmonized Standards',
          auditCadence: 'Annually',
          reportingCadence: 'Quarterly',
          counterpartFunding: 0,
          agreementDate: timestamp.split('T')[0],
          startDate: timestamp.split('T')[0],
          endDate: '2030-12-31',
          implementingPartner: init.possibleFundingPartners?.[0] || 'Strategic Partner',
          focalPerson: currentUser.name,
          conditions: '',
          tranches: []
        };

        const updatedFa: FinancingAgreement = {
          ...currentFa,
          ...agreement
        };

        return {
          ...init,
          financingAgreement: updatedFa,
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Contracting',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: 'Financing Agreement Updated',
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Financing parameters updated by ${currentUser.name} (${currentUser.role}).`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 15. Stage 5: Add Disbursement Tranche
  const addDisbursementTranche = (initiativeId: string, tranche: Omit<DisbursementTranche, 'id'>) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const currentFa = init.financingAgreement || {
          id: `fa-${Date.now()}`,
          reference: `FA-AUDA-${Date.now().toString().slice(-4)}`,
          instrument: 'Non-reimbursable grant',
          grantAmount: init.totalCalculatedBudget || init.estimatedCost,
          currency: init.currency || 'USD',
          procurementStandard: 'Joint Harmonized Standards',
          auditCadence: 'Annually',
          reportingCadence: 'Quarterly',
          counterpartFunding: 0,
          agreementDate: timestamp.split('T')[0],
          startDate: timestamp.split('T')[0],
          endDate: '2030-12-31',
          implementingPartner: init.possibleFundingPartners?.[0] || 'Strategic Partner',
          focalPerson: currentUser.name,
          conditions: '',
          tranches: []
        };

        const newTrancheItem: DisbursementTranche = {
          ...tranche,
          id: `tr-${Date.now()}`
        };

        return {
          ...init,
          financingAgreement: {
            ...currentFa,
            tranches: [...(currentFa.tranches || []), newTrancheItem]
          },
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Contracting',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `Tranche Added: Tranche ${tranche.trancheNumber}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Added tranche "${tranche.trancheName}" for ${tranche.amount} (${tranche.percentage}%). Precondition: ${tranche.preconditionMilestone}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 16. Stage 5: Update Disbursement Tranche Status
  const updateTrancheStatus = (
    initiativeId: string,
    trancheId: string,
    status: DisbursementTranche['status'],
    notes?: string,
    actualDate?: string
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';
    let trancheNum = 1;

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId || !init.financingAgreement) return init;
        updatedTitle = init.title;

        const updatedTranches = (init.financingAgreement.tranches || []).map((tr) => {
          if (tr.id !== trancheId) return tr;
          trancheNum = tr.trancheNumber;
          return {
            ...tr,
            status,
            notes: notes !== undefined ? notes : tr.notes,
            actualDisbursementDate:
              status === 'Disbursed'
                ? actualDate || timestamp.split('T')[0]
                : tr.actualDisbursementDate
          };
        });

        return {
          ...init,
          financingAgreement: {
            ...init.financingAgreement,
            tranches: updatedTranches
          },
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Contracting',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `Disbursement Tranche ${trancheNum} Marked ${status}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: notes || `Tranche status changed to ${status}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    if (status === 'Disbursed') {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Tranche ${trancheNum} Disbursed`,
        message: `Disbursement tranche ${trancheNum} for "${updatedTitle}" was successfully cleared and disbursed.`,
        timestamp,
        read: false,
        priority: 'success',
        relatedId: initiativeId,
        stage: 'Stage 5: Contracting'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // 17. Stage 5: Add Negotiation Record
  const addNegotiationRecord = (
    initiativeId: string,
    negotiation: Omit<NegotiationRecord, 'id'>
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const newNeg: NegotiationRecord = {
          ...negotiation,
          id: `neg-${Date.now()}`
        };

        return {
          ...init,
          negotiations: [...(init.negotiations || []), newNeg],
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Contracting',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `Partner Negotiation Logged: ${negotiation.partner}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Topic: "${negotiation.topic}". Summary: ${negotiation.summary}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 18. Stage 5: Update Negotiation Status
  const updateNegotiationStatus = (
    initiativeId: string,
    negotiationId: string,
    status: NegotiationRecord['status']
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const updatedNegs = (init.negotiations || []).map((neg) =>
          neg.id === negotiationId ? { ...neg, status } : neg
        );

        return {
          ...init,
          negotiations: updatedNegs,
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Contracting',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `Negotiation Session Status: ${status}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Negotiation item ${negotiationId} updated to ${status}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 19. Stage 5: Add MoU Item
  const addMoUItem = (initiativeId: string, mou: Omit<MoUItem, 'id'>) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const newMou: MoUItem = {
          ...mou,
          id: `mou-${Date.now()}`
        };

        return {
          ...init,
          mous: [...(init.mous || []), newMou],
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Contracting',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `MoU Registered: ${mou.referenceNumber}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Partner: ${mou.partner}. Title: "${mou.title}". Status: ${mou.status}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 20. Stage 5: Update MoU Status
  const updateMoUStatus = (initiativeId: string, mouId: string, status: MoUItem['status']) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const updatedMous = (init.mous || []).map((mou) =>
          mou.id === mouId ? { ...mou, status } : mou
        );

        return {
          ...init,
          mous: updatedMous,
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Contracting',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `MoU Status Updated: ${status}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `MoU item ${mouId} updated to ${status}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // 21. Stage 5: Finalize Financing & Transition to Active Implementation
  const finalizeFinancing = (initiativeId: string, notes?: string) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const newTransition: WorkflowTransition = {
          id: `trans-${Date.now()}`,
          initiativeId,
          fromStage: 'Stage 5: Contracting',
          toStage: 'Stage 5: Contracting',
          fromStatus: init.status,
          toStatus: 'Financing Finalized',
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp,
          decision: 'Financing Finalized & Execution Authorized',
          comments: notes || 'Master financing agreement fully ratified; legal instruments executed.'
        };

        return {
          ...init,
          status: 'Financing Finalized',
          lastUpdated: timestamp,
          transitions: [...init.transitions, newTransition]
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Contracting',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: 'Financing Finalized & Sealed',
      user: currentUser.name,
      userRole: currentUser.role,
      comment: notes || 'All financing covenants satisfied and partner agreements executed.'
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Financing Finalized',
      message: `"${updatedTitle}" successfully concluded contracting. Financing finalized for active rollout.`,
      timestamp,
      read: false,
      priority: 'success',
      relatedId: initiativeId,
      stage: 'Stage 5: Contracting'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 22. Stage 6: Create Amendment Request
  const createAmendmentRequest = (
    initiativeId: string,
    amendment: Omit<AmendmentItem, 'id' | 'amendmentId' | 'dateRequested' | 'approvalStatus'>
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    const newAmendItem: AmendmentItem = {
      ...amendment,
      id: `amd-${Date.now()}`,
      amendmentId: `AMD-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      dateRequested: timestamp,
      approvalStatus: 'Pending Review'
    };

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const newTransition: WorkflowTransition = {
          id: `trans-${Date.now()}`,
          initiativeId,
          fromStage: init.stage,
          toStage: 'Stage 6: Amendment and Change Control',
          fromStatus: init.status,
          toStatus: 'On Hold',
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp,
          decision: `Amendment Request Initiated: ${amendment.changeType} Change`,
          comments: `Amendment ${newAmendItem.amendmentId} submitted for formal review. Reason: ${amendment.reason}`
        };

        return {
          ...init,
          stage: 'Stage 6: Amendment and Change Control',
          stageCode: 6,
          status: 'On Hold',
          lastUpdated: timestamp,
          amendments: [...(init.amendments || []), newAmendItem],
          transitions: [...init.transitions, newTransition]
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Amendment',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `Amendment Request Filed (${amendment.changeType})`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Version ${amendment.versionNumber}: ${amendment.description}. Reason: ${amendment.reason}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    // Create task for CEO to review amendment
    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: `Review Amendment Request: ${updatedTitle} (${amendment.changeType})`,
      initiativeId,
      initiativeTitle: updatedTitle,
      stage: 'Stage 6: Amendment and Change Control',
      assignedToRole: 'CEO',
      assignedToName: 'Mrs. Nardos Bekele-Thomas',
      assignedBy: currentUser.name,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 'High',
      status: 'Pending',
      actionType: 'Review Amendment'
    };
    setTasks((prev) => [newTask, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Amendment Request Submitted',
      message: `Amendment ${newAmendItem.amendmentId} (${amendment.changeType}) submitted for "${updatedTitle}".`,
      timestamp,
      read: false,
      priority: 'warning',
      relatedId: initiativeId,
      stage: 'Stage 6: Amendment and Change Control'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 23. Stage 6: Review Amendment Decision (Endorsed / Approved by CEO / Rejected)
  const reviewAmendmentDecision = (
    initiativeId: string,
    amendmentId: string,
    decision: 'Endorsed' | 'Approved by CEO' | 'Rejected',
    comments?: string
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';
    let amendRef = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        let targetAmend: AmendmentItem | undefined;
        const updatedAmends = (init.amendments || []).map((amd) => {
          if (amd.id === amendmentId || amd.amendmentId === amendmentId) {
            targetAmend = amd;
            amendRef = amd.amendmentId;
            return {
              ...amd,
              approvalStatus: decision
            };
          }
          return amd;
        });

        let nextStatus = init.status;
        let nextStage = init.stage;
        let nextStageCode = init.stageCode;

        if (decision === 'Approved by CEO') {
          // If approved, return to Active or Contracting
          nextStatus = init.financingAgreement ? 'Active / Implementation' : 'Approved';
          nextStage = init.financingAgreement ? 'Stage 5: Contracting' : 'Stage 4: Project Approval';
          nextStageCode = init.financingAgreement ? 5 : 4;
        } else if (decision === 'Rejected') {
          nextStatus = init.financingAgreement ? 'Under Contracting' : 'Approved';
        }

        const newTransition: WorkflowTransition = {
          id: `trans-${Date.now()}`,
          initiativeId,
          fromStage: 'Stage 6: Amendment and Change Control',
          toStage: nextStage,
          fromStatus: init.status,
          toStatus: nextStatus,
          performedBy: currentUser.name,
          performerRole: currentUser.role,
          timestamp,
          decision: `Amendment Decision: ${decision}`,
          comments: comments || `Amendment ${amendRef} marked as ${decision} by ${currentUser.name}.`
        };

        // If change involves budget and approved by CEO, update estimated cost
        let updatedCost = init.estimatedCost;
        if (decision === 'Approved by CEO' && targetAmend && targetAmend.changeType === 'Budget' && targetAmend.proposedValue) {
          const parsed = parseFloat(targetAmend.proposedValue.replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed) && parsed > 0) {
            updatedCost = parsed;
          }
        }

        return {
          ...init,
          stage: nextStage,
          stageCode: nextStageCode,
          status: nextStatus,
          estimatedCost: updatedCost,
          lastUpdated: timestamp,
          amendments: updatedAmends,
          transitions: [...init.transitions, newTransition]
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Amendment',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `Amendment ${decision}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: comments || `Amendment ${amendRef} reviewed with decision "${decision}".`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Amendment ${decision}`,
      message: `Amendment ${amendRef} for "${updatedTitle}" was ${decision.toLowerCase()}.`,
      timestamp,
      read: false,
      priority: decision === 'Approved by CEO' ? 'success' : decision === 'Rejected' ? 'urgent' : 'info',
      relatedId: initiativeId,
      stage: 'Stage 6: Amendment and Change Control'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 24. Portfolio Risk Matrix: Add Risk to Initiative
  const addRiskToInitiative = (
    initiativeId: string,
    risk: Omit<RiskItem, 'id'>
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';

    const newRiskItem: RiskItem = {
      ...risk,
      id: `rsk-${Date.now()}`
    };

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        return {
          ...init,
          risks: [...(init.risks || []), newRiskItem],
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Project',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `Risk Registered: [${risk.riskId}] ${risk.category}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `New ${risk.severity} severity risk registered: "${risk.description}"`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Risk Registered on ${updatedTitle}`,
      message: `Risk [${risk.riskId}] (${risk.severity} Severity) was added to the institutional risk register.`,
      timestamp,
      read: false,
      priority: risk.severity === 'High' ? 'urgent' : 'info',
      relatedId: initiativeId
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 25. Portfolio Risk Matrix: Update Risk Status
  const updateRiskStatus = (
    initiativeId: string,
    riskId: string,
    newStatus: 'Active' | 'Mitigated' | 'Closed',
    mitigationNote?: string
  ) => {
    const timestamp = new Date().toISOString();
    let updatedTitle = '';
    let targetRiskId = '';

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initiativeId) return init;
        updatedTitle = init.title;

        const updatedRisks = (init.risks || []).map((r) => {
          if (r.id === riskId || r.riskId === riskId) {
            targetRiskId = r.riskId;
            return {
              ...r,
              currentStatus: newStatus,
              mitigationMeasures: mitigationNote
                ? `${r.mitigationMeasures}\n[Update ${new Date().toISOString().split('T')[0]}]: ${mitigationNote}`
                : r.mitigationMeasures
            };
          }
          return r;
        });

        return {
          ...init,
          risks: updatedRisks,
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      entityType: 'Project',
      entityId: initiativeId,
      entityTitle: updatedTitle,
      action: `Risk Status Updated: [${targetRiskId || riskId}] to ${newStatus}`,
      user: currentUser.name,
      userRole: currentUser.role,
      comment: mitigationNote || `Risk status transitioned to ${newStatus}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const getAllowedPagesForRole = (role: UserRole): NavigationPage[] => {
    switch (role) {
      case 'System Administrator':
        return [
          'Dashboard',
          'Project Pipeline',
          'My Assignments',
          'Concepts',
          'Project Development',
          'Program Board Evaluation',
          'Project Appraisal',
          'CEO Approval',
          'Contracting',
          'Amendments',
          'Partners',
          'Programmes',
          'Risk Matrix',
          'Reports',
          'Executive Dashboard',
          'Documents',
          'Administration',
          'Audit Trail',
          'Settings'
        ];
      case 'Concept Owner / Project Manager':
        return [
          'Dashboard',
          'Project Pipeline',
          'My Assignments',
          'Concepts',
          'Project Development',
          'Amendments',
          'Partners',
          'Programmes',
          'Risk Matrix',
          'Reports',
          'Executive Dashboard',
          'Documents',
          'Settings'
        ];
      case 'Directorate Director':
        return [
          'Dashboard',
          'Project Pipeline',
          'My Assignments',
          'Concepts',
          'Project Development',
          'Program Board Evaluation',
          'Partners',
          'Programmes',
          'Risk Matrix',
          'Reports',
          'Executive Dashboard',
          'Documents',
          'Settings'
        ];
      case 'Programme Board Member':
        return [
          'Dashboard',
          'Project Pipeline',
          'My Assignments',
          'Program Board Evaluation',
          'Project Appraisal',
          'Partners',
          'Risk Matrix',
          'Reports',
          'Executive Dashboard',
          'Documents',
          'Settings'
        ];
      case 'CEO':
        return [
          'Dashboard',
          'Project Pipeline',
          'My Assignments',
          'CEO Approval',
          'Partners',
          'Risk Matrix',
          'Reports',
          'Executive Dashboard',
          'Documents',
          'Audit Trail',
          'Settings'
        ];
      case 'Contracting Officer':
        return [
          'Dashboard',
          'Project Pipeline',
          'My Assignments',
          'Contracting',
          'Partners',
          'Risk Matrix',
          'Reports',
          'Executive Dashboard',
          'Documents',
          'Settings'
        ];
      case 'Read-only Viewer':
      default:
        return [
          'Dashboard',
          'Project Pipeline',
          'Partners',
          'Risk Matrix',
          'Reports',
          'Executive Dashboard',
          'Documents',
          'Settings'
        ];
    }
  };

  const hasAccessToPage = (page: NavigationPage, role?: UserRole): boolean => {
    const targetRole = role || currentUser.role;
    const allowed = getAllowedPagesForRole(targetRole);
    return allowed.includes(page);
  };

  const resetFilters = () => {
    setDashboardFilters(initialFilters);
  };

  const resetToSampleData = () => {
    setInitiatives(MOCK_INITIATIVES);
    setPartners(INITIAL_DEVELOPMENT_PARTNERS);
    setTasks(MOCK_TASKS);
    setNotifications(MOCK_NOTIFICATIONS);
    setAuditLogs(MOCK_AUDIT_LOGS);
    setDashboardFilters(initialFilters);
  };

  // Partner CRUD Handlers
  const addPartner = (partnerData: Omit<DevelopmentPartner, 'id'>): DevelopmentPartner => {
    const newPartner: DevelopmentPartner = {
      ...partnerData,
      id: `part-${Date.now()}`,
      dateAdded: partnerData.dateAdded || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setPartners((prev) => [newPartner, ...prev]);

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entityType: 'Project',
      entityId: newPartner.id,
      entityTitle: newPartner.name,
      action: 'Created Development Partner',
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `New development partner "${newPartner.name}" added to Partner's Database.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return newPartner;
  };

  const updatePartner = (id: string, updates: Partial<DevelopmentPartner>) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let partnerName = '';
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        partnerName = updates.name || p.name;
        return {
          ...p,
          ...updates,
          lastUpdated: timestamp
        };
      })
    );

    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entityType: 'Project',
      entityId: id,
      entityTitle: partnerName,
      action: 'Updated Development Partner',
      user: currentUser.name,
      userRole: currentUser.role,
      comment: `Development partner "${partnerName}" record updated in Partner's Database.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const deletePartner = (id: string) => {
    const existing = partners.find((p) => p.id === id);
    setPartners((prev) => prev.filter((p) => p.id !== id));

    if (existing) {
      const newAudit: AuditEvent = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'Project',
        entityId: id,
        entityTitle: existing.name,
        action: 'Deleted Development Partner',
        user: currentUser.name,
        userRole: currentUser.role,
        comment: `Development partner "${existing.name}" removed from Partner's Database.`
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users: MOCK_USERS,
        initiatives,
        tasks,
        notifications,
        auditLogs,
        currentPage,
        setCurrentPage,
        selectedInitiative,
        setSelectedInitiativeId,
        dashboardFilters,
        setDashboardFilters,
        resetFilters,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        hasAccessToPage,
        getAllowedPagesForRole,
        resetToSampleData,
        saveConcept,
        submitConceptToBoard,
        withdrawConceptDraft,
        duplicateConcept,
        deleteConcept,
        recordBoardEvaluationDecision,
        saveProjectDevelopment,
        submitProjectForAppraisal,
        selectedProjectDevelopmentId,
        setSelectedProjectDevelopmentId,
        selectedAppraisalId,
        setSelectedAppraisalId,
        saveBoardAppraisal,
        recordAppraisalRating,
        submitBoardAppraisalDecision,
        selectedCeoApprovalId,
        setSelectedCeoApprovalId,
        recordCeoDecision,
        updateCeoConditionStatus,
        selectedContractingId,
        setSelectedContractingId,
        saveFinancingAgreement,
        addDisbursementTranche,
        updateTrancheStatus,
        addNegotiationRecord,
        updateNegotiationStatus,
        addMoUItem,
        updateMoUStatus,
        finalizeFinancing,
        selectedAmendmentInitiativeId,
        setSelectedAmendmentInitiativeId,
        createAmendmentRequest,
        reviewAmendmentDecision,
        addRiskToInitiative,
        updateRiskStatus,
        partners,
        addPartner,
        updatePartner,
        deletePartner
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
