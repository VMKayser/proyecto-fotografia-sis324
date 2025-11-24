'use client';

import { useEffect } from 'react';
import { Button } from '@/frontend/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Algo salió mal!</h2>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>
            Intentar de nuevo
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
