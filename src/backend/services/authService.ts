// ============================================
// AUTH SERVICE - Servicio de autenticación
// Capa: Business Logic Layer
// ============================================

import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository } from '@/backend/repositories';
import { SessionService } from '@/backend/services/sessionService';
import { CreateUsuarioDTO, LoginDTO, AuthResponseDTO, UsuarioPublicDTO, RolUsuario, Usuario } from '@/backend/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

export class AuthService {
  
  /**
   * Registrar nuevo usuario
   */
  static async register(data: CreateUsuarioDTO, ipAddress?: string, userAgent?: string): Promise<AuthResponseDTO> {
    // Validar que el email no exista
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Validar email
    if (!this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    // Validar contraseña
    if (!this.isValidPassword(data.password)) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    // Crear usuario
    const user = await UserRepository.create({
      nombreCompleto: data.nombreCompleto,
      email: data.email.toLowerCase(),
      passwordHash,
      rol: data.rol,
      telefono: data.telefono,
      activo: true,
      emailVerificado: false,
    });

    // Generar token JWT
    const token = this.generateToken(user.id, user.rol);

    // Guardar sesión en BD
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días
    await SessionService.createSession(user.id, token, expiresAt, ipAddress, userAgent);

    // Retornar respuesta
    return {
      token,
      user: this.toPublicUser(user),
    };
  }

  /**
   * Iniciar sesión
   */
  static async login(data: LoginDTO, ipAddress?: string, userAgent?: string): Promise<AuthResponseDTO> {
    // Buscar usuario por email
    const user = await UserRepository.findByEmail(data.email.toLowerCase());
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      throw new Error('Usuario inactivo. Contacta al administrador.');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const token = this.generateToken(user.id, user.rol);

    // Guardar sesión en BD
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días
    await SessionService.createSession(user.id, token, expiresAt, ipAddress, userAgent);

    return {
      token,
      user: this.toPublicUser(user),
    };
  }

  /**
   * Verificar token JWT (con validación en BD)
   */
  static async verifyToken(token: string): Promise<{ userId: number; rol: RolUsuario }> {
    try {
      if (!token) {
        console.warn('[AuthService.verifyToken] Token vacío o indefinido');
        throw new Error('Token inválido o expirado');
      }

      console.debug('[AuthService.verifyToken] Inicio verificación de token');
      console.debug('[AuthService.verifyToken] Token (preview):', `${token.slice(0, 12)}...`);
      console.debug('[AuthService.verifyToken] JWT_SECRET configurado:', Boolean(process.env.JWT_SECRET));
      console.debug('[AuthService.verifyToken] Expiración configurada:', JWT_EXPIRES_IN);

      // Primero verificar JWT
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; rol: RolUsuario };
      console.debug('[AuthService.verifyToken] Token decodificado para usuario', decoded.userId, 'rol', decoded.rol);
      
      // Luego verificar en BD
      const sessionValid = await SessionService.validateToken(token);
      console.debug('[AuthService.verifyToken] Resultado validación en BD:', sessionValid);
      
      if (!sessionValid.valid) {
        console.warn('[AuthService.verifyToken] Sesión inválida o expirada en BD');
        throw new Error('Token inválido o expirado');
      }

      return { userId: decoded.userId, rol: decoded.rol };
    } catch (error) {
      console.error('[AuthService.verifyToken] Error verificando token:', error);
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(token: string): Promise<void> {
    await SessionService.deleteSession(token);
  }

  /**
   * Obtener usuario actual por token
   */
  static async getCurrentUser(token: string): Promise<UsuarioPublicDTO> {
    const { userId } = await this.verifyToken(token);
    const user = await UserRepository.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return this.toPublicUser(user);
  }

  /**
   * Generar token JWT
   */
  private static generateToken(userId: number, rol: RolUsuario): string {
    const jwtOptions: SignOptions = {
      expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };

    return jwt.sign(
      { userId, rol },
      JWT_SECRET,
      jwtOptions
    );
  }

  /**
   * Convertir usuario a DTO público (sin password)
   */
  private static toPublicUser(user: Usuario): UsuarioPublicDTO {
    return {
      id: user.id,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      rol: user.rol,
  telefono: user.telefono ?? undefined,
      activo: user.activo,
    };
  }

  /**
   * Validar formato de email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar contraseña
   */
  private static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Validar nueva contraseña
    if (!this.isValidPassword(newPassword)) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Hash nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Actualizar
    await UserRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
  }
}
