'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/frontend/components/ui';
import { useAuth } from '@/frontend/repositories';
import { IUsuario } from '@/frontend/interfaces';

export default function AdminUsuariosPage() {
  const { user, token } = useAuth();
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.rol === 'ADMIN') {
      fetchUsuarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const usuariosFiltrados = usuarios.filter(u => {
    const matchRol = !filtroRol || u.rol === filtroRol;
    const matchBusqueda = !busqueda || 
      u.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    return matchRol && matchBusqueda;
  });

  const estadisticas = {
    total: usuarios.length,
    clientes: usuarios.filter(u => u.rol === 'CLIENTE').length,
    fotografos: usuarios.filter(u => u.rol === 'FOTOGRAFO').length,
    admins: usuarios.filter(u => u.rol === 'ADMIN').length,
    activos: usuarios.filter(u => u.activo).length,
  };

  if (!user || user.rol !== 'ADMIN') {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Acceso Restringido</h2>
          <p className="text-gray-600 mt-2">Solo administradores pueden acceder a esta página</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Usuarios</h1>
      </div>

      {/* Estadísticas */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card padding="lg" className="bg-blue-50 border-blue-200">
          <h3 className="text-sm font-semibold text-blue-700">Total Usuarios</h3>
          <p className="text-3xl font-bold text-blue-900 mt-1">{estadisticas.total}</p>
        </Card>
        <Card padding="lg" className="bg-green-50 border-green-200">
          <h3 className="text-sm font-semibold text-green-700">Clientes</h3>
          <p className="text-3xl font-bold text-green-900 mt-1">{estadisticas.clientes}</p>
        </Card>
        <Card padding="lg" className="bg-purple-50 border-purple-200">
          <h3 className="text-sm font-semibold text-purple-700">Fotógrafos</h3>
          <p className="text-3xl font-bold text-purple-900 mt-1">{estadisticas.fotografos}</p>
        </Card>
        <Card padding="lg" className="bg-orange-50 border-orange-200">
          <h3 className="text-sm font-semibold text-orange-700">Admins</h3>
          <p className="text-3xl font-bold text-orange-900 mt-1">{estadisticas.admins}</p>
        </Card>
        <Card padding="lg" className="bg-emerald-50 border-emerald-200">
          <h3 className="text-sm font-semibold text-emerald-700">Activos</h3>
          <p className="text-3xl font-bold text-emerald-900 mt-1">{estadisticas.activos}</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card padding="lg" className="bg-white">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Buscar</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre o email..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Filtrar por Rol</label>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los roles</option>
              <option value="CLIENTE">Clientes</option>
              <option value="FOTOGRAFO">Fotógrafos</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Usuarios */}
      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-slate-600">Cargando usuarios...</p>
        </Card>
      ) : usuariosFiltrados.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No se encontraron usuarios con los filtros aplicados
        </Card>
      ) : (
        <div className="grid gap-4">
          {usuariosFiltrados.map(usuario => (
            <Card key={usuario.id} className="p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800">
                      {usuario.nombreCompleto || 'Sin nombre'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      usuario.rol === 'ADMIN' ? 'bg-orange-100 text-orange-700' :
                      usuario.rol === 'FOTOGRAFO' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {usuario.rol}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      usuario.activo 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    {usuario.rol === 'FOTOGRAFO' && usuario.perfilFotografo?.verificado && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        ✓ Verificado
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm text-slate-600">
                    <p>
                      <span className="font-medium">Email:</span> {usuario.email}
                    </p>
                    <p>
                      <span className="font-medium">ID:</span> {usuario.id}
                    </p>
                    {usuario.telefono && (
                      <p>
                        <span className="font-medium">Teléfono:</span> {usuario.telefono}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Registrado:</span>{' '}
                      {new Date(usuario.creadoEn).toLocaleDateString('es-BO')}
                    </p>
                  </div>

                  {usuario.rol === 'FOTOGRAFO' && usuario.perfilFotografo && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm">
                      <p className="font-medium text-slate-700">Perfil de Fotógrafo:</p>
                      <div className="mt-2 grid md:grid-cols-2 gap-2 text-slate-600">
                        {usuario.perfilFotografo.nombrePublico && (
                          <p>
                            <span className="font-medium">Nombre público:</span>{' '}
                            {usuario.perfilFotografo.nombrePublico}
                          </p>
                        )}
                        {usuario.perfilFotografo.ubicacion && (
                          <p>
                            <span className="font-medium">Ubicación:</span>{' '}
                            {usuario.perfilFotografo.ubicacion}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Calificación:</span>{' '}
                          ⭐ {usuario.perfilFotografo.calificacionPromedio.toFixed(1)} ({usuario.perfilFotografo.totalResenas} reseñas)
                        </p>
                        {usuario.perfilFotografo.destacadoHasta && new Date(usuario.perfilFotografo.destacadoHasta) > new Date() && (
                          <p className="text-orange-600 font-medium">
                            ⭐ Destacado hasta: {new Date(usuario.perfilFotografo.destacadoHasta).toLocaleDateString('es-BO')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (usuario.rol === 'FOTOGRAFO') {
                        window.open(`/perfil/${usuario.perfilFotografo?.id}`, '_blank');
                      } else {
                        alert(`Ver perfil de usuario #${usuario.id}`);
                      }
                    }}
                  >
                    Ver Perfil
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
