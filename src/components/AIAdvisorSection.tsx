import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  Lightbulb, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { DecisionCalculationOutput, FarmerInputState } from '../types';

interface AIAdvisorSectionProps {
  decision: DecisionCalculationOutput;
  inputState: FarmerInputState;
  currencySymbol: string;
}

interface AdvisoryResponse {
  source: string;
  advice: {
    executiveSummary: string;
    keyDrivers: string[];
    actionableTips: string[];
    riskMitigation: string[];
  };
}

export const AIAdvisorSection: React.FC<AIAdvisorSectionProps> = ({
  decision,
  inputState,
  currencySymbol
}) => {
  const [loading, setLoading] = useState(false);
  const [advisoryData, setAdvisoryData] = useState<AdvisoryResponse | null>(null);

  const fetchAdvisory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: inputState,
          calculationResult: decision
        })
      });
      if (!res.ok) {
        throw new Error('Advisory request failed');
      }
      const data: AdvisoryResponse = await res.json();
      setAdvisoryData(data);
    } catch (err: any) {
      console.error(err);
      // Fallback
      setAdvisoryData({
        source: 'expert_agri_model',
        advice: {
          executiveSummary: `Target **${decision.recommendation.action === 'WAIT' ? `WAITING ${decision.recommendation.optimalWaitWeeks} weeks` : 'SELLING IMMEDIATELY'}** to capture an estimated **${currencySymbol} ${decision.recommendation.expectedNetProfit.toLocaleString()}** net profit at **${decision.recommendation.bestMarket.name}**.`,
          keyDrivers: [
            `Net Profit Advantage of ${currencySymbol} ${decision.recommendation.netProfitDelta.toLocaleString()} vs other alternatives.`,
            `Logistics radius calculated at ${decision.recommendation.bestMarket.distanceKm} km transit.`,
            `Risk posture rated ${decision.recommendation.riskLevel}.`
          ],
          actionableTips: [
            'Pre-grade harvest lots into Grade-A and Grade-B bins before dispatching to capture buyer premiums.',
            'Confirm truck carrier freight rate 48 hours in advance to hedge diesel price fluctuations.',
            decision.recommendation.action === 'WAIT'
              ? 'Check relative humidity in cold storage to minimize fungal mold and water loss shrinkage.'
              : 'Execute immediate farmgate collection to avoid secondary loading handling friction.'
          ],
          riskMitigation: decision.recommendation.riskFactors.length ? decision.recommendation.riskFactors : ['Standard spot price volatility and seasonal supply arrival gluts.']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [inputState.cropType, inputState.yieldAmount, inputState.waitDurationWeeks, decision.recommendation.action]);

  const advice = advisoryData?.advice;

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 text-white p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            Supply Chain Advisory
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Agronomic Decision Intelligence
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              {advisoryData?.source === 'gemini_ai' ? 'Gemini AI' : 'Agri-Expert Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Actionable agronomic risk mitigation, harvest grade sorting, and negotiation tactics.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdvisory}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold border border-slate-700 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3 pt-1">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Formulating agronomic advisory...</span>
          </div>
        ) : advice ? (
          <>
            {/* Executive Summary */}
            <div className="p-3.5 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-200 leading-relaxed font-medium">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Executive Summary</span>
              <p>{advice.executiveSummary}</p>
            </div>

            {/* Actionable Tips & Risk Mitigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Tactical Actionable Tips */}
              <div className="p-4 rounded bg-slate-800/50 border border-slate-700/80 text-xs space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-slate-700">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Tactical Execution & Grading Tips
                </div>
                <ul className="space-y-2 pt-1 text-slate-300">
                  {advice.actionableTips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs leading-tight">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Mitigation */}
              <div className="p-4 rounded bg-slate-800/50 border border-slate-700/80 text-xs space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-slate-700">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Downside Risk Hedges
                </div>
                <ul className="space-y-2 pt-1 text-slate-300">
                  {advice.riskMitigation?.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs leading-tight">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
