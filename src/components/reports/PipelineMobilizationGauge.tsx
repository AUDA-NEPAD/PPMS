import React from 'react';
import { Target, TrendingUp, Sparkles, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PipelineMobilizationGaugeProps {
  currentValue: number; // in USD
  targetValue?: number; // default 1,000,000,000 (1 Billion)
  totalInitiatives: number;
  approvedVolume?: number;
  incubationVolume?: number;
  currency?: string;
  onFilterClick?: () => void;
}

export const PipelineMobilizationGauge: React.FC<PipelineMobilizationGaugeProps> = ({
  currentValue,
  targetValue = 1_000_000_000, // 1 Billion USD
  totalInitiatives,
  currency = 'USD'
}) => {
  // Calculations
  const progressRatio = Math.max(0, currentValue / targetValue);
  const progressPercentage = (progressRatio * 100).toFixed(1);
  const clampedRatio = Math.min(progressRatio, 1);
  const remainingValue = Math.max(0, targetValue - currentValue);
  const isTargetAchieved = currentValue >= targetValue;

  // Geometry for 180-degree semi-circle gauge
  const width = 240;
  const height = 120;
  const cx = 120;
  const cy = 104;
  const radius = 78;
  const strokeWidth = 12;
  const arcLength = Math.PI * radius; // ~245.04
  const strokeDashoffset = arcLength * (1 - clampedRatio);

  // Indicator dot position at current progress
  const dotAngle = Math.PI - clampedRatio * Math.PI;
  const dotX = cx + radius * Math.cos(dotAngle);
  const dotY = cy - radius * Math.sin(dotAngle);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50/80 to-emerald-50/30 p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group">
      {/* Decorative subtle ambient luxury glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-emerald-200/30 to-teal-300/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shadow-emerald-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                Total Pipeline Value
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                Target: $1.0B
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Value mobilized progress</p>
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs ${
            isTargetAchieved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
          }`}
        >
          {isTargetAchieved ? (
            <>
              <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>Target Met</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="tabular-nums font-extrabold">{progressPercentage}%</span>
            </>
          )}
        </div>
      </div>

      {/* Light & Fancy Compact Gauge Graphic */}
      <div className="relative flex flex-col items-center justify-center my-1.5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[215px] overflow-visible drop-shadow-xs"
        >
          <defs>
            {/* Multi-stop vibrant luxury emerald & teal gradient */}
            <linearGradient id="fancyLightGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="35%" stopColor="#0d9488" />
              <stop offset="70%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Subtle soft drop-shadow for the indicator dot */}
            <filter id="fancyGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#059669" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Outer Soft Ring */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
          />

          {/* Background Track Inner */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Subtle tick markers at 25%, 50%, 75% for sophistication */}
          {[0.25, 0.5, 0.75].map((tickRatio, idx) => {
            const angle = Math.PI - tickRatio * Math.PI;
            const innerR = radius - 9;
            const outerR = radius - 4;
            const x1 = cx + innerR * Math.cos(angle);
            const y1 = cy - innerR * Math.sin(angle);
            const x2 = cx + outerR * Math.cos(angle);
            const y2 = cy - outerR * Math.sin(angle);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Active Progress Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#fancyLightGaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Glowing Indicator Dot at Head of Arc */}
          {clampedRatio > 0 && (
            <g filter="url(#fancyGlow)">
              <circle
                cx={dotX}
                cy={dotY}
                r="6"
                fill="#ffffff"
                stroke="#059669"
                strokeWidth="2.5"
              />
              <circle
                cx={dotX}
                cy={dotY}
                r="2"
                fill="#10b981"
              />
            </g>
          )}

          {/* Arc Origin & Target Limit Labels */}
          <text
            x={cx - radius}
            y={cy + 13}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="9"
            fontWeight="700"
          >
            $0
          </text>
          <text
            x={cx + radius}
            y={cy + 13}
            textAnchor="middle"
            fill="#059669"
            fontSize="9"
            fontWeight="700"
          >
            $1.0B
          </text>

          {/* Core Mobilized Value Highlight */}
          <text
            x={cx}
            y={cy - 21}
            textAnchor="middle"
            fill="#0f172a"
            fontSize="18"
            fontWeight="900"
            letterSpacing="-0.02em"
          >
            {formatCurrency(currentValue, currency)}
          </text>
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill="#64748b"
            fontSize="9.5"
            fontWeight="600"
            letterSpacing="0.01em"
          >
            Mobilized of $1.0B Target
          </text>
        </svg>
      </div>

      {/* Light & Fancy Bottom Metric Summary Bar */}
      <div className="relative flex items-center justify-between text-[11px] pt-2.5 border-t border-slate-100 bg-slate-50/60 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span><strong className="text-slate-800 font-bold">{totalInitiatives}</strong> Initiatives Active</span>
        </div>

        <div>
          {isTargetAchieved ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full text-[10px]">
              <Award className="w-3 h-3 text-emerald-600" />
              +{formatCurrency(currentValue - targetValue, currency)} surplus
            </span>
          ) : (
            <span className="text-slate-500">
              Gap: <strong className="text-slate-800 font-bold">{formatCurrency(remainingValue, currency)}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
