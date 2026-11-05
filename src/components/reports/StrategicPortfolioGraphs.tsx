import React, { useState } from 'react';
import {
  Initiative,
  Directorate,
  StrategicResultArea,
  StrategicDeliveryPathway,
  StageCode
} from '../../types';
import {
  DIRECTORATES,
  STRATEGIC_RESULT_AREAS,
  STRATEGIC_DELIVERY_PATHWAYS
} from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Layers,
  Building,
  Target,
  Compass,
  ArrowUpRight,
  Info,
  Maximize2,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface StageData {
  code: StageCode;
  label: string;
  shortName: string;
  initiatives: Initiative[];
  totalCost: number;
  avgDays: number;
  slaTarget: number;
  onTrackCount: number;
  delayedCount: number;
}

interface SraData {
  sra: StrategicResultArea;
  count: number;
  totalCost: number;
  initiatives: Initiative[];
}

interface SdpData {
  sdp: StrategicDeliveryPathway;
  count: number;
  totalCost: number;
  initiatives: Initiative[];
}

interface DirectorateData {
  directorate: Directorate;
  totalProjects: number;
  totalVolume: number;
  avgDays: number;
  delayedCount: number;
  approvedCount: number;
}

interface StrategicPortfolioGraphsProps {
  stageData: StageData[];
  directorateData: DirectorateData[];
  sraData: SraData[];
  sdpData: SdpData[];
  totalVolume: number;
  totalCount: number;
  selectedStage: string;
  onSelectStage: (stageCode: string) => void;
  selectedDirectorate: string;
  onSelectDirectorate: (directorate: string) => void;
  selectedSra: string;
  onSelectSra: (sra: string) => void;
}

