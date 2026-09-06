import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Trash2, X, CheckCircle2, AlertTriangle, Info, Database, ArrowRight } from 'lucide-react';

export default function NotificationCenterPopover() {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Notification Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all shadow-xs flex items-center justify-center cursor-pointer"
        title="View Database Notifications & Event Log"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Popover Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900 text-xs">Database Activity Log</span>
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border border-indigo-200">
                {notifications.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 [scrollbar-width:none]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">
                No recent database notifications stored.
              </div>
            ) : (
              notifications.map((n) => {
                const isSuccess = n.type === 'success';
                const isWarning = n.type === 'warning';
                const isError = n.type === 'error';

                let IconComponent = Info;
                let iconColor = 'text-indigo-600';
                let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

                if (isSuccess) {
                  IconComponent = CheckCircle2;
                  iconColor = 'text-emerald-600';
                  badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                } else if (isWarning) {
                  IconComponent = AlertTriangle;
                  iconColor = 'text-amber-600';
                  badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                } else if (isError) {
                  IconComponent = AlertTriangle;
                  iconColor = 'text-rose-600';
                  badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
                }

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                      !n.read ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0 mt-0.5 shadow-2xs">
                      <IconComponent className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.timestamp}</span>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>

                      <div className="flex items-center justify-between pt-1">
                        {n.status && (
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${badgeStyle}`}>
                            {n.status}
                          </span>
                        )}

                        {n.actionLabel && n.actionOnClick && (
                          <button
                            onClick={() => {
                              n.actionOnClick();
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <span>{n.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
