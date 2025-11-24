/**
 * Modelo wrapper - Usuario
 */

import { IUsuario, RolUsuario, IPerfilFotografo } from '../interfaces';

export class Usuario implements IUsuario {
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

    constructor(data: IUsuario) {
        this.id = data.id;
        this.nombreCompleto = data.nombreCompleto;
        this.email = data.email;
        this.telefono = data.telefono;
        this.rol = data.rol;
        this.activo = data.activo;
        this.emailVerificado = data.emailVerificado;
        this.creadoEn = new Date(data.creadoEn);
        this.actualizadoEn = new Date(data.actualizadoEn);
        this.perfilFotografo = data.perfilFotografo;
    }

    static fromAPI(data: IUsuario): Usuario {
        return new Usuario(data);
    }

    get esFotografo(): boolean {
        return this.rol === RolUsuario.FOTOGRAFO;
    }

    get esCliente(): boolean {
        return this.rol === RolUsuario.CLIENTE;
    }

    get esAdmin(): boolean {
        return this.rol === RolUsuario.ADMIN;
    }

    toJSON(): IUsuario {
        return {
            id: this.id,
            nombreCompleto: this.nombreCompleto,
            email: this.email,
            telefono: this.telefono,
            rol: this.rol,
            activo: this.activo,
            emailVerificado: this.emailVerificado,
            creadoEn: this.creadoEn,
            actualizadoEn: this.actualizadoEn,
            perfilFotografo: this.perfilFotografo
        };
    }
}
