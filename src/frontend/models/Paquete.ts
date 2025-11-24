/**
 * Modelo wrapper - Paquete
 */

import { IPaquete } from '../interfaces';

export class Paquete {
    static fromAPI(data: IPaquete): IPaquete {
        return data;
    }
}
