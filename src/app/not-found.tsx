

import Link from 'next/link';
import { Button } from '@/frontend/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">404</h2>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Página no encontrada</h3>
        <p className="text-gray-600 mb-8">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <Link href="/">
          <Button>
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
