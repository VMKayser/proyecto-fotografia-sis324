'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components';

interface Message {
    id: number;
    contenido: string;
    remitenteId: number;
    createdAt: string;
    remitente: {
        nombreCompleto: string;
    };
}

interface ChatWindowProps {
    conversacionId: number;
    otherUserName: string;
    onClose: () => void;
}

export function ChatWindow({ conversacionId, otherUserName, onClose }: ChatWindowProps) {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/chat/conversations/${conversacionId}/messages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Polling cada 3 segundos
        intervalRef.current = setInterval(fetchMessages, 3000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [conversacionId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await fetch(`/api/chat/conversations/${conversacionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ contenido: newMessage }),
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages(); // Actualizar inmediatamente
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">Chat con {otherUserName}</h3>
                    <p className="text-xs text-slate-300">En línea</p>
                </div>
                <button onClick={onClose} className="text-slate-300 hover:text-white">
                    ✕
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {loading ? (
                    <div className="text-center text-slate-500 mt-10">Cargando mensajes...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">
                        <p>No hay mensajes aún.</p>
                        <p className="text-sm">¡Di hola para comenzar la conversación!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.remitenteId === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm">{msg.contenido}</p>
                                    <p
                                        className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'
                                            }`}
                                    >
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={sending}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-full w-12 h-10 flex items-center justify-center p-0"
                    >
                        {sending ? '...' : '➤'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
