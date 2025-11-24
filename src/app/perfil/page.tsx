/**
 * 👤 Perfil de Usuario
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from '@/components';

export default function PerfilPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setFormData({
        nombreCompleto: user.nombreCompleto || '',
        email: user.email || '',
        telefono: user.telefono || '',
      });
    }
  }, [user, loading, router]);

  const getAuthToken = () => {
    if (token) return token;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const authToken = getAuthToken();

      if (!authToken) {
        setMessage({ type: 'error', text: '❌ Sesión expirada. Vuelve a iniciar sesión.' });
        return;
      }
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          nombreCompleto: formData.nombreCompleto,
          telefono: formData.telefono,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Perfil actualizado correctamente' });
        // Recargar usuario
        window.location.reload();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `❌ ${error.message || 'Error al actualizar'}` });
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setMessage({ type: 'error', text: '❌ Error al actualizar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPhotographer = user.rol === 'FOTOGRAFO';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div>
            <Card>
              <div className="p-6 text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center text-6xl">
                  {isPhotographer ? '📸' : '👤'}
                </div>
                <h3 className="font-bold text-xl mb-1">{user.nombreCompleto}</h3>
                <p className="text-gray-600 text-sm mb-4">{user.email}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  isPhotographer ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isPhotographer ? 'Fotógrafo' : 'Cliente'}
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Información Personal</h2>
                
                {message.text && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {message.text}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nombre Completo"
                    value={formData.nombreCompleto}
                    onChange={(val) => setFormData({ ...formData, nombreCompleto: val })}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(val) => setFormData({ ...formData, email: val })}
                    required
                    disabled
                  />

                  <Input
                    label="Teléfono"
                    value={formData.telefono}
                    onChange={(val) => setFormData({ ...formData, telefono: val })}
                    placeholder="+591 70000000"
                  />

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg"
                      disabled={saving}
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>

            {/* Seguridad */}
            <Card className="mt-6">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Seguridad</h2>
                <Button variant="outline" size="md">
                  Cambiar Contraseña
                </Button>
              </div>
            </Card>

            {/* Si es fotógrafo */}
            {isPhotographer && (
              <Card className="mt-6">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Perfil de Fotógrafo</h2>
                  <p className="text-gray-600 mb-4">
                    Completa tu perfil profesional para atraer más clientes
                  </p>
                  <Button 
                    variant="primary" 
                    size="md"
                    onClick={() => router.push('/perfil-fotografo')}
                  >
                    Editar Perfil Profesional
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
