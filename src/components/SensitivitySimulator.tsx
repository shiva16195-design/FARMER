import React, { useState } from 'react';
import { 
  Sliders, 
  Flame, 
  Fuel, 
  TrendingDown
} from 'lucide-react';
import { FarmerInputState } from '../types';

interface SensitivitySimulatorProps {
  inputState: FarmerInputState;
  onChangeInput: (updater: (prev: FarmerInputState) => FarmerInputState) => void;
  currencySymbol: string;
}

export const SensitivitySimulator: React.FC<SensitivitySimulatorProps> = ({
  inputState,
  onChangeInput,
  currencySymbol
}) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyStressPreset = (type: 'fuel_spike' | 'market_glut' | 'heatwave' | 'reset') => {
    setActivePreset(type === 'reset' ? null : type);
    if (type === 'fuel_spike') {
      onChangeInput(prev => ({
        ...prev,
        transportCostPerKmPerUnit: Number((prev.transportCostPerKmPerUnit * 1.35).toFixed(3)),
        mlFactors: { ...prev.mlFactors, fuelLogisticsTrend: 1.35 }
      }));
    } else if (type === 'market_glut') {
      onChangeInput(prev => ({
        ...prev,
        mlFactors: { ...prev.mlFactors, regionalSupplyIndex: 1.45 }
      }));
    } else if (type === 'heatwave') {
      onChangeInput(prev => ({
        ...prev,
        spoilageRatePerWeekPct: Number((prev.spoilageRatePerWeekPct * 1.8).toFixed(1))
      }));
    } else {
      // reset
      onChangeInput(prev => ({
        ...prev,
        transportCostPerKmPerUnit: 0.05,
        spoilageRatePerWeekPct: 2.5,
        mlFactors: {
          ...prev.mlFactors,
          fuelLogisticsTrend: 1.0,
          regionalSupplyIndex: 1.0
        }
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            Risk Simulation
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Sensitivity & Stress Testing
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate how the optimal harvest decision holds up against sudden logistics spikes and weather shocks.
          </p>
        </div>

        {/* Quick Stress Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyStressPreset('fuel_spike')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors flex items-center gap-1 ${
              activePreset === 'fuel_spike' 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Fuel className="w-3 h-3 text-amber-600" />
            +35% Fuel Spike
          </button>
          <button
            type="button"
            onClick={() => applyStressPreset('heatwave')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors flex items-center gap-1 ${
              activePreset === 'heatwave' 
                ? 'bg-rose-100 text-rose-900 border-rose-300' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-600" />
            Heatwave (+80% Spoilage)
          </button>
          <button
            type="button"
            onClick={() => applyStressPreset('market_glut')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors flex items-center gap-1 ${
              activePreset === 'market_glut' 
                ? 'bg-purple-100 text-purple-900 border-purple-300' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <TrendingDown className="w-3 h-3 text-purple-600" />
            Supply Glut
          </button>
          <button
            type="button"
            onClick={() => applyStressPreset('reset')}
            className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider"
            title="Reset shocks"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Stress Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <div className="flex justify-between font-bold text-slate-700 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transport Rate</span>
            <span className="text-amber-700 font-bold">{inputState.transportCostPerKmPerUnit} {currencySymbol}/km</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.80"
            step="0.01"
            value={inputState.transportCostPerKmPerUnit}
            onChange={(e) => onChangeInput(prev => ({ ...prev, transportCostPerKmPerUnit: Number(e.target.value) }))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Tests distant terminal viability.</p>
        </div>

        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <div className="flex justify-between font-bold text-slate-700 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spoilage Decay</span>
            <span className="text-rose-700 font-bold">{inputState.spoilageRatePerWeekPct}% / wk</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.2"
            value={inputState.spoilageRatePerWeekPct}
            onChange={(e) => onChangeInput(prev => ({ ...prev, spoilageRatePerWeekPct: Number(e.target.value) }))}
            className="w-full accent-rose-600 cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Tests holding decay risk.</p>
        </div>

        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <div className="flex justify-between font-bold text-slate-700 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Capacity</span>
            <span className="text-slate-800 font-bold">{inputState.storageCapacityUnits} {inputState.yieldUnit}</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={inputState.storageCapacityUnits}
            onChange={(e) => onChangeInput(prev => ({ ...prev, storageCapacityUnits: Number(e.target.value) }))}
            className="w-full accent-slate-800 cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Simulates warehouse bay limits.</p>
        </div>
      </div>
    </div>
  );
};
