import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Line, 
  AreaChart, 
  Area, 
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { 
  BarChart3, 
  PieChart, 
  Clock, 
  Sparkles, 
  Scale
} from 'lucide-react';
import { DecisionCalculationOutput, FarmerInputState } from '../types';

interface ChartsSectionProps {
  decision: DecisionCalculationOutput;
  inputState: FarmerInputState;
  currencySymbol: string;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  decision,
  currencySymbol
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'profit_vs_price' | 'cost_breakdown' | 'holding_curve' | 'ml_forecast'>('profit_vs_price');

  const { markets, holdingTimeline, mlPrediction } = decision;
  const availableMarkets = markets.filter(m => m.isAvailable);

  // 1. Data for Net Profit vs Quoted Price
  const profitVsPriceData = availableMarkets.map(m => ({
    name: m.marketName.length > 18 ? `${m.marketName.substring(0, 16)}...` : m.marketName,
    fullName: m.marketName,
    distanceKm: m.distanceKm,
    quotedPriceNow: m.sellNow.pricePerUnit,
    netProfitNow: m.sellNow.netProfit,
    quotedPriceWait: m.wait.pricePerUnit,
    netProfitWait: m.wait.netProfit
  }));

  // 2. Data for Cost Breakdown
  const costBreakdownData = availableMarkets.map(m => ({
    name: m.marketName.length > 18 ? `${m.marketName.substring(0, 16)}...` : m.marketName,
    transportCost: m.wait.transportCost,
    handlingCost: m.wait.handlingCost,
    storageCost: m.wait.storageCost,
    spoilageLoss: m.wait.spoilageLoss,
    totalExpenses: m.wait.totalCost,
    netProfit: m.wait.netProfit
  }));

  // 3. Holding Curve Data
  const holdingCurveData = holdingTimeline.map(h => ({
    weekLabel: h.week === 0 ? 'Now (W0)' : `Wk ${h.week}`,
    weekNum: h.week,
    netProfit: h.netProfit,
    grossRevenue: h.grossRevenue,
    storageCost: h.storageCost,
    spoilageLoss: h.spoilageLoss,
    predictedPrice: h.predictedPrice,
    isOptimal: h.isOptimal
  }));

  // 4. ML Forecast Data
  const mlForecastData = mlPrediction.forecastPoints.map(p => ({
    label: p.dateLabel,
    predictedPrice: p.predictedPrice,
    lowerBound: p.lowerBound,
    upperBound: p.upperBound,
    historical: p.historical
  }));

