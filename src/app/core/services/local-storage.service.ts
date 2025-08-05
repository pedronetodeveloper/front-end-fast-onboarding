import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  getItem<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  setItem<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  addItem<T>(key: string, item: T): void {
    const items = this.getItem<T>(key);
    items.push(item);
    this.setItem(key, items);
  }

  updateItem<T extends { id: any }>(key: string, item: T): void {
    const items = this.getItem<T>(key);
    const idx = items.findIndex(i => i.id === item.id);
    if (idx > -1) {
      items[idx] = item;
      this.setItem(key, items);
    }
  }

  removeItem<T extends { id: any }>(key: string, id: any): void {
    const items = this.getItem<T>(key);
    this.setItem(key, items.filter(i => i.id !== id));
  }

  clear(key: string): void {
    localStorage.removeItem(key);
  }
}
