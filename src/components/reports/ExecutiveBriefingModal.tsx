import React, { useState } from 'react';
import { Initiative } from '../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { calculateInitiativeLifecycleAge } from '../../utils/lifecycleAgeCalculations';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Shield,
  Award,
  Globe,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Building,
  CheckCircle2
} from 'lucide-react';

interface ExecutiveBriefingModalProps {
  initiatives: Initiative[];
  onClose: () => void;
  selectedTemplate?: 'annual' | 'board' | 'financing' | 'amendments';
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  initiatives,
  onClose,
  selectedTemplate: initialTemplate = 'annual'
}) => {
  const [template, setTemplate] = useState<'annual' | 'board' | 'financing' | 'amendments'>(initialTemplate);
  const [copied, setCopied] = useState(false);

  // Computed metrics for briefing
  const totalVolume = initiatives.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
  const approvedVolume = initiatives
    .filter((i) => i.status === 'Approved' || i.status === 'Under Contracting' || i.status === 'Financing Finalized' || i.status === 'Active / Implementation')
    .reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
  const contractingCount = initiatives.filter((i) => i.stageCode === 5).length;
  const approvedCount = initiatives.filter((i) => i.stageCode >= 4).length;
  const conceptsCount = initiatives.filter((i) => i.stageCode <= 1).length;
  const devCount = initiatives.filter((i) => i.stageCode === 2 || i.stageCode === 3).length;
  const amendmentCount = initiatives.filter((i) => i.stageCode === 6 || (i.amendments && i.amendments.length > 0)).length;

  // Timeliness analysis
  let ahead = 0;
  let onTrack = 0;
  let atRisk = 0;
  let delayed = 0;
  initiatives.forEach((i) => {
    const age = calculateInitiativeLifecycleAge(i);
    if (age.currentGateRagStatus === 'ahead') ahead++;
    else if (age.currentGateRagStatus === 'on_track') onTrack++;
    else if (age.currentGateRagStatus === 'at_risk') atRisk++;
    else if (age.currentGateRagStatus === 'delayed') delayed++;
  });
  const complianceRate = initiatives.length > 0 ? Math.round(((ahead + onTrack) / initiatives.length) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const briefingText = `
AUDA-NEPAD EXECUTIVE PORTFOLIO BRIEFING MEMORANDUM
Document Reference: AUDA-PPMS-REP-${new Date().getFullYear()}-001
Date of Issuance: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
Classification: Executive Statutory Circulation

1. PORTFOLIO MACRO SUMMARY
- Total Pipeline Scope: ${initiatives.length} initiatives
- Aggregate Investment Volume: ${formatCurrency(totalVolume, 'USD')}
- Formally Sanctioned / Under Contracting: ${formatCurrency(approvedVolume, 'USD')} (${approvedCount} projects)
- Gate SLA Compliance Adherence: ${complianceRate}% on-track or ahead

2. LIFECYCLE DISTRIBUTION
- Concepts & Evaluation (Stages 0-1): ${conceptsCount} initiatives
- Project Formulation & Appraisal (Stages 2-3): ${devCount} initiatives
- Executive Sanction & Financing (Stages 4-5): ${approvedCount} initiatives
- Change Control & Active Amendments (Stage 6): ${amendmentCount} initiatives

3. STRATEGIC RECOMMENDATIONS
- Expedite bilateral financing agreement closures for projects awaiting counter-signature.
- Prioritize technical assistance roll-out for Stage 2 projects nearing gate appraisal deadlines.
- Maintain rigorous compliance with Agenda 2063 Second Ten-Year Implementation Plan (STYIP).
`;
    navigator.clipboard.writeText(briefingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              AU
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Institutional Executive Briefing Generator
              </h2>
              <p className="text-[11px] text-slate-400">
                Official AUDA-NEPAD statutory memorandum & portfolio report
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              className="bg-slate-800 text-white text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="annual">AU Assembly & CEO Annual Register</option>
              <option value="board">Programme Board Statutory Appraisal</option>
              <option value="financing">Development Financing & Co-financiers</option>
              <option value="amendments">Change Control & Risk Audit</option>
            </select>

            <button
              onClick={handleCopyText}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              title="Copy Summary Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-white print:p-0 print:overflow-visible">
          {/* Official Letterhead */}
          <div className="border-b-2 border-emerald-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-900 uppercase">
                <span>African Union Development Agency</span>
                <span>•</span>
                <span>AUDA-NEPAD</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {template === 'annual' && 'Continental Pipeline Portfolio Executive Memorandum'}
                {template === 'board' && 'Programme Board Statutory Appraisal & Gate Clearance Dossier'}
                {template === 'financing' && 'Blended Development Financing & Strategic Partners Report'}
                {template === 'amendments' && 'Stage 6 Project Amendment & Lifecycle Change Audit'}
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                REF: AUDA-PPMS-EXE-2026/Q3-{template.toUpperCase()} · CLASSIFICATION: OFFICIAL STATUTORY USE
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="font-semibold text-slate-900">Pipeline Projects Management System</div>
              <div>Agenda 2063 Second Ten-Year Implementation Plan</div>
              <div className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Institutional Transmittal Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
              <div>
                <span className="text-slate-500">TO: </span>
                <span className="font-bold text-slate-900">Mrs. Nardos Bekele-Thomas, Chief Executive Officer</span>
              </div>
              <div>
                <span className="text-slate-500">FROM: </span>
                <span className="font-bold text-slate-900">Directorate of Strategic Planning, Resource Mobilization & KM</span>
              </div>
              <div>
                <span className="text-slate-500">BODY: </span>
                <span>AUDA-NEPAD Programme Board & Executive Leadership</span>
              </div>
              <div>
                <span className="text-slate-500">MANDATE: </span>
                <span>Continental Initiative Pipeline Oversight & Gate Adherence</span>
              </div>
            </div>
          </div>

          {/* Macro Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border border-slate-200 rounded-xl p-3 bg-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pipeline Value</div>
              <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(totalVolume, 'USD')}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{initiatives.length} Initiatives Listed</div>
            </div>

            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Approved & Contracted</div>
              <div className="text-lg font-black text-emerald-900 mt-1">{formatCurrency(approvedVolume, 'USD')}</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">{approvedCount} Projects Sanctioned</div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3 bg-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gate SLA Compliance</div>
              <div className="text-lg font-black text-slate-900 mt-1">{complianceRate}%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{ahead + onTrack} Gates On-Schedule</div>
            </div>

            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Active Change Controls</div>
              <div className="text-lg font-black text-amber-900 mt-1">{amendmentCount}</div>
              <div className="text-[11px] text-amber-700 mt-0.5">Stage 6 Amendments</div>
            </div>
          </div>

          {/* Section 1: Executive Narrative */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-2">
              <span>1.0 Executive Narrative & Institutional Context</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              The African Union Development Agency (AUDA-NEPAD) maintains a rigorous, multi-stage governance pipeline to steward high-impact development initiatives from initial continental concept formulation through independent Programme Board appraisal, formal CEO decree, and blended financing execution.
            </p>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              As of this reporting period, the pipeline encompasses <strong>{initiatives.length} total initiatives</strong> representing an aggregate catalytic commitment of <strong>{formatCurrency(totalVolume, 'USD')}</strong>. A total of <strong>{approvedCount} initiatives ({formatCurrency(approvedVolume, 'USD')})</strong> have progressed through Stage 4 Executive CEO approval and are presently entering or concluding Stage 5 bilateral financing agreements and counterpart tranches.
            </p>
          </div>

          {/* Section 2: Portfolio Inventory Table */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>2.0 Active Pipeline Dossier Register</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">Showing {initiatives.length} initiative(s)</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Initiative Title</th>
                    <th className="p-2.5">Directorate</th>
                    <th className="p-2.5">Lifecycle Stage</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Estimated Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {initiatives.slice(0, 10).map((init) => (
                    <tr key={init.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-emerald-800">{init.code}</td>
                      <td className="p-2.5 font-semibold text-slate-900 max-w-xs truncate">{init.title}</td>
                      <td className="p-2.5 text-slate-600 truncate max-w-[140px]">{init.directorate}</td>
                      <td className="p-2.5 text-slate-700">{init.stage.split(':')[0]}</td>
                      <td className="p-2.5">
                        <span className="font-semibold text-slate-800">{init.status}</span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(init.estimatedCost, init.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {initiatives.length > 10 && (
                <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-200 italic">
                  + {initiatives.length - 10} additional initiatives summarized in master ledger attachments.
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Strategic Directives & Gate Governance */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              <span>3.0 Strategic Directives & Institutional Recommendations</span>
            </h3>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5 leading-relaxed">
              <li>
                <strong>Stage 5 Contracting Acceleration:</strong> All initiatives with bilateral financing agreements in negotiation must prioritize MoU completion with AfDB, World Bank, and European Union to ensure Q4 capital disbursements.
              </li>
              <li>
                <strong>Gate SLA Adherence:</strong> Lead Directorate Directors are instructed to review initiatives flagged as <em>At Risk</em> or <em>Delayed</em> to eliminate statutory bottlenecks prior to the next Programme Board convocation.
              </li>
              <li>
                <strong>Change Control Enforcement:</strong> All Stage 6 scope or budgetary variations exceeding 15% must undergo formal Programme Board endorsement prior to CEO sanction.
              </li>
            </ul>
          </div>

          {/* Institutional Sign-off Block */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
            <div className="space-y-6">
              <div>
                <div className="font-bold text-slate-900">Prepared & Endorsed By:</div>
                <div className="text-slate-500">Secretary, AUDA-NEPAD Programme Board</div>
              </div>
              <div className="pt-6 border-b border-slate-300 w-48 font-mono text-[11px] text-slate-400">
                [Digitally Sealed via PPMS]
              </div>
              <div className="text-[11px] text-slate-500">
                Date: {formatDate(new Date().toISOString())}
              </div>
            </div>

            <div className="space-y-6 text-right sm:text-left sm:pl-16">
              <div>
                <div className="font-bold text-slate-900">Official Executive Sanction:</div>
                <div className="text-slate-500">Office of the Chief Executive Officer</div>
              </div>
              <div className="pt-6 border-b border-slate-300 w-48 font-mono text-[11px] text-slate-400">
                Mrs. Nardos Bekele-Thomas
              </div>
              <div className="text-[11px] text-slate-500">
                African Union Development Agency
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Institutional Reporting Engine · PPMS v1.0</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Briefing</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
