// CategoryRepository: thin wrapper to call the Apps Script endpoints via sheetsService
import { Category } from '../models/category.js';

const resource = 'categories';

export const CategoryRepository = {
  async list(){
    // sheetsService is a global object defined in src/frontend/services/sheetsService.js
    const res = await window.SheetsService.fetchList(resource);
    return (res && res.data) ? res.data.map(d => new Category({ id: d.id, nombre: d.nombre, tipo: d.tipo })) : [];
  },
  async get(id){
    const res = await window.SheetsService.fetchGet(resource, id);
    return (res && res.data) ? new Category(res.data) : null;
  },
  async create(category){
    const payload = category.toPayload();
    const res = await window.SheetsService.fetchCreate(resource, payload);
    return (res && res.data) ? new Category(res.data) : null;
  },
  async update(id, category){
    const payload = category.toPayload();
    const res = await window.SheetsService.fetchUpdate(resource, id, payload);
    return (res && res.data) ? new Category(res.data) : null;
  },
  async delete(id){
    const res = await window.SheetsService.fetchDelete(resource, id);
    return res && res.success;
  }
};
