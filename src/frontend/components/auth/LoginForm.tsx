/**
 * ⚛️ Componente LoginForm
 * Formulario de inicio de sesión
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../repositories';
import { useNotification } from '../../repositories';
import { Button, Input } from '../ui';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const router = useRouter();

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email, password });

      addNotification({
        type: 'success',
        message: '¡Bienvenido de nuevo!',
      });

      router.push('/dashboard');
    } catch (error) {
      // Mostrar mensaje específico y claro
      const message = error instanceof Error && error.message.includes('Credenciales')
        ? 'Usuario o contraseña incorrectos'
        : 'Error al iniciar sesión. Verifica tus datos.';

      addNotification({
        type: 'error',
        message,
      });

      // También mostrar visualmente en el formulario
      setErrors({
        email: ' ',
        password: 'Revisa tu usuario y contraseña'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={setEmail}
        error={errors.email}
        required
        disabled={loading}
        autoComplete="email"
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        error={errors.password}
        required
        disabled={loading}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        Iniciar Sesión
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a href="/registro" className="text-blue-600 hover:underline font-medium">
          Regístrate aquí
        </a>
      </p>
    </form>
  );
}
