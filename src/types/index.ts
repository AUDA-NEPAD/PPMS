export type UserRole =
  | 'System Administrator'
  | 'Concept Owner / Project Manager'
  | 'Directorate Director'
  | 'Programme Board Member'
  | 'CEO'
  | 'Contracting Officer'
  | 'Read-only Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  directorate: Directorate;
  avatar?: string;
  title?: string;
}

export type LifecycleStage =
  | 'Stage 0: Concept Development'
  | 'Stage 1: Concept Evaluation'
  | 'Stage 2: Project Development'
  | 'Stage 3: Project Appraisal'
  | 'Stage 4: Project Approval'
  | 'Stage 5: Contracting'
  | 'Stage 6: Amendment and Change Control';

export type StageCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Directorate =
  | 'Office of the CEO'
  | 'Strategic Planning, Resource Mobilization, M&E KM'
  | 'Agriculture, Food Security & Environmental Sustainability'
  | 'Economy, Infrastructure and Trade'
  | 'Human Capital and Institutional Development'
  | 'Operations'
  | 'Office of Science Technology and Innovation';

export type AfricanRegion =
  | 'West African Region'
  | 'East African Region'
  | 'Central African Region'
  | 'North African Region'
  | 'Southern African Region'
  | 'Continental';

export type StrategicResultArea =
  | 'SRA 1 – Infrastructure and Industrialisation'
  | 'SRA 2 – Agriculture, Food Systems, Resilient Environment and Blue Economy'
  | 'SRA 3 – Education, Skills and Entrepreneurship'
  | 'SRA 4 – Health and Wellbeing'
  | 'SRA 5 – Institutional Development and Public Sector Governance';

export type StrategicDeliveryPathway =
  | 'SDP 1 – Inclusive National and Regional Implementation'
  | 'SDP 2 – Harnessing Data and Knowledge'
  | 'SDP 3 – Blended and Self-Reliant Development Financing'
  | 'SDP 4 – Utilizing RECs Platforms'
  | 'SDP 5 – Utilizing Science, Technology and Innovation';

export type InitiativeStatus =
  | 'Draft'
  | 'Submitted to Board'
  | 'Returned for Clarification'
  | 'Approved for Development'
  | 'Under Development'
  | 'Submitted for Appraisal'
  | 'Appraisal in Progress'
  | 'Recommended for Approval'
  | 'Recommended with Conditions'
  | 'Deferred for Revision'
  | 'Awaiting CEO Decision'
  | 'Approved'
  | 'Conditionally Approved'
  | 'Returned by CEO'
  | 'Under Contracting'
  | 'Financing Finalized'
  | 'Active / Implementation'
  | 'On Hold'
  | 'Rejected'
  | 'Aborted';

export type ClassificationType = 'Programme' | 'Project';

export interface WorkflowTransition {
  id: string;
  initiativeId: string;
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  fromStatus: InitiativeStatus;
  toStatus: InitiativeStatus;
  performedBy: string;
  performerRole: UserRole;
  timestamp: string;
  decision: string;
  comments: string;
  attachments?: string[];
  conditions?: string[];
  deadline?: string;
}

export interface DocumentItem {
  id: string;
  initiativeId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  category: 'Concept Note' | 'Project Document' | 'Risk Matrix' | 'Appraisal Report' | 'CEO Directive' | 'MoU' | 'Financing Agreement' | 'Amendment Request';
  uploadedBy: string;
  uploadDate: string;
  description: string;
  version: string;
  confidentiality: 'Institutional Public' | 'Internal Restrictive' | 'Executive Confidential';
  downloadUrl?: string;
}

export interface Activity {
  id: string;
  activityNumber: string;
  description: string;
  leadPartner: string;
  target: string;
  startDate: string;
  endDate: string;
  timeline: string;
  cost: number;
  currency: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Deferred';
  notes?: string;
}

export interface Output {
  id: string;
  outputNumber: string;
  narrative: string;
  target: string;
  timeline: string;
  responsiblePerson: string;
  activities: Activity[];
}

export interface OutcomeIndicator {
  id: string;
  indicatorNumber: string;
  name: string;
  definition: string;
  baselineValue: string;
  baselineDate: string;
  targetValue: string;
  targetDate: string;
  unitOfMeasurement: string;
  dataSource: string;
  frequency: string;
  responsiblePerson: string;
}

export interface Outcome {
  id: string;
  outcomeNumber: string;
  narrative: string;
  assumptions: string;
  indicators: OutcomeIndicator[];
  outputs: Output[];
}

