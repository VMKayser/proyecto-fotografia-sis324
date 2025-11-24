import { Reservation } from '../models/reservation.js';
export const ReservationRepository = {
  async list(){ const res = await window.SheetsService.fetchList('reservations'); return (res && res.data) ? res.data.map(d=> new Reservation(d)) : []; },
  async get(id){ const res = await window.SheetsService.fetchGet('reservations', id); return res && res.data ? new Reservation(res.data) : null; },
  async create(item){ const res = await window.SheetsService.fetchCreate('reservations', item.toPayload()); return res && res.data ? new Reservation(res.data) : null; },
  async update(id,item){ const res = await window.SheetsService.fetchUpdate('reservations', id, item.toPayload()); return res && res.data ? new Reservation(res.data) : null; },
  async delete(id){ const res = await window.SheetsService.fetchDelete('reservations', id); return res && res.success; }
};
