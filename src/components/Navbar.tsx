import { useMemo } from 'react';
import { 
  Sprout, 
  RotateCcw, 
  History, 
  Download, 
  SlidersHorizontal
} from 'lucide-react';
import { Currency, YieldUnit, CropPreset } from '../types';
import { CROP_PRESETS } from '../data/cropPresets';

interface NavbarProps {
  currentCropId: string;
  onSelectCropPreset: (preset: CropPreset) => void;
  currency: Currency;
  onChangeCurrency: (curr: Currency) => void;
  yieldUnit: YieldUnit;
  onChangeYieldUnit: (unit: YieldUnit) => void;
  onResetToDefaults: () => void;
  onOpenHistory: () => void;
  onExportCSV: () => void;
  historyCount: number;
}

export const Navbar = ({
  currentCropId,
  onSelectCropPreset,
  currency,
  onChangeCurrency,
  yieldUnit,
  onChangeYieldUnit,
  onResetToDefaults,
  onOpenHistory,
  onExportCSV,
  historyCount
}: NavbarProps) => {
  const selectedPreset = useMemo(
    () => CROP_PRESETS.find(c => c.id === currentCropId) || CROP_PRESETS[0],
    [currentCropId]
  );

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Geometric Title */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-600 rounded-sm flex items-center justify-center shadow-xs">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                  SMART FARM
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded uppercase tracking-wider">
                  Decision System
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold hidden md:block">
                Harvest Timing & Market Net Profit Optimizer
              </p>
            </div>
          </div>

          {/* Controls: Presets, Units, Currencies & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Crop Selector */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crop:</span>
              <select
                id="crop-preset-select"
                value={selectedPreset?.id || 'tomatoes'}
                onChange={(e) => {
                  const p = CROP_PRESETS.find(c => c.id === e.target.value);
                  if (p) onSelectCropPreset(p);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {CROP_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-50 rounded border border-slate-200 px-2 py-1">
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value as Currency)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                title="Select Currency"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BRL">BRL (R$)</option>
              </select>
            </div>

            {/* Unit Selector */}
            <div className="hidden sm:flex items-center bg-slate-50 rounded border border-slate-200 px-2 py-1">
              <select
                id="yield-unit-select"
                value={yieldUnit}
                onChange={(e) => onChangeYieldUnit(e.target.value as YieldUnit)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                title="Select Yield Unit"
              >
                <option value="quintals">Quintals (100kg)</option>
                <option value="tonnes">Tonnes (1000kg)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="bushels">Bushels (bu)</option>
              </select>
            </div>

            {/* Decision History Trigger */}
            <button
              id="btn-open-history"
              type="button"
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs font-bold transition-colors"
              title="View past harvest decision history"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider">History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[10px] font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Export Report / CSV */}
            <button
              id="btn-export-csv"
              type="button"
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
              title="Download analysis report"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Export CSV</span>
            </button>

            {/* Reset Button */}
            <button
              id="btn-reset-scenario"
              type="button"
              onClick={onResetToDefaults}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              title="Reset to default crop values"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
