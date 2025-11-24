/**
 * 📡 Cliente HTTP Base
 * Configuración central para todas las llamadas a la API
 */

import { IApiResponse } from '../interfaces';

const LOCAL_HOST_PATTERN = /localhost|127\.0\.0\.1/i;

const resolveApiBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  const defaultServerUrl = 'http://localhost:3000/api';

  const normalizeOrigin = (origin: string) => origin.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    if (!configured || LOCAL_HOST_PATTERN.test(configured)) {
      return `${normalizeOrigin(window.location.origin)}/api`;
    }

    if (configured.startsWith('/')) {
      return configured;
    }

    return configured;
  }

  if (!configured) {
    return defaultServerUrl;
  }

  if (configured.startsWith('/')) {
    return `http://localhost:3000${configured}`;
  }

  return configured;
};

const API_BASE_URL = resolveApiBaseUrl();

export class HttpClient {
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private static getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<IApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error en la petición');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    if (isJson) {
      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    }

    return {
      success: true,
      data: null as any
    };
  }

  static async get<T>(endpoint: string, includeAuth: boolean = true): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse<T>(response);
  }

  static async post<T>(
    endpoint: string,
    body: any,
    includeAuth: boolean = true
  ): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response);
  }

  static async put<T>(
    endpoint: string,
    body: any,
    includeAuth: boolean = true
  ): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response);
  }

  static async patch<T>(
    endpoint: string,
    body: any,
    includeAuth: boolean = true
  ): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse<T>(response);
  }

  static async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<IApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}
