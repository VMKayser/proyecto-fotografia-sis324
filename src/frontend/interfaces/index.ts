/**
 * 📋 Interfaces TypeScript del Frontend
 * Define los tipos para el cliente React
 */

import { ReactNode } from 'react';

// ==================== ENUMS ====================

export enum RolUsuario {
  CLIENTE = 'CLIENTE',
  FOTOGRAFO = 'FOTOGRAFO',
  ADMIN = 'ADMIN'
}

export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  RECHAZADA = 'RECHAZADA'
}

export enum Moneda {
  BOB = 'BOB',
  USD = 'USD'
}

export enum EstadoComprobante {
  NO_ENVIADO = 'NO_ENVIADO',
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO'
}

// ==================== INTERFACES DE ENTIDADES ====================

export interface IUsuario {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  rol: RolUsuario;
  activo: boolean;
  emailVerificado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  perfilFotografo?: IPerfilFotografo;
}

export interface IPerfilFotografo {
  id: number;
  usuarioId: number;
  nombrePublico?: string;
  biografia?: string;
  experiencia?: number;
  ubicacion?: string;
  sitioWeb?: string;
  instagram?: string;
  facebook?: string;
  urlFotoPerfil?: string;
  urlFotoPortada?: string;
  urlDocumentoIdentidad?: string | null;
  qrPagoUrl?: string | null;
  qrInstrucciones?: string | null;
  calificacionPromedio: number;
  totalResenas: number;
  verificado: boolean;
  destacadoHasta?: Date | string | null; // ✅ Agregado para perfiles destacados
  creadoEn: Date;
  actualizadoEn: Date;
  usuario?: IUsuario;
  categorias?: IFotografoCategoria[];
  paquetes?: IPaquete[];
  portfolio?: IPortafolioImagen[];
  portafolio?: IPortafolioImagen[];
  albums?: IPortafolioAlbum[];
  resenas?: IResena[];
}

export interface ICategoria {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  activa: boolean;
  creadoEn: Date;
  fotografos?: IFotografoCategoria[];
}

export interface IFotografoCategoria {
  id: number;
  fotografoId: number;
  categoriaId: number;
  creadoEn: Date;
  fotografo?: IPerfilFotografo;
  categoria?: ICategoria;
}

export interface IPaquete {
  id: number;
  fotografoId: number;
  nombre?: string;
  titulo?: string;
  descripcion?: string;
  precio: number;
  moneda: Moneda;
  duracion?: number;
  duracionHoras?: string;
  fotosIncluidas?: number;
  revisionesIncluidas?: number;
  caracteristicas?: string;
  incluye?: string;
  imagenUrl?: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  fotografo?: IPerfilFotografo;
  reservas?: IReserva[];
}

export interface IPortafolioImagen {
  id: number;
  fotografoId: number;
  titulo?: string;
  descripcion?: string;
  urlImagen: string;
  urlThumbnail?: string;
  categoriaId?: number;
  destacada: boolean;
  orden: number;
  creadoEn: Date;
  fotografo?: IPerfilFotografo;
  album?: IPortafolioAlbum;
}

export interface IPortafolioAlbum {
  id: number;
  fotografoId: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  portadaUrl?: string | null;
  orden: number;
  visible: boolean;
  imagenes?: IPortafolioImagen[];
}

export interface IReserva {
  id: number;
  clienteId: number;
  paqueteId: number;
  fechaEvento?: Date;
  ubicacionEvento?: string;
  estado: EstadoReserva;
  precioFinal: number;
  monto?: number;
  moneda: Moneda;
  notasCliente?: string;
  notasFotografo?: string;
  comprobanteEstado?: EstadoComprobante;
  comprobanteUrl?: string | null;
  comprobanteNotas?: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  cliente?: IUsuario;
  paquete?: IPaquete;
  resena?: IResena;
}

export interface IResena {
  id: number;
  reservaId: number;
  fotografoId: number;
  calificacion: number;
  comentario?: string;
  creadoEn: Date;
  actualizadoEn: Date;
  reserva?: IReserva;
  fotografo?: IPerfilFotografo;
}

