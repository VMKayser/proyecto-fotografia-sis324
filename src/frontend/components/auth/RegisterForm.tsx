/**
 * ⚛️ Componente RegisterForm
 * Formulario de registro de usuarios
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useNotification } from '../../repositories';
import { Button, Input } from '../ui';
import { RolUsuario } from '../../interfaces';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    rol: RolUsuario.CLIENTE,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const { addNotification } = useNotification();
  const router = useRouter();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nombre completo
    if (!formData.nombreCompleto) {
      newErrors.nombreCompleto = 'El nombre completo es requerido';
    } else if (formData.nombreCompleto.trim().split(' ').length < 2) {
      newErrors.nombreCompleto = 'Ingresa tu nombre y apellido';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);

      addNotification({
        type: 'success',
        message: '¡Cuenta creada exitosamente!',
      });

      router.push('/dashboard');
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Error al registrarse',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre Completo"
        type="text"
        placeholder="Juan Pérez"
        value={formData.nombreCompleto}
        onChange={(value) => updateField('nombreCompleto', value)}
        error={errors.nombreCompleto}
        required
        disabled={loading}
      />

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        value={formData.email}
        onChange={(value) => updateField('email', value)}
        error={errors.email}
        required
        disabled={loading}
      />

      <Input
        label="Teléfono (Opcional)"
        type="tel"
        placeholder="+591 70123456"
        value={formData.telefono}
        onChange={(value) => updateField('telefono', value)}
        disabled={loading}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Cuenta *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateField('rol', RolUsuario.CLIENTE)}
            disabled={loading}
            className={`
              p-3 rounded-lg border-2 transition-all
              ${formData.rol === RolUsuario.CLIENTE
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
              }
              disabled:opacity-50
            `}
          >
            <span className="font-medium">Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => updateField('rol', RolUsuario.FOTOGRAFO)}
            disabled={loading}
            className={`
              p-3 rounded-lg border-2 transition-all
              ${formData.rol === RolUsuario.FOTOGRAFO
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
              }
              disabled:opacity-50
            `}
          >
            <span className="font-medium">Fotógrafo</span>
          </button>
        </div>
      </div>

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={(value) => updateField('password', value)}
        error={errors.password}
        required
        disabled={loading}
      />

      <Input
        label="Confirmar Contraseña"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={(value) => updateField('confirmPassword', value)}
        error={errors.confirmPassword}
        required
        disabled={loading}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        Crear Cuenta
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-blue-600 hover:underline font-medium">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
