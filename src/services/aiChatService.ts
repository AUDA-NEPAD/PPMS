import { Initiative, UserRole, NavigationPage } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
  isOffline?: boolean;
}

export interface SendChatParams {
  prompt: string;
  conversationHistory: ChatMessage[];
  initiatives: Initiative[];
  currentPage: NavigationPage;
  selectedInitiative?: Initiative | null;
  userRole: UserRole;
}

export interface ChatResponse {
  reply: string;
  suggestedQuestions: string[];
  isOffline: boolean;
}

/**
 * Builds a compact, high-density summary of the app data to fit in prompt context
 */
export function buildAppDataSummary(initiatives: Initiative[]) {
  const totalCount = initiatives.length;
  const totalValue = initiatives.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
  const targetMobilization = 1_000_000_000; // $1.0 Billion
  const approvedAndContracted = initiatives
    .filter((i) => i.stageCode >= 4)
    .reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
  const incubationValue = initiatives
    .filter((i) => i.stageCode < 4)
    .reduce((sum, i) => sum + (i.estimatedCost || 0), 0);

  const stageBreakdown: Record<number, { count: number; totalCost: number }> = {};
  for (let s = 0; s <= 6; s++) {
    stageBreakdown[s] = { count: 0, totalCost: 0 };
  }
  initiatives.forEach((i) => {
    if (stageBreakdown[i.stageCode]) {
      stageBreakdown[i.stageCode].count++;
      stageBreakdown[i.stageCode].totalCost += i.estimatedCost || 0;
    }
  });

  const compactInitiatives = initiatives.map((i) => ({
    code: i.code,
    title: i.title,
    stage: i.stage,
    stageCode: i.stageCode,
    status: i.status,
    directorate: i.directorate,
    regions: i.regions,
    countries: i.countries,
    estimatedCost: i.estimatedCost,
    currency: i.currency || 'USD',
    ownerName: i.ownerName,
    sras: i.sras || [],
    sdps: i.sdps || [],
    partners: i.possibleFundingPartners || [],
    hasCeoApproval: i.stageCode >= 4 || i.ceoApproval?.decision === 'Formally Approved'
  }));

  return {
    targetMobilization,
    totalValue,
    mobilizationPercent: ((totalValue / targetMobilization) * 100).toFixed(1) + '%',
    totalInitiatives: totalCount,
    approvedAndContracted,
    incubationValue,
    stageBreakdown,
    initiatives: compactInitiatives
  };
}

/**
 * Sends a message to the PPMS AI Chatbot backend
 */
export async function sendChatMessage({
  prompt,
  conversationHistory,
  initiatives,
  currentPage,
  selectedInitiative,
  userRole
}: SendChatParams): Promise<ChatResponse> {
  const appDataSummary = buildAppDataSummary(initiatives);

  // Strip down history to role and content for API
  const historyPayload = conversationHistory.map((m) => ({
    role: m.role,
    content: m.content
  }));

  const payload = {
    prompt,
    conversationHistory: historyPayload,
    appDataSummary,
    currentPage,
    selectedInitiative: selectedInitiative
      ? {
          id: selectedInitiative.id,
          code: selectedInitiative.code,
          title: selectedInitiative.title,
          stage: selectedInitiative.stage,
          stageCode: selectedInitiative.stageCode,
          status: selectedInitiative.status,
          directorate: selectedInitiative.directorate,
          estimatedCost: selectedInitiative.estimatedCost,
          currency: selectedInitiative.currency,
          ownerName: selectedInitiative.ownerName,
          regions: selectedInitiative.regions,
          countries: selectedInitiative.countries,
          sras: selectedInitiative.sras,
          partners: selectedInitiative.possibleFundingPartners
        }
      : null,
    userRole
  };

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || 'No response generated.',
      suggestedQuestions: Array.isArray(data.suggestedQuestions)
        ? data.suggestedQuestions
        : [
            'Summarize $1B Pipeline Mobilization progress',
            'Which projects are awaiting CEO approval?',
            'Analyze portfolio distribution by Directorate'
          ],
      isOffline: Boolean(data.isOffline)
    };
  } catch (error) {
    console.warn('Backend chat API failed or unreachable, generating client-side analytical fallback:', error);
    return getLocalAnalyticalFallback(prompt, appDataSummary, currentPage, selectedInitiative);
  }
}