// ==================== INTERFACES DE DTOs ====================

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IRegisterDTO {
  nombreCompleto: string;
  email: string;
  password: string;
  telefono?: string;
  rol: RolUsuario;
}

export interface ICreatePerfilDTO {
  biografia?: string;
  experiencia?: number;
  ubicacion?: string;
  sitioWeb?: string;
  instagram?: string;
  facebook?: string;
  qrPagoUrl?: string;
  qrInstrucciones?: string;
}

export interface IUpdatePerfilDTO {
  biografia?: string;
  experiencia?: number;
  ubicacion?: string;
  sitioWeb?: string;
  instagram?: string;
  facebook?: string;
  qrPagoUrl?: string | null;
  qrInstrucciones?: string | null;
}

export interface ICreatePaqueteDTO {
  nombre: string;
  descripcion?: string;
  precio: number;
  moneda: Moneda;
  duracion?: number;
  fotosIncluidas?: number;
  revisionesIncluidas?: number;
  caracteristicas?: string;
  activo?: boolean;
}

export interface IUpdatePaqueteDTO {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  moneda?: Moneda;
  duracion?: number;
  fotosIncluidas?: number;
  revisionesIncluidas?: number;
  caracteristicas?: string;
  activo?: boolean;
}

export interface ICreateReservaDTO {
  paqueteId: number;
  fechaEvento?: Date;
  ubicacionEvento?: string;
  notasCliente?: string;
  comprobanteUrl?: string;
}

export interface IUpdateReservaDTO {
  fechaEvento?: Date;
  ubicacionEvento?: string;
  estado?: EstadoReserva;
  notasCliente?: string;
  notasFotografo?: string;
  comprobanteEstado?: EstadoComprobante;
  comprobanteUrl?: string | null;
  comprobanteNotas?: string | null;
}

export interface ICreateResenaDTO {
  reservaId: number;
  calificacion: number;
  comentario?: string;
}

export interface IUploadPortafolioDTO {
  titulo?: string;
  descripcion?: string;
  categoriaId?: number;
  destacada?: boolean;
}

// ==================== INTERFACES DE RESPUESTA API ====================

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IAuthResponse {
  token: string;
  user: IUsuario;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== INTERFACES DE FILTROS ====================

export interface IFotografoFilter {
  categoriaId?: number;
  ubicacion?: string;
  calificacionMin?: number;
  precioMin?: number;
  precioMax?: number;
  verificado?: boolean;
  search?: string;
  fechaDisponible?: string;
  ordenarPor?: 'recomendados' | 'rating' | 'precio_asc' | 'precio_desc' | 'recientes';
}

export interface IPaqueteFilter {
  fotografoId?: number;
  precioMin?: number;
  precioMax?: number;
  moneda?: Moneda;
  activo?: boolean;
}

export interface IReservaFilter {
  clienteId?: number;
  fotografoId?: number;
  estado?: EstadoReserva;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

// ==================== INTERFACES DE UI ====================

export interface INotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export interface IButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface IInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

// ==================== INTERFACES DE CONTEXTO ====================

export interface IAuthContext {
  user: IUsuario | null;
  token: string | null;
  loading: boolean;
  login: (credentials: ILoginDTO) => Promise<void>;
  register: (data: IRegisterDTO) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isFotografo: boolean;
  isCliente: boolean;
  isAdmin: boolean;
}

export interface INotificationContext {
  notifications: INotification[];
  addNotification: (notification: Omit<INotification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

// ==================== INTERFACES DE CHAT ====================

export interface IConversacion {
  id: number;
  reservaId: number;
  clienteId: number;
  fotografoId: number;
  createdAt: Date;
  updatedAt: Date;
  mensajes?: IMensaje[];
  cliente?: IUsuario;
  fotografo?: IUsuario;
  reserva?: IReserva;
}

export interface IMensaje {
  id: number;
  conversacionId: number;
  remitenteId: number;
  contenido: string;
  leido: boolean;
  createdAt: Date;
  remitente?: IUsuario;
}
