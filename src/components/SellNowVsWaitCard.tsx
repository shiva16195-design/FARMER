import React from 'react';
import { 
  Zap, 
  Clock, 
  Scale, 
  TrendingUp, 
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { DecisionCalculationOutput, FarmerInputState } from '../types';

interface SellNowVsWaitCardProps {
  decision: DecisionCalculationOutput;
  inputState: FarmerInputState;
  onChangeWaitDuration: (weeks: number) => void;
  currencySymbol: string;
}

export const SellNowVsWaitCard: React.FC<SellNowVsWaitCardProps> = ({
  decision,
  inputState,
  onChangeWaitDuration,
  currencySymbol
}) => {
  const { bestSellNowMarket, bestWaitMarket, recommendation } = decision;

  if (!bestSellNowMarket || !bestWaitMarket) return null;

  const isWaitRecommended = recommendation.action === 'WAIT';
  const profitDelta = bestWaitMarket.wait.netProfit - bestSellNowMarket.sellNow.netProfit;
  const isPositiveDelta = profitDelta > 0;

  // Visual balance ratios
  const maxProfit = Math.max(bestSellNowMarket.sellNow.netProfit, bestWaitMarket.wait.netProfit, 1);
  const nowBarPct = Math.max(5, Math.min(100, Math.round((bestSellNowMarket.sellNow.netProfit / maxProfit) * 100)));
  const waitBarPct = Math.max(5, Math.min(100, Math.round((bestWaitMarket.wait.netProfit / maxProfit) * 100)));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 space-y-5">
      {/* Geometric Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            Decision Matrix
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Sell Now vs. Wait Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Spot liquidation vs. multi-week holding & cold storage economics.
          </p>
        </div>

        {/* Quick Horizon Slider */}
        <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Horizon:
          </span>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={inputState.waitDurationWeeks}
            onChange={(e) => onChangeWaitDuration(Number(e.target.value))}
            className="w-20 accent-slate-800 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-900 w-10 text-right">
            {inputState.waitDurationWeeks}w
          </span>
        </div>
      </div>

      {/* Geometric Ratio Progress Comparison */}
      <div className="bg-slate-50 rounded p-4 border border-slate-200 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Sell Now (Immediate)
            </span>
            <span>{currencySymbol} {bestSellNowMarket.sellNow.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${!isWaitRecommended ? 'bg-emerald-600' : 'bg-slate-400'}`}
              style={{ width: `${nowBarPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Wait {inputState.waitDurationWeeks} Weeks
            </span>
            <span>{currencySymbol} {bestWaitMarket.wait.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isWaitRecommended ? 'bg-emerald-600' : 'bg-slate-400'}`}
              style={{ width: `${waitBarPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* OPTION A: SELL NOW */}
        <div className={`rounded-lg p-5 border transition-all ${
          !isWaitRecommended 
            ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-sm flex items-center justify-center font-bold text-xs ${
                !isWaitRecommended ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Option A
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Sell Immediately (Now)
                </h3>
              </div>
            </div>

            {!isWaitRecommended && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                Recommended
              </span>
            )}
          </div>

          {/* Details */}
          <div className="mt-3 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Optimal Market</span>
              <strong className="text-slate-900 font-bold">{bestSellNowMarket.marketName}</strong>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Spot Unit Price</span>
              <span className="font-bold text-slate-800">{currencySymbol} {bestSellNowMarket.sellNow.pricePerUnit.toFixed(2)} / {inputState.yieldUnit}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Gross Revenue</span>
              <span className="font-bold text-slate-900">{currencySymbol} {bestSellNowMarket.sellNow.grossRevenue.toLocaleString()}</span>
            </div>

            <div className="space-y-1 pt-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200/60">
              <div className="flex justify-between">
                <span>• Transport ({bestSellNowMarket.distanceKm} km)</span>
                <span>-{currencySymbol} {bestSellNowMarket.sellNow.transportCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>• Handling & Loading</span>
                <span>-{currencySymbol} {bestSellNowMarket.sellNow.handlingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>• Storage Cost (0 wks)</span>
                <span>{currencySymbol} 0.00</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>• Spoilage Loss (0%)</span>
                <span>{currencySymbol} 0.00</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-baseline border-t border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Profit</span>
                <span className="text-xs text-emerald-700 font-bold">{bestSellNowMarket.sellNow.profitMarginPct}% Margin</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {currencySymbol} {bestSellNowMarket.sellNow.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* OPTION B: WAIT & STORE */}
        <div className={`rounded-lg p-5 border transition-all ${
          isWaitRecommended 
            ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-sm flex items-center justify-center font-bold text-xs ${
                isWaitRecommended ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Option B
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Wait {inputState.waitDurationWeeks} Weeks & Store
                </h3>
              </div>
            </div>

            {isWaitRecommended && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                Recommended
              </span>
            )}
          </div>

          {/* Details */}
          <div className="mt-3 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Optimal Future Market</span>
              <strong className="text-slate-900 font-bold">{bestWaitMarket.marketName}</strong>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Predicted Future Price</span>
              <span className="font-bold text-slate-900">{currencySymbol} {bestWaitMarket.wait.pricePerUnit.toFixed(2)} / {inputState.yieldUnit}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Gross Revenue</span>
              <span className="font-bold text-slate-900">{currencySymbol} {bestWaitMarket.wait.grossRevenue.toLocaleString()}</span>
            </div>

            <div className="space-y-1 pt-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200/60">
              <div className="flex justify-between">
                <span>• Transport ({bestWaitMarket.distanceKm} km)</span>
                <span>-{currencySymbol} {bestWaitMarket.wait.transportCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>• Handling & Loading</span>
                <span>-{currencySymbol} {bestWaitMarket.wait.handlingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-medium">
                <span>• Storage Fee ({inputState.waitDurationWeeks} wks)</span>
                <span>-{currencySymbol} {bestWaitMarket.wait.storageCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-medium">
                <span>• Spoilage Loss ({bestWaitMarket.wait.spoilageUnits} units)</span>
                <span>-{currencySymbol} {bestWaitMarket.wait.spoilageLoss.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-baseline border-t border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Profit</span>
                <span className="text-xs text-slate-700 font-bold">{bestWaitMarket.wait.profitMarginPct}% Margin</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {currencySymbol} {bestWaitMarket.wait.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Advantage Banner */}
      <div className={`p-4 rounded flex items-center justify-between text-xs font-bold ${
        isPositiveDelta 
          ? 'bg-slate-900 text-white' 
          : 'bg-emerald-50 text-emerald-950 border border-emerald-200'
      }`}>
        <div className="flex items-center gap-2">
          {isPositiveDelta ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-emerald-600" />}
          <span>
            {isPositiveDelta 
              ? `Waiting ${inputState.waitDurationWeeks} weeks yields +${currencySymbol} ${profitDelta.toLocaleString()} extra net profit.`
              : `Selling today delivers +${currencySymbol} ${Math.abs(profitDelta).toLocaleString()} higher return than waiting.`}
          </span>
        </div>

        <span className="text-[11px] font-medium text-slate-400 hidden sm:inline uppercase tracking-wider">
          Includes freight & cold chain
        </span>
      </div>
    </div>
  );
};
