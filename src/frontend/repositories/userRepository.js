import { User } from '../models/user.js';
export const UserRepository = {
  async list(){ const res = await window.SheetsService.fetchList('users'); return (res && res.data) ? res.data.map(d=> new User(d)) : []; },
  async get(id){ const res = await window.SheetsService.fetchGet('users', id); return res && res.data ? new User(res.data) : null; },
  async create(user){ const payload = Object.assign({}, user.toPayload()); payload.password = user.password || ''; const res = await window.SheetsService.fetchCreate('users', payload); return res && res.data ? new User(res.data) : null; },
  async login(email, password){
    // call the Apps Script users.login action
    const payload = { email, password };
    if (window.SheetsService && window.SheetsService.fetchCreate){
      return await window.SheetsService.fetchCreate('users','login', payload);
    }
    // fallback to direct fetch using global WEB_APP_URL/KEY
    const url = (window.WEB_APP_URL || '') + '?resource=users&action=login&key=' + (window.WEB_APP_KEY || '');
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    return await r.json();
  },
  async update(id, user){ const res = await window.SheetsService.fetchUpdate('users', id, user.toPayload()); return res && res.data ? new User(res.data) : null; },
  async delete(id){ const res = await window.SheetsService.fetchDelete('users', id); return res && res.success; }
};
