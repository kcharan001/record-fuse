import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: 'initial-welcome',
      type: 'info', // 'success' | 'warning' | 'info' | 'error'
      status: 'SYSTEM READY',
      title: 'Database Notification Engine Active',
      message: 'System is monitoring live SQLite transactions and patient record additions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      read: false,
    }
  ]);

  const [toasts, setToasts] = useState([]);

  const addNotification = useCallback(({ type = 'info', status = 'DATA UPDATE', title, message, actionLabel, actionOnClick }) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newNotif = {
      id,
      type,
      status,
      title,
      message,
      actionLabel,
      actionOnClick,
      timestamp,
      read: false,
    };

    // Add to historical notifications log
    setNotifications((prev) => [newNotif, ...prev]);

    // Add to active floating toasts
    setToasts((prev) => [...prev, newNotif]);

    // Auto-dismiss floating toast after 6 seconds
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        addNotification,
        removeToast,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
