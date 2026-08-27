import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FarmerInputState, 
  DecisionCalculationOutput, 
  DecisionHistoryRecord, 
  Currency, 
  YieldUnit, 
  CropPreset,
  MarketItem
} from './types';
import { CROP_PRESETS, DEFAULT_MARKETS, generateHistoricalPriceSeries } from './data/cropPresets';
import { calculateDecisionMetrics } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { RecommendationCard } from './components/RecommendationCard';
import { SellNowVsWaitCard } from './components/SellNowVsWaitCard';
import { MarketComparisonTable } from './components/MarketComparisonTable';
import { ChartsSection } from './components/ChartsSection';
import { MLInsightsPanel } from './components/MLInsightsPanel';
import { AIAdvisorSection } from './components/AIAdvisorSection';
import { FarmerInputForm } from './components/FarmerInputForm';
import { DecisionHistoryModal } from './components/DecisionHistoryModal';
import { SensitivitySimulator } from './components/SensitivitySimulator';
import { 
  Sprout, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Scale, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  BRL: 'R$'
};

export default function App() {
  // Initial default crop preset
  const defaultCrop = CROP_PRESETS[0]; // Tomatoes

  const [inputState, setInputState] = useState<FarmerInputState>(() => ({
    farmLocation: 'Green Valley Agro Estate, Zone 4',
    cropType: defaultCrop.id,
    customCropName: '',
    yieldAmount: defaultCrop.typicalYield,
    yieldUnit: defaultCrop.defaultUnit,
    currency: 'USD',
    transportCostPerKmPerUnit: defaultCrop.defaultTransportPerKm,
    handlingCostPerUnit: defaultCrop.defaultHandlingCost,
    storageCostPerUnitPerWeek: defaultCrop.defaultStorageCostPerWeek,
    storageCapacityUnits: Math.round(defaultCrop.typicalYield * 1.2),
    spoilageRatePerWeekPct: defaultCrop.defaultSpoilageRatePerWeek,
    waitDurationWeeks: 3,
    markets: JSON.parse(JSON.stringify(DEFAULT_MARKETS)),
    historicalPrices: generateHistoricalPriceSeries(defaultCrop.typicalBasePrice),
    mlFactors: {
      seasonalDemandIndex: 1.15,
      regionalSupplyIndex: 0.90, // tighter supply lifts future price
      fuelLogisticsTrend: 1.05,
      rainfallWeatherRisk: 1.10,
      exportDemandSurge: 1.12
    },
    mlModelType: 'random_forest'
  }));

  const [history, setHistory] = useState<DecisionHistoryRecord[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSavedCurrent, setIsSavedCurrent] = useState(false);

  // Fetch initial history from server
  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (data.history) {
          setHistory(data.history);
        }
      })
      .catch(err => console.error('Failed to load history:', err));
  }, []);

  // Compute decision metrics with full zero-latency reactivity
  const decisionResult: DecisionCalculationOutput = useMemo(() => {
    return calculateDecisionMetrics(inputState);
  }, [inputState]);

  // Reset saved status when input state changes
  useEffect(() => {
    setIsSavedCurrent(false);
  }, [inputState]);

  const currencySymbol = CURRENCY_SYMBOLS[inputState.currency] || '$';

  // Handler for selecting a crop preset
  const handleSelectCropPreset = useCallback((preset: CropPreset) => {
    setInputState(prev => {
      // Adjust default markets relative to new crop baseline
      const basePrice = preset.typicalBasePrice;
      const updatedMarkets: MarketItem[] = prev.markets.map((m, idx) => {
        const spreadMultiplier = 1 + (idx * 0.15);
        const futureMultiplier = 1 + (idx * 0.22);
        return {
          ...m,
          currentPricePerUnit: Number((basePrice * spreadMultiplier).toFixed(2)),
          predictedFuturePricePerUnit: Number((basePrice * futureMultiplier).toFixed(2))
        };
      });

      return {
        ...prev,
        cropType: preset.id,
        customCropName: '',
        yieldAmount: preset.typicalYield,
        yieldUnit: preset.defaultUnit,
        transportCostPerKmPerUnit: preset.defaultTransportPerKm,
        handlingCostPerUnit: preset.defaultHandlingCost,
        storageCostPerUnitPerWeek: preset.defaultStorageCostPerWeek,
        storageCapacityUnits: Math.round(preset.typicalYield * 1.2),
        spoilageRatePerWeekPct: preset.defaultSpoilageRatePerWeek,
        waitDurationWeeks: Math.min(prev.waitDurationWeeks, Math.max(1, preset.shelfLifeWeeks - 1)),
        markets: updatedMarkets,
        historicalPrices: generateHistoricalPriceSeries(preset.typicalBasePrice)
      };
    });
  }, []);

  // Handler for reset
  const handleResetToDefaults = useCallback(() => {
    const preset = CROP_PRESETS.find(c => c.id === inputState.cropType) || CROP_PRESETS[0];
    handleSelectCropPreset(preset);
  }, [inputState.cropType, handleSelectCropPreset]);

  // Save current scenario to decision history
  const handleSaveDecision = async () => {
    const rec = decisionResult.recommendation;
    const newRecord: DecisionHistoryRecord = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
      cropType: inputState.cropType,
      yieldAmount: inputState.yieldAmount,
      yieldUnit: inputState.yieldUnit,
      currency: inputState.currency,
      recommendedAction: rec.action,
      recommendedMarket: rec.bestMarket.name,
      expectedNetProfit: rec.expectedNetProfit,
      riskLevel: rec.riskLevel,
      waitWeeks: rec.optimalWaitWeeks,
      farmLocation: inputState.farmLocation,
      fullInput: JSON.parse(JSON.stringify(inputState))
    };

    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      setHistory(prev => [newRecord, ...prev]);
      setIsSavedCurrent(true);
    } catch (err) {
      console.error('Failed to save to server, saving locally:', err);
      setHistory(prev => [newRecord, ...prev]);
      setIsSavedCurrent(true);
    }
  };

  const handleDeleteHistoryRecord = async (id: string) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete error:', err);
    }
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleRestoreRecord = (record: DecisionHistoryRecord) => {
    if (record.fullInput && Object.keys(record.fullInput).length > 0) {
      setInputState(record.fullInput);
    }
  };

  // Export CSV of calculation & market comparison
  const handleExportCSV = () => {
    const rec = decisionResult.recommendation;
    const lines: string[] = [];

    lines.push('SMART FARM HARVEST & MARKET PRICE DECISION SYSTEM - AUDIT REPORT');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Farm Location: ${inputState.farmLocation}`);
    lines.push(`Crop: ${inputState.cropType} (${inputState.yieldAmount} ${inputState.yieldUnit})`);
    lines.push(`Recommended Action: ${rec.action === 'WAIT' ? `WAIT ${rec.optimalWaitWeeks} WEEKS` : 'SELL NOW'}`);
    lines.push(`Optimal Target Market: ${rec.bestMarket.name} (${rec.bestMarket.distanceKm} km)`);
    lines.push(`Max Expected Net Profit: ${inputState.currency} ${rec.expectedNetProfit}`);
    lines.push(`Advantage Delta: +${inputState.currency} ${rec.netProfitDelta} (+${rec.deltaPercent}%)`);
    lines.push(`Risk Level: ${rec.riskLevel}`);
    lines.push('');
    lines.push('MARKET COMPARISON BREAKDOWN:');
    lines.push('Market Name,Distance (km),Status,Quoted Price (Now),Quoted Price (Wait),Gross Revenue (Now),Gross Revenue (Wait),Transport Cost,Handling Cost,Storage Cost,Spoilage Loss,Net Profit (Sell Now),Net Profit (Wait),Profit Margin %');

    decisionResult.markets.forEach(m => {
      lines.push(`"${m.marketName}",${m.distanceKm},"${m.isAvailable ? 'Active' : 'Excluded'}",${m.sellNow.pricePerUnit},${m.wait.pricePerUnit},${m.sellNow.grossRevenue},${m.wait.grossRevenue},${m.wait.transportCost},${m.wait.handlingCost},${m.wait.storageCost},${m.wait.spoilageLoss},${m.sellNow.netProfit},${m.wait.netProfit},${m.wait.profitMarginPct}%`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Harvest_Decision_${inputState.cropType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Top Sticky Navbar */}
      <Navbar
        currentCropId={inputState.cropType}
        onSelectCropPreset={handleSelectCropPreset}
        currency={inputState.currency}
        onChangeCurrency={(curr) => setInputState(prev => ({ ...prev, currency: curr }))}
        yieldUnit={inputState.yieldUnit}
        onChangeYieldUnit={(unit) => setInputState(prev => ({ ...prev, yieldUnit: unit }))}
        onResetToDefaults={handleResetToDefaults}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onExportCSV={handleExportCSV}
        historyCount={history.length}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Core Decision Engine Callout & Highlight */}
        <section id="section-recommendation">
          <RecommendationCard
            decision={decisionResult}
            inputState={inputState}
            currencySymbol={currencySymbol}
            onSaveDecision={handleSaveDecision}
            isSaved={isSavedCurrent}
          />
        </section>

        {/* Sell Now vs Wait Side-by-Side Comparison */}
        <section id="section-sell-vs-wait">
          <SellNowVsWaitCard
            decision={decisionResult}
            inputState={inputState}
            onChangeWaitDuration={(weeks) => setInputState(prev => ({ ...prev, waitDurationWeeks: weeks }))}
            currencySymbol={currencySymbol}
          />
        </section>

        {/* Farmer Input Form (Full parameter tuning) */}
        <section id="section-farmer-inputs">
          <FarmerInputForm
            inputState={inputState}
            onChangeInput={setInputState}
            currencySymbol={currencySymbol}
          />
        </section>

        {/* Multi-Market Net Profit Comparison Table */}
        <section id="section-market-comparison">
          <MarketComparisonTable
            markets={decisionResult.markets}
            inputState={inputState}
            currencySymbol={currencySymbol}
          />
        </section>

        {/* Interactive Charts & Decision Visualizers */}
        <section id="section-analytics-charts">
          <ChartsSection
            decision={decisionResult}
            inputState={inputState}
            currencySymbol={currencySymbol}
          />
        </section>

        {/* ML Random Forest Insights & Feature Weights */}
        <section id="section-ml-insights">
          <MLInsightsPanel
            mlPrediction={decisionResult.mlPrediction}
            inputState={inputState}
            currencySymbol={currencySymbol}
          />
        </section>

        {/* AI Agronomic Supply Chain Intelligence Advisor */}
        <section id="section-ai-advisor">
          <AIAdvisorSection
            decision={decisionResult}
            inputState={inputState}
            currencySymbol={currencySymbol}
          />
        </section>

        {/* Downside Stress Test & Sensitivity Simulator */}
        <section id="section-stress-simulator">
          <SensitivitySimulator
            inputState={inputState}
            onChangeInput={setInputState}
            currencySymbol={currencySymbol}
          />
        </section>
      </main>

      {/* Decision History Modal */}
      <DecisionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onRestoreRecord={handleRestoreRecord}
        onDeleteRecord={handleDeleteHistoryRecord}
        onExportCSV={handleExportCSV}
        currencySymbol={currencySymbol}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Smart Farm Harvest & Market Price Decision System</span>
          </div>
          <p className="text-slate-400">
            Net Profit Maximization Algorithm • Random Forest Ensemble • Cold-Chain Spoilage Modeling
          </p>
        </div>
      </footer>
    </div>
  );
}
