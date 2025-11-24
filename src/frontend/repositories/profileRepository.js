import { Profile } from '../models/profile.js';
export const ProfileRepository = {
  async list(){ const res = await window.SheetsService.fetchList('profiles'); return (res && res.data) ? res.data.map(d=> new Profile(d)) : []; },
  async get(id){ const res = await window.SheetsService.fetchGet('profiles', id); return res && res.data ? new Profile(res.data) : null; },
  async create(item){ const res = await window.SheetsService.fetchCreate('profiles', item.toPayload()); return res && res.data ? new Profile(res.data) : null; },
  async update(id,item){ const res = await window.SheetsService.fetchUpdate('profiles', id, item.toPayload()); return res && res.data ? new Profile(res.data) : null; },
  async delete(id){ const res = await window.SheetsService.fetchDelete('profiles', id); return res && res.success; }
};
