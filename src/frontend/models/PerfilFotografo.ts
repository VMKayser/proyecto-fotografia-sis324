/**
 * Modelos simples - Solo pasan los tipos de interfaces
 * Los modelos legacy fueron eliminados, estos son wrappers mínimos
 */

import { IPerfilFotografo } from '../interfaces';

export class PerfilFotografo {
    static fromAPI(data: IPerfilFotografo): IPerfilFotografo {
        return data; // Simplemente retorna el tipo de interface
    }
}
