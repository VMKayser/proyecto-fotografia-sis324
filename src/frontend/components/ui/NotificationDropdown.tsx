'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks';

type Notification = {
    id: number;
    tipo: 'RESERVA' | 'MENSAJE' | 'SISTEMA' | 'PAGO';
    titulo: string;
    mensaje: string;
    leido: boolean;
    enlace?: string;
    createdAt: string;
};

export function NotificationDropdown() {
    const { token, user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data.notifications);
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Polling cada 30 segundos
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user, token]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'markAllRead' })
            });
            setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'RESERVA': return '📅';
            case 'MENSAJE': return '💬';
            case 'PAGO': return '💰';
            default: return '🔔';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Marcar todas leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No tienes notificaciones
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.leido ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => !notification.leido && markAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="text-xl mt-1">{getIcon(notification.tipo)}</div>
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notification.leido ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {notification.titulo}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {notification.mensaje}
                                            </p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </span>
                                                {notification.enlace && (
                                                    <Link
                                                        href={notification.enlace}
                                                        className="text-xs text-blue-600 hover:underline"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        Ver detalles
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        {!notification.leido && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