export interface RiskItem {
  id: string;
  riskId: string;
  description: string;
  category: 'Institutional' | 'Operational' | 'Financial' | 'Environmental & Social' | 'Political & Governance';
  severity: 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  mitigationMeasures: string;
  riskOwner: string;
  targetDate: string;
  currentStatus: 'Active' | 'Mitigated' | 'Closed';
  supportingAttachment?: string;
}

export interface TheoryOfChangeEntry {
  id: string;
  type: 'root_cause' | 'core_problem' | 'consequence' | 'intervention' | 'assumption';
  description: string;
  evidenceReference: string;
  order: number;
}

export interface AppraisalRating {
  criteriaId: string;
  criteriaName: string;
  rating: 'Meets requirements' | 'Partially meets requirements' | 'Does not meet requirements' | 'Not applicable';
  score?: number;
  maxScore?: number;
  evidence: string;
  requiredAction?: string;
  responsiblePerson?: string;
  status: 'Reviewed' | 'Pending Action' | 'Resolved';
}

export interface BoardAppraisal {
  appraisalId: string;
  submittedDate: string;
  ratings: AppraisalRating[];
  overallComment: string;
  evidenceAdvice: string;
  conditions: string[];
  requiredRevisions: string[];
  recommendation: 'Recommended for Approval' | 'Recommended with Conditions' | 'Deferred for Revision' | 'Not Recommended';
  completedDate?: string;
  appraisedByBoard: string[];
}

export interface CEOApproval {
  referenceNumber: string;
  decisionDate: string;
  decision: 'Formally Approved' | 'Conditionally Approved' | 'Returned for Revision';
  ceoName: string;
  guidanceText: string;
  conditions?: {
    condition: string;
    responsiblePerson: string;
    dueDate: string;
    status: 'Pending' | 'Complied' | 'Waived';
  }[];
  resubmissionDeadline?: string;
}

export interface DisbursementTranche {
  id: string;
  trancheNumber: number;
  trancheName: string;
  percentage: number;
  amount: number;
  preconditionMilestone: string;
  targetDate: string;
  actualDisbursementDate?: string;
  status: 'Pending Pre-condition' | 'Eligible' | 'Disbursed' | 'Withheld';
  responsiblePerson: string;
  notes?: string;
}

export interface FinancingAgreement {
  id: string;
  reference: string;
  instrument: 'Non-reimbursable grant' | 'Blended financing facility' | 'Technical assistance' | 'In-kind or Member State contribution';
  grantAmount: number;
  currency: string;
  procurementStandard: 'AU Procurement Rule' | 'Partner Procurement Rule' | 'Joint Harmonized Standards';
  auditCadence: 'Quarterly' | 'Biannually' | 'Annually';
  reportingCadence: 'Quarterly' | 'Biannually' | 'Annually';
  counterpartFunding: number;
  agreementDate: string;
  startDate: string;
  endDate: string;
  implementingPartner: string;
  focalPerson: string;
  conditions: string;
  tranches: DisbursementTranche[];
}

export interface DevelopmentPartner {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  type:
    | 'Multilateral Financial Institution'
    | 'Bilateral Agency'
    | 'UN Agency'
    | 'Regional Financial Institution'
    | 'Pan-African Multilateral Bank'
    | 'Bilateral & Regional Development Partner'
    | 'Philanthropic Foundation'
    | 'Private Sector / DFI'
    | 'Other';
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  focalArea?: string;
  totalCommitments?: number;
  status: 'Active' | 'Prospective' | 'Inactive';
  website?: string;
  notes?: string;
  dateAdded?: string;
  lastUpdated?: string;
}

export interface MoUItem {
  id: string;
  referenceNumber: string;
  title: string;
  partner: string;
  partnerCountry: string;
  signingParties: string;
  signingDate: string;
  effectiveDate: string;
  expiryDate: string;
  scope: string;
  status: 'Draft' | 'Under review' | 'Signed' | 'Active' | 'Expired' | 'Terminated';
}

