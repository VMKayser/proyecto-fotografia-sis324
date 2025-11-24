// ============================================
// TYPES - Tipos TypeScript del dominio
// ============================================

import type {
  Usuario as PrismaUsuario,
  PerfilFotografo as PrismaPerfilFotografo,
  Categoria as PrismaCategoria,
  Paquete as PrismaPaquete,
  PortafolioAlbum as PrismaPortafolioAlbum,
  PortafolioImagen as PrismaPortafolioImagen,
  Reserva as PrismaReserva,
  Resena as PrismaResena,
} from '@prisma/client';
import { RolUsuario, EstadoReserva, Moneda, EstadoComprobante } from '@prisma/client';

// Re-exportar enums
export { RolUsuario, EstadoReserva, Moneda, EstadoComprobante };

// Re-exportar tipos base de Prisma
export type Usuario = PrismaUsuario;
export type PerfilFotografo = PrismaPerfilFotografo;
export type Categoria = PrismaCategoria;
export type Paquete = PrismaPaquete;
export type PortafolioAlbum = PrismaPortafolioAlbum;
export type PortafolioImagen = PrismaPortafolioImagen;
export type Reserva = PrismaReserva;
export type Resena = PrismaResena;

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

// Usuario DTOs
export interface CreateUsuarioDTO {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: RolUsuario;
  telefono?: string;
}

export interface UpdateUsuarioDTO {
  nombreCompleto?: string;
  telefono?: string;
  activo?: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: UsuarioPublicDTO;
}

export interface UsuarioPublicDTO {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: RolUsuario;
  telefono?: string;
  activo: boolean;
}

// Perfil Fotógrafo DTOs
export interface CreatePerfilFotografoDTO {
  usuarioId: number;
  nombrePublico?: string;
  biografia?: string;
  ubicacion?: string;
  sitioWeb?: string;
  urlFotoPerfil?: string;
  urlFotoPortada?: string;
  qrPagoUrl?: string;
  qrInstrucciones?: string;
}

export interface UpdatePerfilFotografoDTO {
  nombrePublico?: string;
  biografia?: string;
  ubicacion?: string;
  sitioWeb?: string;
  urlFotoPerfil?: string;
  urlFotoPortada?: string;
  urlDocumentoIdentidad?: string | null;
  qrPagoUrl?: string | null;
  qrInstrucciones?: string | null;
}

// Paquete DTOs
export interface CreatePaqueteDTO {
  fotografoId: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  moneda?: Moneda;
  duracionHoras?: string;
  incluye?: string;
  imagenUrl?: string;
}

export interface UpdatePaqueteDTO {
  titulo?: string;
  descripcion?: string;
  precio?: number;
  duracionHoras?: string;
  incluye?: string;
  imagenUrl?: string;
  activo?: boolean;
  destacado?: boolean;
}

// Portafolio DTOs
export interface CreatePortafolioImagenDTO {
  fotografoId: number;
  urlImagen: string;
  descripcion?: string;
  orden?: number;
  destacada?: boolean;
  albumId?: number;
  albumName?: string;
}

export interface CreatePortafolioAlbumDTO {
  fotografoId: number;
  nombre: string;
  descripcion?: string;
  portadaUrl?: string;
  orden?: number;
  visible?: boolean;
}

export interface UpdatePortafolioAlbumDTO {
  nombre?: string;
  descripcion?: string | null;
  portadaUrl?: string | null;
  orden?: number;
  visible?: boolean;
}

// Reserva DTOs
export interface CreateReservaDTO {
  clienteId: number;
  fotografoId: number;
  paqueteId?: number;
  fechaEvento: Date;
  horaEvento?: string;
  ubicacionEvento?: string;
  monto: number;
  moneda?: Moneda;
  notas?: string;
}

export interface UpdateReservaDTO {
  estado?: EstadoReserva;
  fechaEvento?: Date;
  horaEvento?: string;
  ubicacionEvento?: string;
  notas?: string;
  comprobanteEstado?: EstadoComprobante;
  comprobanteUrl?: string | null;
  comprobanteNotas?: string | null;
}

export interface SubmitComprobanteDTO {
  url: string;
  notas?: string;
}

export interface ReviewComprobanteDTO {
  estado: Extract<EstadoComprobante, 'APROBADO' | 'RECHAZADO'>;
  notas?: string;
}

// Reseña DTOs
export interface CreateResenaDTO {
  reservaId: number;
  calificacion: number;
  comentario?: string;
  publicadoPor?: string;
}

export interface UpdateResenaDTO {
  respuesta?: string;
  visible?: boolean;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// INCLUDES (para queries con relaciones)
// ============================================

export interface UsuarioWithPerfil extends Usuario {
  perfilFotografo?: PerfilFotografo | null;
}

export interface PerfilFotografoComplete extends PerfilFotografo {
  id: number;
  usuarioId: number;
  usuario: Usuario;
  categorias: Array<{
    categoria: Categoria;
  }>;
  paquetes: Paquete[];
  portafolio: PortafolioImagen[];
  albums: Array<PortafolioAlbum & {
    imagenes: PortafolioImagen[];
  }>;
}

export interface ReservaComplete {
  id: number;
  clienteId: number;
  fotografoId: number;
  paqueteId?: number | null;
  fechaEvento: Date;
  horaEvento: string | null;
  ubicacionEvento: string | null;
  estado: EstadoReserva;
  monto: number;
  moneda: Moneda;
  notas: string | null;
  comprobanteEstado: EstadoComprobante;
  comprobanteUrl?: string | null;
  comprobanteNotas?: string | null;
  createdAt: Date;
  updatedAt: Date;
  cliente: Usuario;
  fotografo: Usuario;
  paquete?: Paquete | null;
  resena?: Resena | null;
}