  const optimalHoldingPoint = holdingTimeline.find(h => h.isOptimal) || holdingTimeline[0];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 space-y-4">
      {/* Header with Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            Decision Analytics
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Economic Simulation & Visual Modeling
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive visual modeling of price elasticity, cost leakage, holding apex, and ML prediction bands.
          </p>
        </div>

        {/* Chart Selector Pills */}
        <div className="flex flex-wrap items-center p-0.5 bg-slate-100 rounded border border-slate-200 text-xs font-semibold text-slate-600">
          <button
            id="chart-tab-profit"
            type="button"
            onClick={() => setActiveChartTab('profit_vs_price')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeChartTab === 'profit_vs_price' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Profit vs. Quoted Price
          </button>

          <button
            id="chart-tab-cost"
            type="button"
            onClick={() => setActiveChartTab('cost_breakdown')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeChartTab === 'cost_breakdown' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Cost Leakage
          </button>

          <button
            id="chart-tab-holding"
            type="button"
            onClick={() => setActiveChartTab('holding_curve')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeChartTab === 'holding_curve' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Holding Apex
          </button>

          <button
            id="chart-tab-ml"
            type="button"
            onClick={() => setActiveChartTab('ml_forecast')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeChartTab === 'ml_forecast' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            ML Forecast Band
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="pt-2">
        {/* CHART 1: Net Profit vs Quoted Price */}
        {activeChartTab === 'profit_vs_price' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-medium">
              <span>Higher quoted prices at distant terminals frequently lose net profit due to transit miles & handling surcharges.</span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={profitVsPriceData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#059669" tick={{ fontSize: 11 }} label={{ value: `Net Profit (${currencySymbol})`, angle: -90, position: 'insideLeft', fill: '#059669', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fontSize: 11 }} label={{ value: `Price / Unit (${currencySymbol})`, angle: 90, position: 'insideRight', fill: '#475569', fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      `${currencySymbol} ${Number(val).toLocaleString()}`,
                      name === 'netProfitNow' ? 'Net Profit (Sell Now)' :
                      name === 'netProfitWait' ? 'Net Profit (Wait)' :
                      name === 'quotedPriceNow' ? 'Quoted Price (Now)' : 'Predicted Price (Wait)'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="netProfitNow" name="Net Profit (Sell Now)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="netProfitWait" name="Net Profit (Wait)" fill="#334155" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="quotedPriceNow" name="Quoted Price (Now)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="quotedPriceWait" name="Predicted Price (Wait)" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Cost Composition Breakdown */}
        {activeChartTab === 'cost_breakdown' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-medium">
              <span>Stacked view of deductions (Transit + Labor Handling + Storage + Spoilage Loss) by destination.</span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costBreakdownData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: `Deductions (${currencySymbol})`, angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${currencySymbol} ${Number(val).toLocaleString()}`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="transportCost" name="Transport Freight" stackId="a" fill="#ef4444" />
                  <Bar dataKey="handlingCost" name="Handling & Loading" stackId="a" fill="#f97316" />
                  <Bar dataKey="storageCost" name="Storage Fee" stackId="a" fill="#eab308" />
                  <Bar dataKey="spoilageLoss" name="Spoilage Loss" stackId="a" fill="#84cc16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: Holding Time Curve (Apex Detector) */}
        {activeChartTab === 'holding_curve' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-500 font-medium">Intersection of commodity price appreciation with storage & spoilage decay.</span>
              <div className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Apex: Week {optimalHoldingPoint.week} ({currencySymbol} {optimalHoldingPoint.netProfit.toLocaleString()})
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={holdingCurveData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="pft" stroke="#059669" tick={{ fontSize: 11 }} label={{ value: `Net Profit (${currencySymbol})`, angle: -90, position: 'insideLeft', fill: '#059669', fontSize: 11 }} />
                  <YAxis yAxisId="cost" orientation="right" stroke="#ef4444" tick={{ fontSize: 11 }} label={{ value: `Holding Costs (${currencySymbol})`, angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${currencySymbol} ${Number(val).toLocaleString()}`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine yAxisId="pft" x={optimalHoldingPoint.week === 0 ? 'Now (W0)' : `Wk ${optimalHoldingPoint.week}`} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'APEX', position: 'top', fill: '#059669', fontWeight: 'bold', fontSize: 10 }} />
                  <Line yAxisId="pft" type="monotone" dataKey="netProfit" name="Net Profit Trajectory" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} />
                  <Area yAxisId="cost" type="monotone" dataKey="storageCost" name="Cumulative Storage Fee" fill="#fef08a" stroke="#eab308" />
                  <Area yAxisId="cost" type="monotone" dataKey="spoilageLoss" name="Cumulative Spoilage Loss" fill="#fecdd3" stroke="#ef4444" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 4: ML Price Forecast & Confidence Band */}
        {activeChartTab === 'ml_forecast' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-500 font-medium">Historical trend + projected spot price trajectory with 95% confidence interval bounds.</span>
              <div className="text-[11px] text-slate-800 font-bold">
                Projected Rate: {currencySymbol} {mlPrediction.predictedFuturePrice.toFixed(2)} ({mlPrediction.expectedChangePct >= 0 ? '+' : ''}{mlPrediction.expectedChangePct}%)
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mlForecastData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: `Price / Unit (${currencySymbol})`, angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${currencySymbol} ${Number(val).toFixed(2)}`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="upperBound" name="95% Upper Bound" stroke="#cbd5e1" fill="#f1f5f9" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="lowerBound" name="95% Lower Bound" stroke="#cbd5e1" fill="#ffffff" fillOpacity={1} />
                  <Line type="monotone" dataKey="predictedPrice" name="ML Predicted Price" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
