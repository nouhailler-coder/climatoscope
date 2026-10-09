/**
 * ClimatOSCOPE — IndexedDB Offline Cache Engine
 * High-performance, zero-external-dependency IndexedDB storage.
 */

import { InternalDataset } from '../types/dataset';

const DB_NAME = 'ClimatOSCOPE_DB';
const DB_VERSION = 1;
const STORE_DATASETS = 'datasets';

class ClimatOSCOPEDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DATASETS)) {
          db.createObjectStore(STORE_DATASETS, { keyPath: 'metadata.id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  async saveDataset(dataset: InternalDataset): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DATASETS, 'readwrite');
      const store = tx.objectStore(STORE_DATASETS);
      const request = store.put(dataset);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDataset(id: string): Promise<InternalDataset | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATASETS, 'readonly');
        const store = tx.objectStore(STORE_DATASETS);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  async getAllDatasets(): Promise<InternalDataset[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATASETS, 'readonly');
        const store = tx.objectStore(STORE_DATASETS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  async clearCache(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATASETS, 'readwrite');
        const store = tx.objectStore(STORE_DATASETS);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // ignore
    }
  }
}

export const dbService = new ClimatOSCOPEDatabase();
