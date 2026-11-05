import React from 'react';
import {
  StrategicResultArea,
  StrategicDeliveryPathway,
  DocumentItem
} from '../../types';
import {
  STRATEGIC_RESULT_AREAS,
  STRATEGIC_DELIVERY_PATHWAYS
} from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { DocumentUploadManager } from '../common/DocumentUploadManager';
import {
  Compass,
  CheckCircle2,
  FileText,
  Globe,
  Layers,
  Info,
  ShieldCheck,
  Handshake,
  Plus,
  X,
  Building,
  ExternalLink
} from 'lucide-react';

interface StrategicAlignmentSectionProps {
  sras: StrategicResultArea[];
  sdps: StrategicDeliveryPathway[];
  narrative: string;
  fundingPartners?: string[];
  documents: DocumentItem[];
  onChangeSras: (sras: StrategicResultArea[]) => void;
  onChangeSdps: (sdps: StrategicDeliveryPathway[]) => void;
  onChangeNarrative: (narrative: string) => void;
  onChangeFundingPartners?: (partners: string[]) => void;
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  currentUser: { name: string };
  isLocked?: boolean;
}

export const StrategicAlignmentSection: React.FC<StrategicAlignmentSectionProps> = ({
  sras,
  sdps,
  narrative,
  fundingPartners = [],
  documents,
  onChangeSras,
  onChangeSdps,
  onChangeNarrative,
  onChangeFundingPartners,
  onAddDocument,
  onDeleteDocument,
  currentUser,
  isLocked = false
}) => {
  const { partners, setCurrentPage } = useApp();

  const toggleSra = (sra: StrategicResultArea) => {
    if (isLocked) return;
    if (sras.includes(sra)) {
      onChangeSras(sras.filter((s) => s !== sra));
    } else {
      onChangeSras([...sras, sra]);
    }
  };

  const toggleSdp = (sdp: StrategicDeliveryPathway) => {
    if (isLocked) return;
    if (sdps.includes(sdp)) {
      onChangeSdps(sdps.filter((s) => s !== sdp));
    } else {
      onChangeSdps([...sdps, sdp]);
    }
  };

  const handleSelectPartner = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    if (!selectedVal || !onChangeFundingPartners) return;
    if (!fundingPartners.includes(selectedVal)) {
      onChangeFundingPartners([...fundingPartners, selectedVal]);
    }
    e.target.value = '';
  };

  const handleRemovePartner = (partnerName: string) => {
    if (isLocked || !onChangeFundingPartners) return;
    onChangeFundingPartners(fundingPartners.filter((p) => p !== partnerName));
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      {/* Overview Banner */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-start gap-3">
        <Compass className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-emerald-950 text-sm">
            2.1 AU Agenda 2063 Strategic Alignment Framework
          </h3>
          <p className="text-emerald-800 text-xs leading-relaxed">
            Specify how the initiative directly contributes to AUDA-NEPAD Strategic Result Areas (SRAs) and executes through Strategic Delivery Pathways (SDPs).
          </p>
        </div>
      </div>

      {/* Strategic Result Areas (SRAs) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Strategic Result Areas (SRA 1 – 5) *
            </h4>
            <p className="text-[11px] text-slate-500">
              Select all Strategic Result Areas targeted by this project's outcomes.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            {sras.length} Selected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {STRATEGIC_RESULT_AREAS.map((sra) => {
            const isSelected = sras.includes(sra);
            const sraCode = sra.split('–')[0].trim();
            const sraTitle = sra.split('–')[1]?.trim() || sra;

            return (
              <button
                key={sra}
                type="button"
                disabled={isLocked}
                onClick={() => toggleSra(sra)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-white px-1.5 py-0.2 rounded border border-emerald-200 inline-block mb-1">
                    {sraCode}
                  </span>
                  <div className="font-bold text-slate-900 text-xs leading-snug">
                    {sraTitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategic Delivery Pathways (SDPs) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Strategic Delivery Pathways (SDP 1 – 5) *
            </h4>
            <p className="text-[11px] text-slate-500">
              Select the operational delivery mechanisms utilized for pan-African implementation.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
            {sdps.length} Selected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {STRATEGIC_DELIVERY_PATHWAYS.map((sdp) => {
            const isSelected = sdps.includes(sdp);
            const sdpCode = sdp.split('–')[0].trim();
            const sdpTitle = sdp.split('–')[1]?.trim() || sdp;

            return (
              <button
                key={sdp}
                type="button"
                disabled={isLocked}
                onClick={() => toggleSdp(sdp)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    isSelected
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] font-bold text-sky-800 bg-white px-1.5 py-0.2 rounded border border-sky-200 inline-block mb-1">
                    {sdpCode}
                  </span>
                  <div className="font-bold text-slate-900 text-xs leading-snug">
                    {sdpTitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Development Partners & Co-Financing Alignment (Select from Partner's Database) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Handshake className="w-4 h-4 text-purple-700" />
              <span>Development Partners & Co-Financing Architecture</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select one or more development partners from the Partner's Database backing this project's formulation and continental delivery.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              {fundingPartners.length} Attached
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage('Partners')}
              className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              title="Open Partner's Database"
            >
              <span>Partner's Database</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dropdown list to select partner(s) */}
        {!isLocked && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              Add Partner from Database (Dropdown List):
            </label>
            <div className="flex gap-2">
              <select
                onChange={handleSelectPartner}
                defaultValue=""
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                <option value="">-- Choose a Development Partner to add to this Project --</option>
                {partners
                  .filter((p) => !fundingPartners.includes(p.name))
                  .map((partner) => (
                    <option key={partner.id} value={partner.name}>
                      {partner.name} ({partner.type} • {partner.country})
                    </option>
                  ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Dropdown is synced in real time with the central Partner's Database under Strategic Portfolio.
            </p>
          </div>
        )}

        {/* Attached Partners Badges */}
        {fundingPartners.length > 0 ? (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">
              Attached Development Partners for this Project:
            </span>
            <div className="flex flex-wrap gap-2">
              {fundingPartners.map((partnerName) => {
                const partnerObj = partners.find((p) => p.name === partnerName);
                return (
                  <span
                    key={partnerName}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-950 rounded-xl border border-purple-200 text-xs font-medium shadow-2xs"
                  >
                    <Building className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>{partnerName}</span>
                    {partnerObj?.country && (
                      <span className="text-[10px] text-purple-600 bg-purple-100/80 px-1.5 py-0.2 rounded font-semibold">
                        {partnerObj.country}
                      </span>
                    )}
                    {partnerObj?.type && (
                      <span className="text-[10px] text-slate-500 hidden md:inline">
                        • {partnerObj.type}
                      </span>
                    )}
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleRemovePartner(partnerName)}
                        className="text-purple-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-white transition-colors cursor-pointer ml-1"
                        title="Remove partner"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              No development partners attached to this project yet. Select one or more partners from the dropdown list above.
            </span>
          </div>
        )}
      </div>

      {/* Narrative Explanation of Alignment */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Narrative Explanation of Alignment *
        </label>
        <p className="text-[11px] text-slate-500">
          Elaborate on how this initiative operationalizes specific First & Second Ten-Year Implementation Plans of AU Agenda 2063, Regional Economic Community (REC) masterplans, and continental treaties.
        </p>
        <textarea
          disabled={isLocked}
          rows={5}
          value={narrative}
          onChange={(e) => onChangeNarrative(e.target.value)}
          placeholder="Articulate the strategic synergy with AU Aspirations, relevant Continental Policy Frameworks (e.g. CAADP, PIDA, Science Strategy STISA-2024, PAVM), and cross-directorate linkages..."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs leading-relaxed"
        />
      </div>

      {/* Strategic Alignment Documents & Supporting Attachments */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <DocumentUploadManager
          documents={documents.filter((d) => d.category === 'Project Document' || d.category === 'Concept Note')}
          currentUser={currentUser}
          readOnly={isLocked}
          onAddDocument={onAddDocument}
          onDeleteDocument={onDeleteDocument}
        />
      </div>
    </div>
  );
};
