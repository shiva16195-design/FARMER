import React, { useState } from 'react';
import { 
  MapPin, 
  Wheat, 
  Truck, 
  Warehouse, 
  Clock, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  Cpu, 
  Sliders, 
  DollarSign, 
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { FarmerInputState, MarketItem, CropPreset } from '../types';
import { CROP_PRESETS } from '../data/cropPresets';

interface FarmerInputFormProps {
  inputState: FarmerInputState;
  onChangeInput: (updater: (prev: FarmerInputState) => FarmerInputState) => void;
  currencySymbol: string;
}

export const FarmerInputForm: React.FC<FarmerInputFormProps> = ({
  inputState,
  onChangeInput,
  currencySymbol
}) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'costs' | 'markets' | 'ml'>('basics');
  const [showAddMarketModal, setShowAddMarketModal] = useState(false);
  const [newMarket, setNewMarket] = useState<Partial<MarketItem>>({
    name: '',
    location: '',
    distanceKm: 50,
    currentPricePerUnit: 35,
    predictedFuturePricePerUnit: 40,
    isAvailable: true,
    handlingCostModifier: 1.0,
    qualityGradingBonusPct: 0
  });

  const selectedPreset = CROP_PRESETS.find(c => c.id === inputState.cropType);

  const handleUpdate = <K extends keyof FarmerInputState>(key: K, value: FarmerInputState[K]) => {
    onChangeInput(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUpdateMarket = (index: number, updates: Partial<MarketItem>) => {
    onChangeInput(prev => {
      const nextMarkets = [...prev.markets];
      nextMarkets[index] = { ...nextMarkets[index], ...updates };
      return { ...prev, markets: nextMarkets };
    });
  };

  const handleRemoveMarket = (index: number) => {
    onChangeInput(prev => ({
      ...prev,
      markets: prev.markets.filter((_, i) => i !== index)
    }));
  };

  const handleAddMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarket.name) return;

    const item: MarketItem = {
      id: `mkt-custom-${Date.now()}`,
      name: newMarket.name,
      location: newMarket.location || 'Regional Zone',
      distanceKm: Number(newMarket.distanceKm) || 20,
      currentPricePerUnit: Number(newMarket.currentPricePerUnit) || 30,
      predictedFuturePricePerUnit: Number(newMarket.predictedFuturePricePerUnit) || 35,
      isAvailable: newMarket.isAvailable !== false,
      handlingCostModifier: Number(newMarket.handlingCostModifier) || 1.0,
      qualityGradingBonusPct: Number(newMarket.qualityGradingBonusPct) || 0
    };

    onChangeInput(prev => ({
      ...prev,
      markets: [...prev.markets, item]
    }));

    setNewMarket({
      name: '',
      location: '',
      distanceKm: 50,
      currentPricePerUnit: 35,
      predictedFuturePricePerUnit: 40,
      isAvailable: true,
      handlingCostModifier: 1.0,
      qualityGradingBonusPct: 0
    });
    setShowAddMarketModal(false);
  };

  // Storage utilization %
  const storageUsagePct = Math.min(100, Math.round((inputState.yieldAmount / (inputState.storageCapacityUnits || 1)) * 100));
  const isOverflowing = inputState.yieldAmount > inputState.storageCapacityUnits;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header with Geometric Navigation Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            Parameter Controls
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Farmer Scenario Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjust farm yield, logistics rates, storage constraints, and target markets.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200 text-xs font-semibold text-slate-600">
          <button
            id="tab-basics"
            type="button"
            onClick={() => setActiveTab('basics')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeTab === 'basics' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            Crop & Yield
          </button>
          <button
            id="tab-costs"
            type="button"
            onClick={() => setActiveTab('costs')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeTab === 'costs' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            Costs & Storage
          </button>
          <button
            id="tab-markets"
            type="button"
            onClick={() => setActiveTab('markets')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
              activeTab === 'markets' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            Markets ({inputState.markets.length})
          </button>
          <button
            id="tab-ml"
            type="button"
            onClick={() => setActiveTab('ml')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
              activeTab === 'ml' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-slate-700" />
            ML Factors
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* TAB 1: CROP & YIELD */}
        {activeTab === 'basics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Farm Location */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Farm Origin Location
                </label>
                <input
                  id="input-farm-location"
                  type="text"
                  value={inputState.farmLocation}
                  onChange={(e) => handleUpdate('farmLocation', e.target.value)}
                  placeholder="e.g. Green Valley Agro Farm, Zone 4"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all font-medium"
                />
              </div>

              {/* Crop Preset Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5 text-emerald-600" />
                  Commodity Crop
                </label>
                <select
                  id="select-crop-type"
                  value={inputState.cropType}
                  onChange={(e) => {
                    const preset = CROP_PRESETS.find(c => c.id === e.target.value);
                    if (preset) {
                      onChangeInput(prev => ({
                        ...prev,
                        cropType: preset.id,
                        yieldUnit: preset.defaultUnit,
                        yieldAmount: preset.typicalYield,
                        spoilageRatePerWeekPct: preset.defaultSpoilageRatePerWeek,
                        storageCostPerUnitPerWeek: preset.defaultStorageCostPerWeek,
                        handlingCostPerUnit: preset.defaultHandlingCost,
                        transportCostPerKmPerUnit: preset.defaultTransportPerKm
                      }));
                    } else {
                      handleUpdate('cropType', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all font-medium"
                >
                  {CROP_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} ({preset.category})
                    </option>
                  ))}
                  <option value="custom">Custom Produce</option>
                </select>
              </div>

              {/* Harvest Expected Yield */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Harvest Yield
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">
                    {inputState.yieldUnit}
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="input-yield-amount"
                    type="number"
                    min="1"
                    step="any"
                    value={inputState.yieldAmount}
                    onChange={(e) => handleUpdate('yieldAmount', Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                    {inputState.yieldUnit}
                  </div>
                </div>
              </div>
            </div>

            {/* Crop Characteristics Callout */}
            {selectedPreset && (
              <div className="p-4 rounded bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedPreset.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                      Max Shelf Life: {selectedPreset.shelfLifeWeeks}w
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedPreset.description}
                  </p>
                  <p className="text-slate-700 font-medium pt-0.5">
                    <strong>Economic Profile:</strong> {selectedPreset.riskCharacteristics}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COSTS & STORAGE CONSTRAINTS */}
        {activeTab === 'costs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Transport Rate */}
              <div className="p-4 rounded bg-slate-50 border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    Transport Cost / km / Unit
                  </span>
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="input-transport-cost"
                    type="number"
                    step="0.01"
                    min="0.001"
                    value={inputState.transportCostPerKmPerUnit}
                    onChange={(e) => handleUpdate('transportCostPerKmPerUnit', Number(e.target.value) || 0.01)}
                    className="w-full px-3 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {currencySymbol} / km / {inputState.yieldUnit}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Freight truck fuel, driver, & road toll factor.
                </p>
              </div>

              {/* Handling Cost */}
              <div className="p-4 rounded bg-slate-50 border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Handling & Loading Cost
                  </span>
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="input-handling-cost"
                    type="number"
                    step="0.1"
                    min="0"
                    value={inputState.handlingCostPerUnit}
                    onChange={(e) => handleUpdate('handlingCostPerUnit', Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {currencySymbol} / {inputState.yieldUnit}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Labor, bagging, crates, and gate loading fees.
                </p>
              </div>

              {/* Storage Cost / Week */}
              <div className="p-4 rounded bg-slate-50 border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                    Storage Cost / Week
                  </span>
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="input-storage-cost"
                    type="number"
                    step="0.1"
                    min="0"
                    value={inputState.storageCostPerUnitPerWeek}
                    onChange={(e) => handleUpdate('storageCostPerUnitPerWeek', Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {currencySymbol} / {inputState.yieldUnit} / wk
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Cold storage electricity or warehouse rent.
                </p>
              </div>

              {/* Storage Capacity Limit */}
              <div className="p-4 rounded bg-slate-50 border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Warehouse className="w-3.5 h-3.5 text-slate-700" />
                    Storage Capacity Limit
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isOverflowing ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {storageUsagePct}% Used
                  </span>
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="input-storage-capacity"
                    type="number"
                    step="1"
                    min="1"
                    value={inputState.storageCapacityUnits}
                    onChange={(e) => handleUpdate('storageCapacityUnits', Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {inputState.yieldUnit}
                  </span>
                </div>
                {/* Visual Storage Bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isOverflowing ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, storageUsagePct)}%` }}
                  />
                </div>
                {isOverflowing && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {(inputState.yieldAmount - inputState.storageCapacityUnits).toFixed(0)} {inputState.yieldUnit} exceeds storage capacity!
                  </p>
                )}
              </div>

              {/* Spoilage Decay Rate % per Week */}
              <div className="p-4 rounded bg-slate-50 border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    Weekly Spoilage Rate (%)
                  </span>
                  <span className="text-xs font-bold text-rose-600">
                    {inputState.spoilageRatePerWeekPct}% / wk
                  </span>
                </label>
                <div className="mt-3">
                  <input
                    id="input-spoilage-rate"
                    type="range"
                    min="0"
                    max="20"
                    step="0.2"
                    value={inputState.spoilageRatePerWeekPct}
                    onChange={(e) => handleUpdate('spoilageRatePerWeekPct', Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Natural rot, moisture loss, and shrinkage over holding time.
                </p>
              </div>

              {/* Holding Horizon / Wait Duration (Weeks) */}
              <div className="p-4 rounded bg-slate-50 border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-700" />
                    Target Wait Horizon
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {inputState.waitDurationWeeks} Weeks
                  </span>
                </label>
                <div className="mt-3">
                  <input
                    id="input-wait-duration"
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={inputState.waitDurationWeeks}
                    onChange={(e) => handleUpdate('waitDurationWeeks', Number(e.target.value))}
                    className="w-full accent-slate-800 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Duration to hold harvest before selling in future market.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TARGET MARKETS MANAGER */}
        {activeTab === 'markets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                Compare multiple markets. Exclude closed or restricted mandis.
              </p>
              <button
                id="btn-add-market"
                type="button"
                onClick={() => setShowAddMarketModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Target Market
              </button>
            </div>

            {/* Markets List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inputState.markets.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-4 rounded border transition-all ${
                    m.isAvailable 
                      ? 'bg-white border-slate-200' 
                      : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {m.name}
                        </span>
                        {m.isAvailable ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                            Available
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">
                            Excluded
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {m.location} • <strong className="text-slate-700">{m.distanceKm} km</strong>
                      </p>
                    </div>

                    {/* Toggle Availability Switch */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateMarket(idx, { isAvailable: !m.isAvailable })}
                        className={`p-1.5 rounded text-xs font-medium transition-colors ${
                          m.isAvailable 
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                            : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                        }`}
                        title={m.isAvailable ? 'Click to exclude this market' : 'Click to include this market'}
                      >
                        {m.isAvailable ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                      {inputState.markets.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMarket(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Delete market"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Market Parameters Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Distance</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          min="1"
                          value={m.distanceKm}
                          onChange={(e) => handleUpdateMarket(idx, { distanceKm: Math.max(1, Number(e.target.value) || 1) })}
                          className="w-16 px-1.5 py-0.5 font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                        <span className="text-[10px] text-slate-400">km</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Current</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">{currencySymbol}</span>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={m.currentPricePerUnit}
                          onChange={(e) => handleUpdateMarket(idx, { currentPricePerUnit: Number(e.target.value) || 1 })}
                          className="w-16 px-1.5 py-0.5 font-bold text-emerald-700 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Future</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">{currencySymbol}</span>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={m.predictedFuturePricePerUnit}
                          onChange={(e) => handleUpdateMarket(idx, { predictedFuturePricePerUnit: Number(e.target.value) || 1 })}
                          className="w-16 px-1.5 py-0.5 font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ML & MARKET FACTORS */}
        {activeTab === 'ml' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-700" />
                  Machine Learning Engine
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Price Forecast Drivers & Hyperparameters
                </h3>
              </div>

              {/* Model Type Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Model:</span>
                <select
                  id="select-ml-model"
                  value={inputState.mlModelType}
                  onChange={(e) => handleUpdate('mlModelType', e.target.value as any)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-200 rounded text-slate-800 focus:outline-none"
                >
                  <option value="random_forest">Random Forest Ensemble (Default)</option>
                  <option value="gradient_boost">Gradient Boosted Trees</option>
                  <option value="linear_trend">Linear Historical Trend</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Seasonal Demand Factor */}
              <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Seasonal Demand Index
                  </label>
                  <span className="text-xs font-bold text-emerald-700">
                    {(inputState.mlFactors.seasonalDemandIndex * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={inputState.mlFactors.seasonalDemandIndex}
                  onChange={(e) => onChangeInput(prev => ({
                    ...prev,
                    mlFactors: { ...prev.mlFactors, seasonalDemandIndex: Number(e.target.value) }
                  }))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Regional Supply Arrivals */}
              <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Regional Supply Volume
                  </label>
                  <span className="text-xs font-bold text-slate-900">
                    {(inputState.mlFactors.regionalSupplyIndex * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  value={inputState.mlFactors.regionalSupplyIndex}
                  onChange={(e) => onChangeInput(prev => ({
                    ...prev,
                    mlFactors: { ...prev.mlFactors, regionalSupplyIndex: Number(e.target.value) }
                  }))}
                  className="w-full accent-slate-800 cursor-pointer"
                />
              </div>

              {/* Fuel Logistics Trend */}
              <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Freight Surcharge
                  </label>
                  <span className="text-xs font-bold text-amber-700">
                    {(inputState.mlFactors.fuelLogisticsTrend * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={inputState.mlFactors.fuelLogisticsTrend}
                  onChange={(e) => onChangeInput(prev => ({
                    ...prev,
                    mlFactors: { ...prev.mlFactors, fuelLogisticsTrend: Number(e.target.value) }
                  }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Custom Market Modal */}
      {showAddMarketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Add New Target Market
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMarketModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMarket} className="space-y-4 pt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Market Name
                </label>
                <input
                  type="text"
                  required
                  value={newMarket.name || ''}
                  onChange={(e) => setNewMarket(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. South Agro Wholesale Mandi"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newMarket.distanceKm || 50}
                    onChange={(e) => setNewMarket(prev => ({ ...prev, distanceKm: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Current Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min="1"
                    value={newMarket.currentPricePerUnit || 35}
                    onChange={(e) => setNewMarket(prev => ({ ...prev, currentPricePerUnit: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Expected Future Price ({currencySymbol})
                </label>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="1"
                  value={newMarket.predictedFuturePricePerUnit || 42}
                  onChange={(e) => setNewMarket(prev => ({ ...prev, predictedFuturePricePerUnit: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMarketModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
                >
                  Add Market
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
