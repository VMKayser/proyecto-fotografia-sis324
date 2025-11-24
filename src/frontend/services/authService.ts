/**
 * 📡 Servicio de Autenticación (Frontend)
 * Maneja login, registro y gestión de tokens
 */

import { HttpClient } from './httpClient';
import { ILoginDTO, IRegisterDTO, IAuthResponse, IUsuario } from '../interfaces';
import { Usuario } from '../models';

export class AuthService {
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'auth_user';

  // ==================== AUTENTICACIÓN ====================

  static async login(credentials: ILoginDTO): Promise<IAuthResponse> {
    const response = await HttpClient.post<IAuthResponse>(
      '/auth/login',
      credentials,
      false // No requiere autenticación
    );

    if (response.success && response.data) {
      this.saveSession(response.data.token, response.data.user);
      return response.data;
    }

    throw new Error(response.error || 'Error al iniciar sesión');
  }

  static async register(data: IRegisterDTO): Promise<IAuthResponse> {
    const response = await HttpClient.post<IAuthResponse>(
      '/auth/register',
      data,
      false // No requiere autenticación
    );

    if (response.success && response.data) {
      this.saveSession(response.data.token, response.data.user);
      return response.data;
    }

    throw new Error(response.error || 'Error al registrarse');
  }

  static async getCurrentUser(): Promise<Usuario | null> {
    try {
      const response = await HttpClient.get<IUsuario>('/auth/me');
      
      if (response.success && response.data) {
        const user = Usuario.fromAPI(response.data);
        this.saveUser(user.toJSON());
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      this.clearSession();
      return null;
    }
  }

  static logout(): void {
    this.clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // ==================== GESTIÓN DE SESIÓN ====================

  private static saveSession(token: string, user: IUsuario): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private static saveUser(user: IUsuario): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private static clearSession(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getStoredUser(): Usuario | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      const parsed = JSON.parse(userData);
      return Usuario.fromAPI(parsed);
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ==================== VALIDACIONES ====================

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe tener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe tener al menos una letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe tener al menos un número');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateNombreCompleto(nombre: string): boolean {
    return nombre.trim().split(' ').length >= 2;
  }
}
