import { Review } from '../models/review.js';
export const ReviewRepository = {
  async list(){ const res = await window.SheetsService.fetchList('reviews'); return (res && res.data) ? res.data.map(d=> new Review(d)) : []; },
  async get(id){ const res = await window.SheetsService.fetchGet('reviews', id); return res && res.data ? new Review(res.data) : null; },
  async create(item){ const res = await window.SheetsService.fetchCreate('reviews', item.toPayload()); return res && res.data ? new Review(res.data) : null; },
  async update(id,item){ const res = await window.SheetsService.fetchUpdate('reviews', id, item.toPayload()); return res && res.data ? new Review(res.data) : null; },
  async delete(id){ const res = await window.SheetsService.fetchDelete('reviews', id); return res && res.success; }
};
