import React from 'react';
import { 
  History, 
  Trash2, 
  RotateCcw, 
  Download, 
  X, 
  MapPin, 
  Calendar,
  Building2
} from 'lucide-react';
import { DecisionHistoryRecord } from '../types';

interface DecisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DecisionHistoryRecord[];
  onRestoreRecord: (record: DecisionHistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExportCSV: () => void;
  currencySymbol: string;
}

export const DecisionHistoryModal: React.FC<DecisionHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestoreRecord,
  onDeleteRecord,
  onExportCSV,
  currencySymbol
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              Scenario Archive
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Harvest Decision History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track past recommendations, restore parameters, and compare market performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold border border-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <History className="w-7 h-7 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700">No saved scenarios yet</p>
              <p className="text-slate-400 mt-1">
                Click "Save Scenario" on any recommendation to record it in your decision history.
              </p>
            </div>
          ) : (
            history.map((rec) => {
              const isWait = rec.recommendedAction === 'WAIT';
              const dateStr = new Date(rec.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={rec.id}
                  className="p-4 rounded border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isWait ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {isWait ? `WAIT ${rec.waitWeeks} WEEKS` : 'SELL NOW'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {rec.cropType.toUpperCase()} ({rec.yieldAmount} {rec.yieldUnit})
                        </h4>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Target: <strong className="text-slate-900">{rec.recommendedMarket}</strong>
                        </span>
                        {rec.farmLocation && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {rec.farmLocation}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financial Return & Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Net Profit</span>
                        <span className="text-sm font-bold text-slate-900">
                          {currencySymbol} {rec.expectedNetProfit.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                        {rec.fullInput && Object.keys(rec.fullInput).length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              onRestoreRecord(rec);
                              onClose();
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors text-xs font-bold flex items-center gap-1"
                            title="Restore this scenario into parameters"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px] uppercase">Restore</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">{history.length} decision scenarios archived</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
