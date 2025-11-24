'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Card } from '@/frontend/components/ui/Card';
import { Button } from '@/frontend/components/ui/Button';
import { Input } from '@/frontend/components/ui/Input';

interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: string;
  activo: boolean;
  fotografoId: number;
}

export default function MisPaquetesPage() {
  const router = useRouter();
  const { user, loading, token } = useAuth();
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loadingPaquetes, setLoadingPaquetes] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState<Paquete | null>(null);
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
  });
  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.rol !== 'FOTOGRAFO') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const getAuthToken = useCallback(() => {
    if (token) return token;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }, [token]);

  const fetchPaquetes = useCallback(async () => {
    if (!perfilId) {
      setPaquetes([]);
      return;
    }
    try {
      setLoadingPaquetes(true);
      const authToken = getAuthToken();
      if (!authToken) {
        setPaquetes([]);
        return;
      }
      const response = await fetch(`/api/packages?fotografoId=${perfilId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setPaquetes(list);
      } else {
        setPaquetes([]);
      }
    } catch (err) {
      console.error('Error al cargar paquetes:', err);
      setPaquetes([]);
    } finally {
      setLoadingPaquetes(false);
    }
  }, [getAuthToken, perfilId]);

  useEffect(() => {
    if (user && user.rol === 'FOTOGRAFO') {
      fetchPaquetes();
    }
  }, [user, fetchPaquetes]);

  const fetchPerfil = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/profiles?usuarioId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPerfilId(data?.id ?? null);
      }
    } catch (error) {
      console.error('Error al obtener perfil del fotógrafo', error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.rol === 'FOTOGRAFO') {
      fetchPerfil();
    }
  }, [user, fetchPerfil]);

  const resumen = useMemo(() => {
    const activos = paquetes.filter((paquete) => paquete.activo).length;
    const inactivos = paquetes.length - activos;
    const promedio = paquetes.length
      ? paquetes.reduce((sum, paquete) => sum + Number(paquete.precio), 0) / paquetes.length
      : 0;
    return { total: paquetes.length, activos, inactivos, promedio };
  }, [paquetes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        alert('Tu sesión expiró. Inicia sesión nuevamente.');
        return;
      }
      const url = editingPaquete
        ? `/api/packages/${editingPaquete.id}`
        : '/api/packages';
      const method = editingPaquete ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingPaquete(null);
        setFormData({ nombre: '', descripcion: '', precio: '', duracion: '' });
        fetchPaquetes();
      } else {
        alert('Error al guardar el paquete');
      }
    } catch (error) {
      console.error('Error al guardar el paquete:', error);
      alert('Error al guardar el paquete');
    }
  };

  const handleEdit = (paquete: Paquete) => {
    setEditingPaquete(paquete);
    setFormData({
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: paquete.precio.toString(),
      duracion: paquete.duracion,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este paquete?')) return;

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        alert('Tu sesión expiró. Inicia sesión nuevamente.');
        return;
      }
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        fetchPaquetes();
      } else {
        alert('Error al eliminar el paquete');
      }
    } catch (error) {
      console.error('Error al eliminar el paquete:', error);
      alert('Error al eliminar el paquete');
    }
  };

  const handleToggleActivo = async (id: number, activo: boolean) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        alert('Tu sesión expiró. Inicia sesión nuevamente.');
        return;
      }
      const response = await fetch(`/api/packages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ activo: !activo }),
      });

      if (response.ok) {
        fetchPaquetes();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (user.rol !== 'FOTOGRAFO') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Paquetes</h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus paquetes de servicios fotográficos
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPaquete(null);
              setFormData({ nombre: '', descripcion: '', precio: '', duracion: '' });
              setShowModal(true);
            }}
          >
            + Nuevo Paquete
          </Button>
        </div>

        {loadingPaquetes ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando paquetes...</p>
          </div>
        ) : paquetes.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No tienes paquetes creados
            </p>
            <Button
              onClick={() => {
                setEditingPaquete(null);
                setFormData({ nombre: '', descripcion: '', precio: '', duracion: '' });
                setShowModal(true);
              }}
            >
              Crear mi primer paquete
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              {[
                { label: 'Total', value: resumen.total },
                { label: 'Activos', value: resumen.activos },
                { label: 'En pausa', value: resumen.inactivos },
                { label: 'Promedio', value: resumen.total ? priceFormatter.format(resumen.promedio) : '—' },
              ].map((item) => (
                <Card key={item.label} className="p-4">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paquetes.map((paquete) => (
              <Card key={paquete.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {paquete.nombre}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      paquete.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {paquete.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {paquete.descripcion}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Precio:</span>
                    <span className="font-semibold text-gray-900">
                      {priceFormatter.format(paquete.precio)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duración:</span>
                    <span className="font-medium text-gray-900">
                      {paquete.duracion}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(paquete)}
                    className="w-full"
                  >
                    Editar
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={paquete.activo ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleActivo(paquete.id, paquete.activo)}
                    >
                      {paquete.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(paquete.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingPaquete ? 'Editar Paquete' : 'Nuevo Paquete'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre del Paquete"
                  value={formData.nombre}
                  onChange={(val) => setFormData({ ...formData, nombre: val })}
                  required
                  placeholder="Ej: Sesión de Boda"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe lo que incluye este paquete..."
                  />
                </div>

                <Input
                  label="Precio (BOB)"
                  type="number"
                  value={formData.precio}
                  onChange={(val) => setFormData({ ...formData, precio: val })}
                  required
                  placeholder="1500"
                />

                <Input
                  label="Duración"
                  value={formData.duracion}
                  onChange={(val) => setFormData({ ...formData, duracion: val })}
                  required
                  placeholder="Ej: 4 horas"
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPaquete(null);
                      setFormData({ nombre: '', descripcion: '', precio: '', duracion: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingPaquete ? 'Guardar Cambios' : 'Crear Paquete'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
