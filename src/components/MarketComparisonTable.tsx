import React, { useState } from 'react';
import { 
  Building2, 
  ArrowUpDown, 
  MapPin, 
  Crown
} from 'lucide-react';
import { MarketCalculationItem, FarmerInputState } from '../types';

interface MarketComparisonTableProps {
  markets: MarketCalculationItem[];
  inputState: FarmerInputState;
  currencySymbol: string;
}

type SortField = 'netProfit' | 'grossRevenue' | 'transportCost' | 'distanceKm' | 'pricePerUnit' | 'profitMarginPct';
type ViewMode = 'both' | 'sellNow' | 'wait';

export const MarketComparisonTable: React.FC<MarketComparisonTableProps> = ({
  markets,
  inputState,
  currencySymbol
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [sortField, setSortField] = useState<SortField>('netProfit');
  const [sortAsc, setSortAsc] = useState(false);
  const [showExcluded, setShowExcluded] = useState(true);

  const filteredMarkets = markets.filter(m => showExcluded || m.isAvailable);

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    const useWait = viewMode === 'wait';

    if (sortField === 'netProfit') {
      valA = useWait ? a.wait.netProfit : a.sellNow.netProfit;
      valB = useWait ? b.wait.netProfit : b.sellNow.netProfit;
    } else if (sortField === 'grossRevenue') {
      valA = useWait ? a.wait.grossRevenue : a.sellNow.grossRevenue;
      valB = useWait ? b.wait.grossRevenue : b.sellNow.grossRevenue;
    } else if (sortField === 'transportCost') {
      valA = useWait ? a.wait.transportCost : a.sellNow.transportCost;
      valB = useWait ? b.wait.transportCost : b.sellNow.transportCost;
    } else if (sortField === 'distanceKm') {
      valA = a.distanceKm;
      valB = b.distanceKm;
    } else if (sortField === 'pricePerUnit') {
      valA = useWait ? a.wait.pricePerUnit : a.sellNow.pricePerUnit;
      valB = useWait ? b.wait.pricePerUnit : b.sellNow.pricePerUnit;
    } else if (sortField === 'profitMarginPct') {
      valA = useWait ? a.wait.profitMarginPct : a.sellNow.profitMarginPct;
      valB = useWait ? b.wait.profitMarginPct : b.sellNow.profitMarginPct;
    }

    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden space-y-0">
      {/* Geometric Header */}
      <div className="p-5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Comparison Matrix
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Multi-Market Net Profit Audit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare revenues, freight, handling, storage, and spoilage losses across regional mandis.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Segmented Control */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              id="tbl-view-both"
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-3 py-1 rounded transition-all ${
                viewMode === 'both' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              id="tbl-view-now"
              type="button"
              onClick={() => setViewMode('sellNow')}
              className={`px-3 py-1 rounded transition-all ${
                viewMode === 'sellNow' ? 'bg-emerald-600 text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              Sell Now
            </button>
            <button
              id="tbl-view-wait"
              type="button"
              onClick={() => setViewMode('wait')}
              className={`px-3 py-1 rounded transition-all ${
                viewMode === 'wait' ? 'bg-slate-900 text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              Wait ({inputState.waitDurationWeeks}w)
            </button>
          </div>

          {/* Show / Hide Excluded */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 px-2.5 py-1 rounded border border-slate-200 font-medium">
            <input
              type="checkbox"
              checked={showExcluded}
              onChange={(e) => setShowExcluded(e.target.checked)}
              className="rounded text-emerald-600 accent-emerald-600 focus:ring-0"
            />
            <span>Show Excluded</span>
          </label>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4 min-w-[180px]">Market & Location</th>
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('distanceKm')}
              >
                <div className="flex items-center gap-1">
                  <span>Distance</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('pricePerUnit')}
              >
                <div className="flex items-center gap-1">
                  <span>Quoted Price</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('grossRevenue')}
              >
                <div className="flex items-center gap-1">
                  <span>Gross Revenue</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('transportCost')}
              >
                <div className="flex items-center gap-1">
                  <span>Transport</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">Handling</th>
              {(viewMode === 'wait' || viewMode === 'both') && (
                <>
                  <th className="py-3 px-3">Storage</th>
                  <th className="py-3 px-3">Spoilage</th>
                </>
              )}
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right bg-slate-100/60"
                onClick={() => handleSort('netProfit')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Expected Net Profit</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Margin</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedMarkets.map((m) => {
              const isBest = m.isOverallBest;
              const isAvailable = m.isAvailable;

              return (
                <tr 
                  key={m.marketId}
                  className={`transition-colors ${
                    !isAvailable 
                      ? 'bg-slate-50/40 text-slate-400 opacity-60' 
                      : isBest 
                        ? 'bg-emerald-50/50 hover:bg-emerald-50/80 font-medium' 
                        : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {/* Market & Location */}
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2">
                      {isBest && (
                        <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {m.marketName}
                          {isBest && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                              Optimal
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {m.location}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Distance */}
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {m.distanceKm} km
                  </td>

                  {/* Quoted Price */}
                  <td className="py-3 px-3">
                    {viewMode === 'both' ? (
                      <div>
                        <span className="text-slate-900 font-bold block">
                          Now: {currencySymbol} {m.sellNow.pricePerUnit.toFixed(2)}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Wait: {currencySymbol} {m.wait.pricePerUnit.toFixed(2)}
                        </span>
                      </div>
                    ) : viewMode === 'sellNow' ? (
                      <span className="font-bold text-slate-900">
                        {currencySymbol} {m.sellNow.pricePerUnit.toFixed(2)}
                      </span>
                    ) : (
                      <span className="font-bold text-slate-900">
                        {currencySymbol} {m.wait.pricePerUnit.toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Gross Revenue */}
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {isAvailable ? (
                      viewMode === 'both' ? (
                        <div>
                          <span>Now: {currencySymbol} {m.sellNow.grossRevenue.toLocaleString()}</span>
                          <span className="text-slate-400 text-[11px] block">
                            Wait: {currencySymbol} {m.wait.grossRevenue.toLocaleString()}
                          </span>
                        </div>
                      ) : viewMode === 'sellNow' ? (
                        `${currencySymbol} ${m.sellNow.grossRevenue.toLocaleString()}`
                      ) : (
                        `${currencySymbol} ${m.wait.grossRevenue.toLocaleString()}`
                      )
                    ) : '—'}
                  </td>

                  {/* Transport Cost */}
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {isAvailable ? (
                      viewMode === 'both' ? (
                        <div>
                          <span>-{currencySymbol} {m.sellNow.transportCost.toLocaleString()}</span>
                          <span className="text-slate-400 text-[11px] block">
                            Wait: -{currencySymbol} {m.wait.transportCost.toLocaleString()}
                          </span>
                        </div>
                      ) : viewMode === 'sellNow' ? (
                        `-${currencySymbol} ${m.sellNow.transportCost.toLocaleString()}`
                      ) : (
                        `-${currencySymbol} ${m.wait.transportCost.toLocaleString()}`
                      )
                    ) : '—'}
                  </td>

                  {/* Handling Cost */}
                  <td className="py-3 px-3 text-slate-600">
                    {isAvailable ? `-${currencySymbol} ${m.sellNow.handlingCost.toLocaleString()}` : '—'}
                  </td>

                  {/* Storage Cost (Wait) */}
                  {(viewMode === 'wait' || viewMode === 'both') && (
                    <td className="py-3 px-3 text-amber-700 font-medium">
                      {isAvailable ? `-${currencySymbol} ${m.wait.storageCost.toLocaleString()}` : '—'}
                    </td>
                  )}

                  {/* Spoilage Loss (Wait) */}
                  {(viewMode === 'wait' || viewMode === 'both') && (
                    <td className="py-3 px-3 text-rose-600 font-medium">
                      {isAvailable ? `-${currencySymbol} ${m.wait.spoilageLoss.toLocaleString()}` : '—'}
                    </td>
                  )}

                  {/* Net Profit (Highlighted) */}
                  <td className="py-3 px-4 text-right bg-slate-50/50">
                    {isAvailable ? (
                      viewMode === 'both' ? (
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            Now: {currencySymbol} {m.sellNow.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div className={`text-xs font-bold ${m.deltaNetProfit >= 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                            Wait: {currencySymbol} {m.wait.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ) : viewMode === 'sellNow' ? (
                        <span className="text-sm font-bold text-slate-900">
                          {currencySymbol} {m.sellNow.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-slate-900">
                          {currencySymbol} {m.wait.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400 font-semibold italic">Excluded</span>
                    )}
                  </td>

                  {/* Profit Margin % */}
                  <td className="py-3 px-3 text-right font-bold text-slate-700">
                    {isAvailable ? (
                      viewMode === 'wait' ? `${m.wait.profitMarginPct}%` : `${m.sellNow.profitMarginPct}%`
                    ) : '—'}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    {isAvailable ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider cursor-help"
                        title={m.unavailabilityReason || 'Market unavailable'}
                      >
                        Excluded
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
