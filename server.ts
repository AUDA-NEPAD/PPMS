import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'AUDA-NEPAD PPMS',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // AI Chat endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const {
        prompt,
        conversationHistory = [],
        appDataSummary = {},
        currentPage = 'Dashboard',
        selectedInitiative = null,
        userRole = 'System Administrator'
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Valid prompt string is required.' });
      }

      // If no API key configured, generate an intelligent contextual response based on the dataset
      if (!apiKey) {
        const fallbackReply = generateLocalDatasetResponse(prompt, appDataSummary, currentPage, selectedInitiative);
        return res.json({
          reply: fallbackReply.reply,
          suggestedQuestions: fallbackReply.suggestedQuestions,
          isOffline: true
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are the AUDA-NEPAD Strategic Intelligence AI Assistant (PPMS AI Advisor) embedded in the African Union Development Agency (AUDA-NEPAD) Pipeline Projects Management System.
You provide executive-level insights, strategic analysis, risk alerts, stage progress diagnostics, and data synthesis to AUDA-NEPAD leadership and project teams.

KEY INSTITUTIONAL CONTEXT:
- Organization: African Union Development Agency (AUDA-NEPAD)
- Chief Executive Officer: Mrs. Nardos Bekele-Thomas (Important: Her official title is Mrs., not Dr.).
- Overarching Framework: African Union Agenda 2063 ("The Africa We Want").
- Target Capital Mobilization: $1,000,000,000 ($1.0 Billion USD) target across continental initiatives.
- 7 Governance Lifecycle Stages:
  * Stage 0: Concept Development (Initial formulation & strategic fit)
  * Stage 1: Concept Evaluation (Programme Board review & scoring)
  * Stage 2: Project Development (Dossier, feasibility, ESG, procurement, bankability)
  * Stage 3: Project Appraisal (Independent technical review & due diligence rating)
  * Stage 4: Project Approval (CEO Mrs. Nardos Bekele-Thomas executive sanction)
  * Stage 5: Contracting (Financing Agreement, disbursement tranches, conditions precedent)
  * Stage 6: Amendment & Change Control (Variation & Change Memorandums)

CURRENT USER ENVIRONMENT:
- Active Navigation Page: ${currentPage}
- User Role: ${userRole}
${selectedInitiative ? `- Focused Initiative in modal: ${JSON.stringify(selectedInitiative)}` : '- No single initiative modal currently open.'}

LIVE SYSTEM DATA SUMMARY:
${JSON.stringify(appDataSummary, null, 2)}

RESPONSE GUIDELINES:
1. Always cite exact project codes (e.g. INIT-2024-001) and project titles directly from the provided dataset.
2. Present financial numbers formatted clearly (e.g., $150,000,000 or $150M USD).
3. If asked about the CEO, always refer to her respectfully as Mrs. Nardos Bekele-Thomas.
4. Structure responses with crisp Markdown: use bolding, bullet points, numbered lists, tables for comparisons, and callout sections for strategic recommendations.
5. Provide high-impact executive summaries first, followed by granular analytical evidence.
6. When discussing delays, highlight Gate SLA variance days, bottleneck stages, and risk ratings.
7. Conclude your response with exactly 3 pertinent follow-up questions formatted as follows:
---SUGGESTED_QUESTIONS---
[First follow-up question here]
[Second follow-up question here]
[Third follow-up question here]`;

      // Build contents array for Gemini generateContent
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add recent conversation history (last 8 messages to stay concise)
      const recentHistory = conversationHistory.slice(-8);
      for (const msg of recentHistory) {
        if (msg && msg.content) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      // Add current user prompt
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        }
      });

      const rawText = response.text || 'I analyzed the portfolio, but could not generate a textual reply.';

      // Parse out suggested questions if delimiter exists
      let replyText = rawText;
      let suggestedQuestions: string[] = [];

      if (rawText.includes('---SUGGESTED_QUESTIONS---')) {
        const parts = rawText.split('---SUGGESTED_QUESTIONS---');
        replyText = parts[0].trim();
        const suggestionsPart = parts[1] || '';
        suggestedQuestions = suggestionsPart
          .split('\n')
          .map((s) => s.replace(/^[-*0-9.]\s*/, '').trim())
          .filter((s) => s.length > 5 && !s.startsWith('[') && !s.endsWith(']'))
          .slice(0, 3);
      }

      if (suggestedQuestions.length === 0) {
        suggestedQuestions = [
          'Show me all initiatives awaiting CEO approval',
          'Breakdown the portfolio by Directorate and SRA',
          'Which projects are currently delayed against Gate SLAs?'
        ];
      }

      return res.json({
        reply: replyText,
        suggestedQuestions,
        isOffline: false
      });
    } catch (error: any) {
      console.error('Error in /api/ai/chat:', error);

      // Gracefully fall back to local data synthesis if API call fails
      const fallbackReply = generateLocalDatasetResponse(
        req.body?.prompt || '',
        req.body?.appDataSummary || {},
        req.body?.currentPage || 'Dashboard',
        req.body?.selectedInitiative
      );

      return res.json({
        reply: `${fallbackReply.reply}\n\n*(Note: Generated via PPMS Live Analytics Engine due to external API connection latency)*`,
        suggestedQuestions: fallbackReply.suggestedQuestions,
        isOffline: true
      });
    }
  });

  // Mount Vite middleware in development or serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AUDA-NEPAD PPMS full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

/**
 * Local analytical fallback generator to ensure zero downtime
 */
function generateLocalDatasetResponse(
  prompt: string,
  data: any,
  currentPage: string,
  selectedInit: any
): { reply: string; suggestedQuestions: string[] } {
  const query = prompt.toLowerCase();
  const initiatives: any[] = data.initiatives || [];
  const totalValue = data.totalValue || 0;
  const targetValue = 1_000_000_000;
  const progressPct = ((totalValue / targetValue) * 100).toFixed(1);

  // If asking about a specific selected initiative
  if (selectedInit && (query.includes('this') || query.includes('selected') || query.includes(selectedInit.code.toLowerCase()))) {
    return {
      reply: `### Deep Dive: ${selectedInit.code} - ${selectedInit.title}\n\n` +
        `- **Lifecycle Stage**: ${selectedInit.stage} (Stage ${selectedInit.stageCode})\n` +
        `- **Status**: \`${selectedInit.status}\`\n` +
        `- **Directorate**: ${selectedInit.directorate}\n` +
        `- **Estimated Budget**: $${Number(selectedInit.estimatedCost).toLocaleString()} ${selectedInit.currency || 'USD'}\n` +
        `- **Owner / Lead**: ${selectedInit.ownerName}\n` +
        `- **Geographic Footprint**: ${Array.isArray(selectedInit.regions) ? selectedInit.regions.join(', ') : 'Continental'}\n` +
        `- **Strategic Alignment**: ${Array.isArray(selectedInit.sras) ? selectedInit.sras[0] : 'Agenda 2063'}\n\n` +
        `**Governance Observation**: This initiative is actively recorded in the AUDA-NEPAD pipeline. Ensure all gate criteria are satisfied before submitting for subsequent approvals.`,
      suggestedQuestions: [
        `What are the gate requirements for ${selectedInit.code}?`,
        `Who is responsible for advancing ${selectedInit.code}?`,
        `View portfolio summary for ${selectedInit.directorate}`
      ]
    };
  }

  // CEO Approval queries
  if (query.includes('ceo') || query.includes('approval') || query.includes('nardos')) {
    const stage4Projects = initiatives.filter((i) => i.stageCode === 4 || i.status?.toLowerCase().includes('ceo') || i.status?.toLowerCase().includes('approved'));
    return {
      reply: `### Executive Approval Overview: Office of the CEO (Mrs. Nardos Bekele-Thomas)\n\n` +
        `Mrs. Nardos Bekele-Thomas, Chief Executive Officer of AUDA-NEPAD, oversees Stage 4 (Project Approval) decisions.\n\n` +
        `**Key Projects in CEO Governance Scope**:\n` +
        stage4Projects.slice(0, 5).map((p) => `- **${p.code}**: *${p.title}* - Stage: **${p.stage}** | Status: \`${p.status}\` | Budget: **$${Number(p.estimatedCost).toLocaleString()}**`).join('\n') +
        `\n\n**Executive Action**: Initiatives recommended by the Programme Board are presented for official sanction and financing endorsement by Mrs. Nardos Bekele-Thomas.`,
      suggestedQuestions: [
        'Which initiatives are awaiting CEO decision?',
        'What is the total value of approved projects?',
        'How does the CEO sanction transition to Stage 5 Contracting?'
      ]
    };
  }

  // Financial mobilization or $1B target queries
  if (query.includes('billion') || query.includes('mobiliz') || query.includes('target') || query.includes('value') || query.includes('budget')) {
    return {
      reply: `### AUDA-NEPAD Capital Mobilization Health Check\n\n` +
        `- **Target Mobilization Goal**: **$1,000,000,000 USD** ($1.0 Billion)\n` +
        `- **Current Pipeline Value**: **$${totalValue.toLocaleString()} USD** (${progressPct}% of goal)\n` +
        `- **Total Active Initiatives**: **${initiatives.length} initiatives**\n` +
        `- **Capital Gap Remaining**: **$${Math.max(0, targetValue - totalValue).toLocaleString()} USD**\n\n` +
        `| Stage | Initiatives | Estimated Volume |\n` +
        `|---|---|---|\n` +
        [0, 1, 2, 3, 4, 5, 6].map((sc) => {
          const list = initiatives.filter((i) => i.stageCode === sc);
          const vol = list.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
          return `| Stage ${sc} | ${list.length} | $${vol.toLocaleString()} |`;
        }).join('\n') +
        `\n\n**Strategic Takeaway**: Capital mobilization is pacing strongly towards the $1B threshold. Prioritize unblocking high-value initiatives in Stage 2 and Stage 3 to convert into contracted commitments.`,
      suggestedQuestions: [
        'Which are the top 3 highest-value initiatives?',
        'What is the distribution of investments by Directorate?',
        'Show me co-financing commitments by Development Partners'
      ]
    };
  }

  // Delayed / risk queries
  if (query.includes('delay') || query.includes('risk') || query.includes('overdue') || query.includes('sla')) {
    const delayed = initiatives.filter((i) => i.ragStatus === 'delayed' || i.ragStatus === 'at_risk');
    return {
      reply: `### Portfolio SLA & Risk Watchlist\n\n` +
        `There are currently **${delayed.length} initiatives** requiring management attention due to gate dwell time variance or risk factors:\n\n` +
        (delayed.length > 0
          ? delayed.map((d) => `- **${d.code}** (*${d.title}*) — Stage: **${d.stage}** | Status: \`${d.ragStatus?.toUpperCase()}\` | Variance: **${d.varianceDays || 0} days**`).join('\n')
          : 'All tracked pipeline initiatives are currently operating within Gate SLA thresholds.') +
        `\n\n**Recommended Intervention**: Schedule expedited technical review sessions with the respective Directorate Leads to clear appraisal requirements.`,
      suggestedQuestions: [
        'What are the root causes for Stage 2 dwell times?',
        'Show initiatives in the Risk Matrix',
        'Which directorates have the highest SLA compliance?'
      ]
    };
  }

  // Default general portfolio summary
  return {
    reply: `### AUDA-NEPAD Continental Pipeline Executive Summary\n\n` +
      `The Pipeline Projects Management System (PPMS) currently coordinates **${initiatives.length} initiatives** totaling **$${totalValue.toLocaleString()} USD** across the African continent.\n\n` +
      `#### Key Metrics:\n` +
      `- **Mobilization Progress**: ${progressPct}% of the **$1.0 Billion USD** strategic target.\n` +
      `- **Active Page**: currently viewing **${currentPage}**.\n` +
      `- **Governance**: Operations guided under the executive leadership of **Mrs. Nardos Bekele-Thomas**.\n\n` +
      `#### Pipeline by Lifecycle Gate:\n` +
      [0, 1, 2, 3, 4, 5, 6].map((sc) => {
        const count = initiatives.filter((i) => i.stageCode === sc).length;
        const names = ['Concept Dev', 'Evaluation', 'Project Dev', 'Appraisal', 'CEO Approval', 'Contracting', 'Amendments'];
        return `- **Stage ${sc} (${names[sc]})**: ${count} projects`;
      }).join('\n') +
      `\n\nAsk me specific questions regarding any project, Directorate, Agenda 2063 SRA, or financial agreement!`,
    suggestedQuestions: [
      'Summarize $1B Pipeline Mobilization progress',
      'Which projects are awaiting CEO Mrs. Nardos Bekele-Thomas approval?',
      'Analyze investment distribution by Directorate and SRA'
    ]
  };
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
