/**
 * 💰 CONFIGURACIÓN DE MONETIZACIÓN
 * Constantes para comisiones, planes y precios
 */

// ============================================
// COMISIONES POR RESERVA
// ============================================
export const COMISION_CONFIG = {
  // Porcentaje de comisión por defecto (5%)
  PORCENTAJE_DEFECTO: 0.05,
  
  // Comisiones por plan de suscripción
  PORCENTAJE_GRATUITO: 0.10,    // 10% - Plan gratuito
  PORCENTAJE_BASICO: 0.07,      // 7% - Plan básico
  PORCENTAJE_PROFESIONAL: 0.05, // 5% - Plan profesional
  PORCENTAJE_PREMIUM: 0.03,     // 3% - Plan premium
  
  // Monto mínimo de comisión (en BOB)
  MINIMO_BOB: 5,
  MINIMO_USD: 1,
} as const;

// ============================================
// PERFILES DESTACADOS - PRECIOS
// ============================================
export const DESTACADO_CONFIG = {
  // Precios en BOB
  PRECIO_7_DIAS: 50,
  PRECIO_30_DIAS: 150,
  PRECIO_90_DIAS: 350,
  
  // Descuentos (para mostrar en UI)
  DESCUENTO_30_DIAS: 0.14, // 14% ahorro vs 7 días
  DESCUENTO_90_DIAS: 0.30, // 30% ahorro vs 7 días
  
  // Días disponibles
  DIAS_OPCIONES: [7, 30, 90],
} as const;

// ============================================
// PLANES DE SUSCRIPCIÓN (para futuro)
// ============================================
export const SUSCRIPCION_CONFIG = {
  GRATUITO: {
    precio: 0,
    paquetesMaximo: 3,
    imagenesPortafolio: 10,
    albumsMaximo: 1,
    comision: 0.10, // 10%
  },
  BASICO: {
    precio: 49,
    paquetesMaximo: 10,
    imagenesPortafolio: 30,
    albumsMaximo: 3,
    comision: 0.07, // 7%
  },
  PROFESIONAL: {
    precio: 149,
    paquetesMaximo: -1, // Ilimitado
    imagenesPortafolio: 100,
    albumsMaximo: 10,
    comision: 0.05, // 5%
  },
  PREMIUM: {
    precio: 299,
    paquetesMaximo: -1, // Ilimitado
    imagenesPortafolio: 500,
    albumsMaximo: -1, // Ilimitado
    comision: 0.03, // 3%
  },
} as const;

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Calcula la comisión para una reserva
 */
export function calcularComision(
  monto: number,
  moneda: 'BOB' | 'USD' = 'BOB',
  porcentaje?: number
): number {
  const porcentajeComision = porcentaje || COMISION_CONFIG.PORCENTAJE_DEFECTO;
  const comision = monto * porcentajeComision;
  
  // Aplicar mínimo
  const minimo = moneda === 'BOB' 
    ? COMISION_CONFIG.MINIMO_BOB 
    : COMISION_CONFIG.MINIMO_USD;
  
  return Math.max(comision, minimo);
}

/**
 * Calcula el monto que recibe el fotógrafo (después de comisión)
 */
export function calcularMontoFotografo(
  montoTotal: number,
  comision: number
): number {
  return montoTotal - comision;
}

/**
 * Obtiene el precio de perfil destacado según días
 */
export function getPrecioDestacado(dias: number): number {
  switch (dias) {
    case 7:
      return DESTACADO_CONFIG.PRECIO_7_DIAS;
    case 30:
      return DESTACADO_CONFIG.PRECIO_30_DIAS;
    case 90:
      return DESTACADO_CONFIG.PRECIO_90_DIAS;
    default:
      throw new Error('Duración no válida para perfil destacado');
  }
}

/**
 * Verifica si un fotógrafo está actualmente destacado
 */
export function isPerfilDestacado(destacadoHasta: Date | null): boolean {
  if (!destacadoHasta) return false;
  return new Date(destacadoHasta) > new Date();
}

/**
 * Calcula los días restantes de destacado
 */
export function diasRestantesDestacado(destacadoHasta: Date | null): number {
  if (!destacadoHasta) return 0;
  
  const ahora = new Date();
  const hasta = new Date(destacadoHasta);
  
  if (hasta <= ahora) return 0;
  
  const diffMs = hasta.getTime() - ahora.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDias;
}
