
'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components';
import { useAuth } from '@/hooks';

type Bloqueo = {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
};

export default function CalendarioPage() {
  const { user, token } = useAuth();
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);

  // Obtener el ID del perfil del fotógrafo
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/profiles?usuarioId=${user.id}`);
        const data = await res.json();
        // Asumiendo que devuelve un array o un objeto
        const profile = Array.isArray(data) ? data[0] : data;
        if (profile?.id) {
          setProfileId(profile.id);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, [user]);

  const fetchBloqueos = async () => {
    if (!profileId) return;
    try {
      const res = await fetch(`/api/availability?fotografoId=${profileId}`);
      const data = await res.json();
      if (data.success) {
        setBloqueos(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (profileId) fetchBloqueos();
  }, [profileId]);

  const handleAddBloqueo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fotografoId: profileId,
          fechaInicio,
          fechaFin: fechaFin || fechaInicio, // Si no hay fin, es el mismo día
          motivo,
        }),
      });

      if (res.ok) {
        setFechaInicio('');
        setFechaFin('');
        setMotivo('');
        fetchBloqueos();
      } else {
        alert('Error al bloquear fecha');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desbloquear esta fecha?')) return;
    try {
      await fetch(`/api/availability?id=${id}`, { method: 'DELETE' });
      fetchBloqueos();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user || user.rol !== 'FOTOGRAFO') {
    return <div className="p-8">Acceso restringido a fotógrafos.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Disponibilidad</h1>
      
      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        {/* Formulario */}
        <Card padding="lg" className="h-fit">
          <h2 className="text-xl font-semibold mb-4">Bloquear Fechas</h2>
          <form onSubmit={handleAddBloqueo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
              <input 
                type="date" 
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hasta (Opcional)</label>
              <input 
                type="date" 
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-lg border-slate-300"
              />
            </div>
            <Input 
              label="Motivo (Opcional)"
              placeholder="Vacaciones, Evento personal..."
              value={motivo}
              onChange={setMotivo}
            />
            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Bloquear Fecha
            </Button>
          </form>
        </Card>

        {/* Lista */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Fechas No Disponibles</h2>
          {bloqueos.length === 0 ? (
            <p className="text-slate-500">Tu calendario está completamente disponible.</p>
          ) : (
            bloqueos.map((bloqueo) => (
              <Card key={bloqueo.id} className="flex items-center justify-between p-4 bg-white">
                <div>
                  <p className="font-bold text-slate-800">
                    {new Date(bloqueo.fechaInicio).toLocaleDateString()} 
                    {bloqueo.fechaFin && bloqueo.fechaFin !== bloqueo.fechaInicio && 
                      ` - ${new Date(bloqueo.fechaFin).toLocaleDateString()}`
                    }
                  </p>
                  {bloqueo.motivo && <p className="text-sm text-slate-500">{bloqueo.motivo}</p>}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => handleDelete(bloqueo.id)}
                >
                  Desbloquear
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
