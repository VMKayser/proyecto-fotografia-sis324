import { Package } from '../models/package.js';
const resource = 'packages';
export const PackageRepository = {
  async list(){ const res = await window.SheetsService.fetchList('packages'); return (res && res.data) ? res.data.map(d=> new Package(d)) : []; },
  async get(id){ const res = await window.SheetsService.fetchGet('packages', id); return res && res.data ? new Package(res.data) : null; },
  async create(item){ const res = await window.SheetsService.fetchCreate('packages', item.toPayload()); return res && res.data ? new Package(res.data) : null; },
  async update(id, item){ const res = await window.SheetsService.fetchUpdate('packages', id, item.toPayload()); return res && res.data ? new Package(res.data) : null; },
  async delete(id){ const res = await window.SheetsService.fetchDelete('packages', id); return res && res.success; }
};
