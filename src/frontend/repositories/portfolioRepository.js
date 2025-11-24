import { PortfolioItem } from '../models/portfolioItem.js';
export const PortfolioRepository = {
  async list(){ const res = await window.SheetsService.fetchList('portfolio'); return (res && res.data) ? res.data.map(d=> new PortfolioItem(d)) : []; },
  async get(id){ const res = await window.SheetsService.fetchGet('portfolio', id); return res && res.data ? new PortfolioItem(res.data) : null; },
  async create(item){ const res = await window.SheetsService.fetchCreate('portfolio', item.toPayload()); return res && res.data ? new PortfolioItem(res.data) : null; },
  async update(id,item){ const res = await window.SheetsService.fetchUpdate('portfolio', id, item.toPayload()); return res && res.data ? new PortfolioItem(res.data) : null; },
  async delete(id){ const res = await window.SheetsService.fetchDelete('portfolio', id); return res && res.success; }
};
