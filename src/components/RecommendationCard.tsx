import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  Zap, 
  BookmarkCheck,
  ArrowUpRight
} from 'lucide-react';
import { DecisionCalculationOutput, FarmerInputState } from '../types';

interface RecommendationCardProps {
  decision: DecisionCalculationOutput;
  inputState: FarmerInputState;
  currencySymbol: string;
  onSaveDecision: () => void;
  isSaved?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  decision,
  inputState,
  currencySymbol,
  onSaveDecision,
  isSaved = false
}) => {
  const { recommendation } = decision;
  const isWait = recommendation.action === 'WAIT';

  const riskPillActive = {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3
  }[recommendation.riskLevel];

  return (
    <div className="space-y-4">
      {/* Primary Geometric Banner */}
      <div className={`rounded-lg p-6 sm:p-7 text-white shadow-lg relative overflow-hidden transition-all ${
        isWait 
          ? 'bg-slate-900 shadow-slate-900/10 border border-slate-800' 
          : 'bg-emerald-600 shadow-emerald-900/10'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/15">
          <div>
            <span className="inline-block px-2.5 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
              Optimization Verdict
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isWait ? (
                `WAIT & SELL IN ${recommendation.optimalWaitWeeks} WEEKS`
              ) : (
                'SELL HARVEST IMMEDIATELY (NOW)'
              )}
            </h2>
            <p className="text-xs text-white/80 mt-1 font-medium">
              Calculated via full logistics cost, cold-chain storage rates, spoilage decay, and ML price forecasting.
            </p>
          </div>

          {/* Controls: Risk Meter & Save Action */}
          <div className="flex items-center gap-3">
            {/* Geometric Risk Meter */}
            <div className="bg-black/25 px-3 py-2 rounded border border-white/10 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/90">
                <span>Risk Level</span>
                <span className="font-extrabold">{recommendation.riskLevel}</span>
              </div>
              <div className="flex gap-1 mt-0.5">
                <div className={`h-1.5 w-5 rounded-full ${riskPillActive >= 1 ? 'bg-emerald-300' : 'bg-white/20'}`} />
                <div className={`h-1.5 w-5 rounded-full ${riskPillActive >= 2 ? 'bg-amber-300' : 'bg-white/20'}`} />
                <div className={`h-1.5 w-5 rounded-full ${riskPillActive >= 3 ? 'bg-rose-400' : 'bg-white/20'}`} />
              </div>
            </div>

            {/* Save Button */}
            <button
              id="btn-save-decision"
              type="button"
              onClick={onSaveDecision}
              disabled={isSaved}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-bold transition-all shadow-xs ${
                isSaved 
                  ? 'bg-white/20 text-white/60 cursor-default'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved' : 'Save Scenario'}</span>
            </button>
          </div>
        </div>

        {/* Highlight Summary Statement */}
        <div className="pt-4 flex items-center justify-between text-xs">
          <span className="text-white/90 font-semibold">
            {isWait 
              ? `Optimal Target: ${recommendation.bestMarket.name} (${recommendation.bestMarket.distanceKm} km) in ${recommendation.optimalWaitWeeks} weeks`
              : `Optimal Target: ${recommendation.bestMarket.name} (${recommendation.bestMarket.distanceKm} km) at current spot price`}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white uppercase tracking-wider">
            +{recommendation.deltaPercent}% Advantage <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Geometric Metric Ticker Strip */}
      <div className="bg-slate-900 rounded-lg p-5 text-white grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 border border-slate-800">
        {/* Metric 1 */}
        <div className="pb-3 sm:pb-0 sm:px-4 first:pl-0">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Max Expected Net Profit
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {currencySymbol} {recommendation.expectedNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
            {currencySymbol} {(recommendation.expectedNetProfit / (inputState.yieldAmount || 1)).toFixed(2)} / {inputState.yieldUnit}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="py-3 sm:py-0 sm:px-4">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            Selected Destination
          </div>
          <div className="text-lg font-bold text-white tracking-tight truncate">
            {recommendation.bestMarket.name}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {recommendation.bestMarket.distanceKm} km • {recommendation.bestMarket.location}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="pt-3 sm:pt-0 sm:px-4 last:pr-0">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Net Profit Delta vs Alt
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-400">
            +{currencySymbol} {recommendation.netProfitDelta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Net gain over alternative strategy
          </p>
        </div>
      </div>

      {/* Decision Rationale Box */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            Decision Logic & Economic Rationale
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {recommendation.primaryReason}
          </p>
        </div>

        {/* Why Not Highest Nominal Price */}
        {recommendation.whyNotHighestPriceMarket && (
          <div className="p-3.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5 text-amber-950">
                  Critical Trade-Off: Why Nominal Highest Quoted Price Was Excluded
                </span>
                <p className="text-amber-900/90 leading-relaxed font-medium">
                  {recommendation.whyNotHighestPriceMarket}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quantitative Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {recommendation.detailedPoints.map((pt, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="leading-tight font-medium">{pt}</span>
            </div>
          ))}
        </div>

        {/* Risk Factors */}
        {recommendation.riskFactors.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitored Risk Variables:</span>
            {recommendation.riskFactors.map((rf, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                {rf}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
