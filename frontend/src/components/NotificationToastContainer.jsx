import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { CheckCircle2, AlertTriangle, Info, X, ArrowRight, Database, Bell } from 'lucide-react';

export default function NotificationToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        let borderColor = 'border-indigo-200';
        let bgColor = 'bg-white';
        let badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        let IconComponent = Info;
        let iconColor = 'text-indigo-600';

        if (isSuccess) {
          borderColor = 'border-emerald-300';
          badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (isWarning) {
          borderColor = 'border-amber-300';
          badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-600';
        } else if (isError) {
          borderColor = 'border-rose-300';
          badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
          IconComponent = AlertTriangle;
          iconColor = 'text-rose-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl ${bgColor} border ${borderColor} shadow-xl shadow-slate-950/10 transition-all duration-300 animate-slide-in flex flex-col gap-2.5 relative overflow-hidden`}
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${isSuccess ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : isError ? 'bg-rose-500' : 'bg-indigo-600'}`} />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg ${isSuccess ? 'bg-emerald-50' : isWarning ? 'bg-amber-50' : 'bg-indigo-50'} shrink-0 mt-0.5`}>
                  <IconComponent className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900">{toast.title}</span>
                    {toast.status && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${badgeBg}`}>
                        {toast.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Button inside notification (if present) */}
            {toast.actionLabel && toast.actionOnClick && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    toast.actionOnClick();
                    removeToast(toast.id);
                  }}
                  className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span>{toast.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
