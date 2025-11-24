import { PhotographerCategory } from '../models/photographerCategory.js';
export const PhotographerCategoryRepository = {
  async list(){ const res = await window.SheetsService.fetchList('photographer_categories'); return (res && res.data) ? res.data.map(d=> new PhotographerCategory(d)) : []; },
  async get(id){ const res = await window.SheetsService.fetchGet('photographer_categories', id); return res && res.data ? new PhotographerCategory(res.data) : null; },
  async create(item){ const res = await window.SheetsService.fetchCreate('photographer_categories', item.toPayload()); return res && res.data ? new PhotographerCategory(res.data) : null; },
  async update(id,item){ const res = await window.SheetsService.fetchUpdate('photographer_categories', id, item.toPayload()); return res && res.data ? new PhotographerCategory(res.data) : null; },
  async delete(id){ const res = await window.SheetsService.fetchDelete('photographer_categories', id); return res && res.success; }
};
