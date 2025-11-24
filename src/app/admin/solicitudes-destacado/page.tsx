'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/frontend/components/ui';
import { useAuth } from '@/frontend/repositories';

interface FeaturedRequest {
  id: number;
  fotografoId: number;
  estado: string;
  fechaSolicitud: string;
  fotografo: {
    nombrePublico: string;
    usuario: {
      nombreCompleto: string;
      email: string;
    };
  };
}

export default function AdminFeaturedRequestsPage() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<FeaturedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/featured-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.rol === 'ADMIN') {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!confirm(`¿Estás seguro de ${action === 'approve' ? 'aprobar' : 'rechazar'} esta solicitud?`)) return;

    try {
      const res = await fetch(`/api/admin/featured-requests/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchRequests();
      } else {
        alert('Error al procesar la solicitud');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user || user.rol !== 'ADMIN') {
    return <div className="p-8">Acceso restringido</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Solicitudes de Destacado</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : requests.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No hay solicitudes pendientes
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map(req => (
            <Card key={req.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{req.fotografo.nombrePublico}</h3>
                  <p className="text-gray-600">{req.fotografo.usuario.nombreCompleto}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Solicitado el: {new Date(req.fechaSolicitud).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    onClick={() => handleAction(req.id, 'reject')}
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleAction(req.id, 'approve')}
                  >
                    Aprobar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
