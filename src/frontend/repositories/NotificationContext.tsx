/**
 * 💾 Context de Notificaciones
 * Gestiona el estado global de notificaciones/alertas
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { INotificationContext, INotification } from '../interfaces';

const NotificationContext = createContext<INotificationContext | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const addNotification = useCallback((notification: Omit<INotification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36);
    const newNotification: INotification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover después de la duración especificada
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value: INotificationContext = {
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): INotificationContext {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification debe usarse dentro de un NotificationProvider');
  }
  return context;
}