function getLocalAnalyticalFallback(
  prompt: string,
  summary: ReturnType<typeof buildAppDataSummary>,
  currentPage: string,
  selectedInit?: Initiative | null
): ChatResponse {
  const q = prompt.toLowerCase();
  const initiatives = summary.initiatives;

  if (selectedInit && (q.includes('this') || q.includes('project') || q.includes(selectedInit.code.toLowerCase()))) {
    return {
      reply: `### Project Dossier: ${selectedInit.code} - ${selectedInit.title}\n\n` +
        `- **Current Stage**: ${selectedInit.stage} (Stage ${selectedInit.stageCode})\n` +
        `- **Lifecycle Status**: \`${selectedInit.status}\`\n` +
        `- **Directorate**: ${selectedInit.directorate}\n` +
        `- **Budget**: $${Number(selectedInit.estimatedCost).toLocaleString()} ${selectedInit.currency || 'USD'}\n` +
        `- **Project Owner**: ${selectedInit.ownerName}\n` +
        `- **Coverage**: ${selectedInit.regions.join(', ')}\n` +
        `- **Strategic Result Area**: ${selectedInit.sras?.[0] || 'Unassigned'}\n\n` +
        `*This initiative is tracked in the AUDA-NEPAD pipeline towards Agenda 2063 strategic targets.*`,
      suggestedQuestions: [
        `What are the gate requirements for ${selectedInit.code}?`,
        `Who is responsible for approving ${selectedInit.code}?`,
        `View portfolio summary for ${selectedInit.directorate}`
      ],
      isOffline: true
    };
  }

  if (q.includes('ceo') || q.includes('nardos') || q.includes('approval')) {
    const stage4 = initiatives.filter((i) => i.stageCode === 4 || i.status.toLowerCase().includes('ceo'));
    return {
      reply: `### CEO Governance & Approval Intelligence\n\n` +
        `**Mrs. Nardos Bekele-Thomas**, Chief Executive Officer of AUDA-NEPAD, oversees Stage 4 (Project Approval) official executive sanctions.\n\n` +
        `**Key Projects in CEO Horizon**:\n` +
        stage4.slice(0, 5).map((p) => `- **${p.code}**: *${p.title}* (${p.stage} • \`${p.status}\` • **$${Number(p.estimatedCost).toLocaleString()}**)`).join('\n') +
        `\n\nOnce sanctioned by Mrs. Nardos Bekele-Thomas, projects transition directly into Stage 5 Contracting and Financing Agreement finalization.`,
      suggestedQuestions: [
        'Which initiatives are awaiting CEO decision?',
        'What is the total value of approved projects?',
        'Explain the Stage 4 to Stage 5 handoff'
      ],
      isOffline: true
    };
  }

  return {
    reply: `### AUDA-NEPAD Pipeline Intelligence Briefing\n\n` +
      `- **Total Capital Mobilization**: **$${summary.totalValue.toLocaleString()} USD** (${summary.mobilizationPercent} of the **$1.0 Billion USD** strategic target)\n` +
      `- **Total Active Initiatives**: **${summary.totalInitiatives} continental projects**\n` +
      `- **Approved & Contracting Value**: **$${summary.approvedAndContracted.toLocaleString()} USD**\n` +
      `- **Pipeline Incubation Value**: **$${summary.incubationValue.toLocaleString()} USD**\n` +
      `- **Current Navigation View**: \`${currentPage}\`\n\n` +
      `**Distribution Across Lifecycle Gates**:\n` +
      `- Stage 0 (Concept Development): ${summary.stageBreakdown[0].count} initiatives\n` +
      `- Stage 1 (Concept Evaluation): ${summary.stageBreakdown[1].count} initiatives\n` +
      `- Stage 2 (Project Development): ${summary.stageBreakdown[2].count} initiatives\n` +
      `- Stage 3 (Project Appraisal): ${summary.stageBreakdown[3].count} initiatives\n` +
      `- Stage 4 (CEO Approval): ${summary.stageBreakdown[4].count} initiatives\n` +
      `- Stage 5 (Contracting): ${summary.stageBreakdown[5].count} initiatives\n` +
      `- Stage 6 (Amendments): ${summary.stageBreakdown[6].count} initiatives\n\n` +
      `You can query any project by code, Directorate, regional footprint, or partner co-financing details.`,
    suggestedQuestions: [
      'Summarize $1B Pipeline Mobilization progress',
      'Which projects are awaiting CEO Mrs. Nardos Bekele-Thomas approval?',
      'Breakdown investments by Directorate and SRA'
    ],
    isOffline: true
  };
}
