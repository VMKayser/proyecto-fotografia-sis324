/**
 * Modelo wrapper - Reserva
 */

import { IReserva } from '../interfaces';

export class Reserva {
    static fromAPI(data: IReserva): IReserva {
        return data;
    }
}