// Stage color palettes
const STAGE_COLORS: Record<number, { bg: string; fill: string; border: string; text: string; badge: string }> = {
  0: { bg: 'bg-blue-500', fill: '#3b82f6', border: 'border-blue-400', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  1: { bg: 'bg-cyan-500', fill: '#06b6d4', border: 'border-cyan-400', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' },
  2: { bg: 'bg-indigo-500', fill: '#6366f1', border: 'border-indigo-400', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
  3: { bg: 'bg-violet-500', fill: '#8b5cf6', border: 'border-violet-400', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-800' },
  4: { bg: 'bg-amber-500', fill: '#f59e0b', border: 'border-amber-400', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  5: { bg: 'bg-emerald-500', fill: '#10b981', border: 'border-emerald-400', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  6: { bg: 'bg-slate-500', fill: '#64748b', border: 'border-slate-400', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800' }
};

// Directorate colors
const DIRECTORATE_COLORS = [
  '#0d9488', // teal-600
  '#0284c7', // sky-600
  '#16a34a', // green-600
  '#7c3aed', // violet-600
  '#ea580c', // orange-600
  '#ca8a04'  // yellow-600
];

// SRA colors
const SRA_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#7c3aed', // purple
  '#db2777', // pink
  '#d97706', // amber
  '#0891b2', // cyan
  '#16a34a'  // green
];

// SDP colors
const SDP_COLORS = [
  '#0284c7', // light blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // violet
  '#e11d48'  // rose
];

export const StrategicPortfolioGraphs: React.FC<StrategicPortfolioGraphsProps> = ({
  stageData,
  directorateData,
  sraData,
  sdpData,
  totalVolume,
  totalCount,
  selectedStage,
  onSelectStage,
  selectedDirectorate,
  onSelectDirectorate,
  selectedSra,
  onSelectSra
}) => {
  // Graph 1: Stage mode: 'count' | 'value'
  const [stageMetricMode, setStageMetricMode] = useState<'count' | 'value'>('count');
  // Graph 2: Directorate sorting
  const [directorateMetricMode, setDirectorateMetricMode] = useState<'value' | 'projects'>('value');
  // Active tooltips
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [hoveredDirectorate, setHoveredDirectorate] = useState<string | null>(null);
  const [hoveredSra, setHoveredSra] = useState<string | null>(null);
  const [hoveredSdp, setHoveredSdp] = useState<string | null>(null);

  // Maximum calculations for bar sizing
  const maxStageCount = Math.max(...stageData.map((s) => s.initiatives.length), 1);
  const maxStageValue = Math.max(...stageData.map((s) => s.totalCost), 1);

  const maxDirectorateVolume = Math.max(...directorateData.map((d) => d.totalVolume), 1);
  const maxDirectorateProjects = Math.max(...directorateData.map((d) => d.totalProjects), 1);

  const maxSraValue = Math.max(...sraData.map((s) => s.totalCost), 1);
  const maxSraCount = Math.max(...sraData.map((s) => s.count), 1);

  const maxSdpValue = Math.max(...sdpData.map((s) => s.totalCost), 1);
  const maxSdpCount = Math.max(...sdpData.map((s) => s.count), 1);

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Strategic Portfolio Visual Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual distribution across lifecycle stages, directorate investments, Agenda 2063 SRAs, and Strategic Delivery Pathways.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Interactive: Click or hover bars for detailed breakdowns</span>
        </div>
      </div>

      {/* 2x2 Responsive Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* GRAPH 1: Pipeline Initiatives by Stage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pipeline Initiatives by Stage
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Distribution of {totalCount} initiatives across 7 statutory lifecycle gates
                  </span>
                </div>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
                <button
                  onClick={() => setStageMetricMode('count')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    stageMetricMode === 'count'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Initiatives Count
                </button>
                <button
                  onClick={() => setStageMetricMode('value')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    stageMetricMode === 'value'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Value ($M)
                </button>
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="pt-4">
              <div className="h-56 flex items-end justify-between gap-2 px-2 relative">
                {/* Horizontal guide lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-slate-200 border-dashed w-full" />
                  <div className="border-b border-slate-200 border-dashed w-full" />
                  <div className="border-b border-slate-200 border-dashed w-full" />
                  <div className="border-b border-slate-200 w-full" />
                </div>

                {stageData.map((stg) => {
                  const isHovered = hoveredStage === stg.code;
                  const isSelected = selectedStage === String(stg.code);
                  const count = stg.initiatives.length;
                  const val = stg.totalCost;
                  const colors = STAGE_COLORS[stg.code] || STAGE_COLORS[0];

                  const heightPercent =
                    stageMetricMode === 'count'
                      ? (count / maxStageCount) * 88 + 8
                      : (val / maxStageValue) * 88 + 8;

                  return (
                    <div
                      key={stg.code}
                      onMouseEnter={() => setHoveredStage(stg.code)}
                      onMouseLeave={() => setHoveredStage(null)}
                      onClick={() => onSelectStage(isSelected ? 'all' : String(stg.code))}
                      className="flex-1 flex flex-col items-center h-full justify-end relative cursor-pointer group z-10"
                    >
                      {/* Bar Value Header Callout */}
                      <span className="text-[10px] font-mono font-bold text-slate-700 mb-1 opacity-90 transition-transform group-hover:scale-110">
                        {stageMetricMode === 'count' ? count : formatCurrency(val, 'USD')}
                      </span>

                      {/* Bar Pillar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 relative ${
                          isSelected
                            ? 'ring-2 ring-emerald-500 shadow-md'
                            : isHovered
                            ? 'brightness-110 shadow-md scale-y-[1.02]'
                            : 'opacity-90'
                        }`}
                      >
                        <div
                          className="w-full h-full rounded-t-lg transition-colors"
                          style={{
                            backgroundColor: colors.fill,
                            backgroundImage: `linear-gradient(to top, ${colors.fill}, #ffffff25)`
                          }}
                        />

                        {/* Secondary value indicator inside bar */}
                        {heightPercent > 45 && (
                          <div className="absolute inset-x-0 bottom-1 text-center text-[9px] font-bold text-white font-mono drop-shadow">
                            {stageMetricMode === 'count'
                              ? formatCurrency(val, 'USD')
                              : `${count} init.`}
                          </div>
                        )}
                      </div>

                      {/* X-Axis Stage Label */}
                      <div className="mt-2 text-center">
                        <span
                          className={`text-[10px] font-bold block truncate max-w-[50px] transition-colors ${
                            isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-600'
                          }`}
                          title={stg.label}
                        >
                          S{stg.code}
                        </span>
                        <span className="text-[9px] text-slate-400 block truncate max-w-[50px]">
                          {stg.shortName}
                        </span>
                      </div>

                      {/* Tooltip on Hover */}
                      {isHovered && (
                        <div className="absolute bottom-full mb-2 z-30 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl w-48 pointer-events-none border border-slate-700 -translate-x-1/4">
                          <div className="font-bold text-emerald-400 text-xs">{stg.label}</div>
                          <div className="mt-1.5 space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between text-slate-300">
                              <span>Initiatives:</span>
                              <strong className="text-white">{count} ({totalCount > 0 ? Math.round((count / totalCount) * 100) : 0}%)</strong>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Value:</span>
                              <strong className="text-white">{formatCurrency(val, 'USD')}</strong>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Avg Dwell:</span>
                              <strong className="text-white">{stg.avgDays} days</strong>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Target SLA:</span>
                              <strong className="text-white">{stg.slaTarget} days</strong>
                            </div>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                            Click to filter table by Stage {stg.code}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Highest Concentration: <strong className="text-slate-800">
                Stage {stageData.reduce((prev, curr) => (curr.initiatives.length > prev.initiatives.length ? curr : prev), stageData[0]).code} (
                {Math.max(...stageData.map((s) => s.initiatives.length))} initiatives)
              </strong>
            </span>
            <span className="font-mono text-[11px] text-emerald-700 font-bold">
              Total Volume: {formatCurrency(totalVolume, 'USD')}
            </span>
          </div>
        </div>

        {/* GRAPH 2: Investment by Directorate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Investment by Directorate
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Capital allocation across continental executive portfolios
                  </span>
                </div>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
                <button
                  onClick={() => setDirectorateMetricMode('value')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    directorateMetricMode === 'value'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Capital Volume ($)
                </button>
                <button
                  onClick={() => setDirectorateMetricMode('projects')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    directorateMetricMode === 'projects'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Projects Count
                </button>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="pt-3 space-y-2.5">
              {directorateData.map((d, idx) => {
                const isHovered = hoveredDirectorate === d.directorate;
                const isSelected = selectedDirectorate === d.directorate;
                const percentOfTotal = totalVolume > 0 ? Math.round((d.totalVolume / totalVolume) * 100) : 0;
                const barWidth =
                  directorateMetricMode === 'value'
                    ? (d.totalVolume / maxDirectorateVolume) * 100
                    : (d.totalProjects / maxDirectorateProjects) * 100;
                const color = DIRECTORATE_COLORS[idx % DIRECTORATE_COLORS.length];

                return (
                  <div
                    key={d.directorate}
                    onMouseEnter={() => setHoveredDirectorate(d.directorate)}
                    onMouseLeave={() => setHoveredDirectorate(null)}
                    onClick={() => onSelectDirectorate(isSelected ? 'all' : d.directorate)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border border-teal-300'
                        : isHovered
                        ? 'bg-slate-50 border border-slate-200'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-slate-800 truncate" title={d.directorate}>
                          {d.directorate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(d.totalVolume, 'USD')}
                        </span>
                        <span className="text-slate-400">({percentOfTotal}%)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-sans">
                          {d.totalProjects} proj.
                        </span>
                      </div>
                    </div>

                    {/* Bar track */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.max(barWidth, 3)}%`,
                          backgroundColor: color
                        }}
                        className="h-full rounded-full transition-all duration-500 ease-out"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Leading Directorate:{' '}
              <strong className="text-slate-800 truncate max-w-[200px] inline-block align-bottom">
                {directorateData[0]?.directorate || 'N/A'}
              </strong>
            </span>
            <span className="font-mono text-teal-700 font-bold text-[11px]">
              Top Envelope: {formatCurrency(directorateData[0]?.totalVolume || 0, 'USD')}
            </span>
          </div>
        </div>

        {/* GRAPH 3: Projects by SRA and their Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Projects by SRA & Strategic Value
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Agenda 2063 7 Strategic Result Areas allocation
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Agenda 2063
              </span>
            </div>

            {/* List with dual indicator: Value bar + project badge */}
            <div className="pt-3 space-y-2.5">
              {sraData.map((s, idx) => {
                const isHovered = hoveredSra === s.sra;
                const isSelected = selectedSra === s.sra;
                const barWidth = (s.totalCost / maxSraValue) * 100;
                const color = SRA_COLORS[idx % SRA_COLORS.length];
                const pct = totalVolume > 0 ? Math.round((s.totalCost / totalVolume) * 100) : 0;

                // Extract short SRA tag (e.g. SRA 1, SRA 2...)
                const sraTag = s.sra.split('–')[0].trim();
                const sraDesc = s.sra.split('–')[1]?.trim() || s.sra;

                return (
                  <div
                    key={s.sra}
                    onMouseEnter={() => setHoveredSra(s.sra)}
                    onMouseLeave={() => setHoveredSra(null)}
                    onClick={() => onSelectSra(isSelected ? 'all' : s.sra)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-300'
                        : isHovered
                        ? 'bg-slate-50 border border-slate-200'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {sraTag}
                        </span>
                        <span className="font-semibold text-slate-800 truncate" title={s.sra}>
                          {sraDesc}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(s.totalCost, 'USD')}
                        </span>
                        <span className="text-slate-400">({pct}%)</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                          {s.count} {s.count === 1 ? 'proj' : 'projs'}
                        </span>
                      </div>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.max(barWidth, s.count > 0 ? 3 : 0)}%`,
                          backgroundColor: color
                        }}
                        className="h-full rounded-full transition-all duration-500 ease-out"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Primary SRA Alignment:{' '}
              <strong className="text-slate-800">
                {sraData.reduce((prev, curr) => (curr.totalCost > prev.totalCost ? curr : prev), sraData[0])?.sra.split('–')[0] || 'SRA 1'}
              </strong>
            </span>
            <span className="text-indigo-700 font-bold font-mono text-[11px]">
              {sraData.reduce((acc, curr) => acc + curr.count, 0)} Total SRA Mappings
            </span>
          </div>
        </div>

        {/* GRAPH 4: Projects by SDP and their Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Projects by SDP & Delivery Value
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Operational alignment to Strategic Delivery Pathways
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Delivery Pathways
              </span>
            </div>

            {/* List with SDP items */}
            <div className="pt-3 space-y-2.5">
              {sdpData.map((sdpItem, idx) => {
                const isHovered = hoveredSdp === sdpItem.sdp;
                const barWidth = (sdpItem.totalCost / maxSdpValue) * 100;
                const color = SDP_COLORS[idx % SDP_COLORS.length];
                const pct = totalVolume > 0 ? Math.round((sdpItem.totalCost / totalVolume) * 100) : 0;

                const sdpTag = sdpItem.sdp.split('–')[0].trim();
                const sdpDesc = sdpItem.sdp.split('–')[1]?.trim() || sdpItem.sdp;

                return (
                  <div
                    key={sdpItem.sdp}
                    onMouseEnter={() => setHoveredSdp(sdpItem.sdp)}
                    onMouseLeave={() => setHoveredSdp(null)}
                    className={`p-2 rounded-xl transition-all ${
                      isHovered
                        ? 'bg-amber-50/70 border border-amber-200 shadow-2xs'
                        : 'hover:bg-slate-50/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {sdpTag}
                        </span>
                        <span className="font-semibold text-slate-800 truncate" title={sdpItem.sdp}>
                          {sdpDesc}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(sdpItem.totalCost, 'USD')}
                        </span>
                        <span className="text-slate-400">({pct}%)</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          {sdpItem.count} {sdpItem.count === 1 ? 'proj' : 'projs'}
                        </span>
                      </div>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.max(barWidth, sdpItem.count > 0 ? 4 : 0)}%`,
                          backgroundColor: color
                        }}
                        className="h-full rounded-full transition-all duration-500 ease-out"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Primary Delivery Vehicle:{' '}
              <strong className="text-slate-800">
                {sdpData.reduce((prev, curr) => (curr.totalCost > prev.totalCost ? curr : prev), sdpData[0])?.sdp.split('–')[0] || 'SDP 1'}
              </strong>
            </span>
            <span className="text-amber-800 font-bold font-mono text-[11px]">
              {sdpData.reduce((acc, curr) => acc + curr.count, 0)} Total SDP Allocations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
