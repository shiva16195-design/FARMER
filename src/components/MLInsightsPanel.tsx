import React from 'react';
import { 
  Cpu, 
  Layers
} from 'lucide-react';
import { MLPredictionOutput, FarmerInputState } from '../types';

interface MLInsightsPanelProps {
  mlPrediction: MLPredictionOutput;
  inputState: FarmerInputState;
  currencySymbol: string;
}

export const MLInsightsPanel: React.FC<MLInsightsPanelProps> = ({
  mlPrediction,
  inputState,
  currencySymbol
}) => {
  const { currentBasePrice, predictedFuturePrice, confidenceLower, confidenceUpper, expectedChangePct, featureImportances } = mlPrediction;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 space-y-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-700" />
            Predictive Intelligence
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Machine Learning Price Forecasting Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Decision trees evaluating rolling price momentum, regional supply arrivals, seasonal consumption, and logistics inflation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
            Model: {inputState.mlModelType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Primary Forecast Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="p-4 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Current Baseline Spot
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {currencySymbol} {currentBasePrice.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">per {inputState.yieldUnit}</span>
        </div>

        <div className="p-4 rounded bg-emerald-50/50 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            Predicted Future ({inputState.waitDurationWeeks} Weeks)
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-800 tracking-tight flex items-center gap-2">
            {currencySymbol} {predictedFuturePrice.toFixed(2)}
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
              expectedChangePct >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {expectedChangePct >= 0 ? `+${expectedChangePct}%` : `${expectedChangePct}%`}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Ensemble point forecast</span>
        </div>

        <div className="p-4 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            95% Confidence Interval
          </span>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {currencySymbol} {confidenceLower.toFixed(2)} – {currencySymbol} {confidenceUpper.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1 font-medium">Statistical bounds</span>
        </div>
      </div>

      {/* Feature Importance Weights */}
      <div className="space-y-2.5 pt-1">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          Feature Importance Distribution
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {featureImportances.map((item, idx) => (
            <div key={idx} className="p-3 rounded bg-slate-50 border border-slate-200 text-xs">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-slate-900">{item.feature}</span>
                <span className="font-bold text-slate-700">{item.importance}% weight</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${
                    item.impact === 'positive' ? 'bg-emerald-600' : item.impact === 'negative' ? 'bg-rose-500' : 'bg-slate-700'
                  }`}
                  style={{ width: `${item.importance * 2.5}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