export interface NegotiationRecord {
  id: string;
  partner: string;
  date: string;
  participants: string;
  topic: string;
  summary: string;
  issuesRaised: string;
  decisionsMade: string;
  actionsRequired: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface AmendmentItem {
  id: string;
  amendmentId: string;
  initiativeId: string;
  versionNumber: string;
  changeType: 'Scope' | 'Budget' | 'Timeline' | 'Partner' | 'Strategic alignment' | 'Results framework' | 'Financing terms' | 'Other';
  description: string;
  reason: string;
  requestedBy: string;
  dateRequested: string;
  approvalStatus: 'Pending Review' | 'Endorsed' | 'Approved by CEO' | 'Rejected';
  originalValue: string;
  proposedValue: string;
  budgetImpact: string;
  timelineImpact: string;
}

export interface TaskItem {
  id: string;
  title: string;
  initiativeId: string;
  initiativeTitle: string;
  stage: LifecycleStage;
  assignedToRole: UserRole;
  assignedToName: string;
  assignedBy: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  actionType: 'Clarify Concept' | 'Board Evaluation' | 'Appraise Project' | 'CEO Decision' | 'Contracting Action' | 'Review Amendment';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'info' | 'warning' | 'urgent' | 'success';
  relatedId?: string;
  stage?: LifecycleStage;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  entityType: 'Concept' | 'Project' | 'Document' | 'Workflow' | 'Appraisal' | 'CEO Approval' | 'Contracting' | 'Amendment';
  entityId: string;
  entityTitle: string;
  action: string;
  user: string;
  userRole: UserRole;
  oldValue?: string;
  newValue?: string;
  comment: string;
  ipAddress?: string;
}

export interface EvaluationDecision {
  decisionType:
    | 'Proceed to full project development'
    | 'Return for clarification'
    | 'Merge with existing initiative'
    | 'Put on hold'
    | 'Reject';
  collectiveBoardComment: string;
  decisionDate: string;
  evaluatedBy: string[];
  // If return for clarification
  clarificationComments?: string;
  clarificationFields?: string[];
  dueDate?: string;
  assignedPerson?: string;
  // If merge
  targetInitiativeId?: string;
  targetInitiativeTitle?: string;
  mergeExplanation?: string;
  responsiblePerson?: string;
  // If on hold
  holdReason?: string;
  reviewDate?: string;
  // If reject
  rejectionReason?: string;
  canResubmit?: boolean;
}

export interface Initiative {
  id: string;
  code: string; // e.g. CON-2026-001 or PRJ-2026-004
  sourceConceptCode?: string;
  sourceConceptId?: string;
  title: string;
  classification: ClassificationType;
  stage: LifecycleStage;
  stageCode: StageCode;
  status: InitiativeStatus;
  directorate: Directorate;
  ownerId: string;
  ownerName: string;
  projectManager?: string;
  dateSubmitted: string;
  lastUpdated: string;
  regions: AfricanRegion[];
  countries: string[];
  isContinental: boolean;
  existingProgramme: boolean;
  programmeName?: string;
  strategicObjective: string;
  implementationPeriod: '1–2 years' | '2–3 years' | '3–4 years' | '4–5 years';
  
  // Concept Details
  problemStatement: string;
  affectedParties: string;
  importanceStatement: string;
  consequencesOfInaction: string;
  proposedIntervention: string;
  expectedBeneficiaries: string;
  expectedResults: string;
  estimatedCost: number;
  currency: string;
  possibleFundingPartners: string[];
  fundingNotes?: string;

  // Project Stage 2 Extensions
  sras: StrategicResultArea[];
  sdps: StrategicDeliveryPathway[];
  strategicAlignmentNarrative?: string;
  theoryOfChangeEntries?: TheoryOfChangeEntry[];
  risks?: RiskItem[];
  outcomes?: Outcome[];
  totalCalculatedBudget?: number;

  // Stage 1 Concept Evaluation
  evaluationDecision?: EvaluationDecision;

  // Stage 3 & 4 Extensions
  boardAppraisal?: BoardAppraisal;
  ceoApproval?: CEOApproval;

  // Stage 5 Contracting
  financingAgreement?: FinancingAgreement;
  negotiations?: NegotiationRecord[];
  mous?: MoUItem[];

  // Stage 6 Amendments
  amendments?: AmendmentItem[];

  // Documents & Transitions
  documents: DocumentItem[];
  transitions: WorkflowTransition[];

  // Similarity tags
  duplicateStatus?: 'No relevant duplicate found' | 'Potential duplicate' | 'Related initiative' | 'Merge recommended' | 'Review required';
  similarInitiativeRef?: string;
}

export type NavigationPage =
  | 'Dashboard'
  | 'Project Pipeline'
  | 'My Assignments'
  | 'Concepts'
  | 'Project Development'
  | 'Program Board Evaluation'
  | 'Project Appraisal'
  | 'CEO Approval'
  | 'Contracting'
  | 'Amendments'
  | 'Partners'
  | 'Programmes'
  | 'Risk Matrix'
  | 'Reports'
  | 'Executive Dashboard'
  | 'Documents'
  | 'Administration'
  | 'Audit Trail'
  | 'Settings';
