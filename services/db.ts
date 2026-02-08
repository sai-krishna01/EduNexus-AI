
import { User, Group, Message, SystemSettings, SupportTicket, DEFAULT_SETTINGS, UserRole } from '../types';

const DB_NAME = 'EduNexus_V2_Production';
const DB_VERSION = 3; // Bump for Schema Updates

class DatabaseService {
  private db: IDBDatabase | null = null;

  async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject("Database connection failed");

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = (event.target as IDBOpenDBRequest).transaction!;
        
        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id' });
          store.createIndex('username', 'username', { unique: true });
        }
        if (!db.objectStoreNames.contains('groups')) {
          db.createObjectStore('groups', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', { keyPath: 'id' });
          store.createIndex('groupId', 'groupId', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tickets')) {
          db.createObjectStore('tickets', { keyPath: 'id' });
        }

        // Seed Initial Data
        const settingsStore = tx.objectStore('settings');
        settingsStore.put(DEFAULT_SETTINGS);
        
        const userStore = tx.objectStore('users');
        userStore.put({
            id: 'founder_001',
            username: 'founder',
            fullName: 'Platform Founder',
            email: 'founder@edunexus.ai',
            role: UserRole.FOUNDER,
            subscription: 'ENTERPRISE',
            isBlocked: false,
            createdAt: Date.now(),
            lastLogin: 0
        });
        userStore.put({
            id: 'admin_001',
            username: 'admin',
            fullName: 'System Admin',
            email: 'admin@edunexus.ai',
            role: UserRole.ADMIN,
            subscription: 'ENTERPRISE',
            isBlocked: false,
            createdAt: Date.now(),
            lastLogin: 0
        });
      };
    });
  }

  // --- Generic Helpers ---
  private async getStore(storeName: string, mode: IDBTransactionMode) {
    const db = await this.connect();
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  // --- Users ---
  async getUser(username: string): Promise<User | undefined> {
    const store = await this.getStore('users', 'readonly');
    const index = store.index('username');
    return new Promise(resolve => {
        const req = index.get(username);
        req.onsuccess = () => resolve(req.result);
    });
  }

  async getUserById(id: string): Promise<User | undefined> {
    const store = await this.getStore('users', 'readonly');
    return new Promise(resolve => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
    });
  }

  async createUser(user: User): Promise<void> {
    const store = await this.getStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
        const req = store.add(user);
        req.onsuccess = () => resolve();
        req.onerror = () => reject("Username already exists");
    });
  }

  async getAllUsers(): Promise<User[]> {
      const store = await this.getStore('users', 'readonly');
      return new Promise(resolve => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result);
      });
  }

  async updateUser(user: User): Promise<void> {
      const store = await this.getStore('users', 'readwrite');
      store.put(user);
  }

  async deleteUser(id: string): Promise<void> {
      const store = await this.getStore('users', 'readwrite');
      store.delete(id);
  }

  // --- Settings ---
  async getSettings(): Promise<SystemSettings> {
      const store = await this.getStore('settings', 'readonly');
      return new Promise(resolve => {
          const req = store.get('global');
          req.onsuccess = () => resolve(req.result || DEFAULT_SETTINGS);
      });
  }

  async updateSettings(settings: SystemSettings): Promise<void> {
      const store = await this.getStore('settings', 'readwrite');
      store.put(settings);
  }

  // --- Groups ---
  async createGroup(group: Group): Promise<void> {
      const store = await this.getStore('groups', 'readwrite');
      store.put(group);
  }

  async getGroups(): Promise<Group[]> {
      const store = await this.getStore('groups', 'readonly');
      return new Promise(resolve => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result);
      });
  }

  async updateGroup(group: Group): Promise<void> {
      const store = await this.getStore('groups', 'readwrite');
      store.put(group);
  }

  async deleteGroup(id: string): Promise<void> {
      const store = await this.getStore('groups', 'readwrite');
      store.delete(id);
  }

  // --- Messages ---
  async addMessage(msg: Message): Promise<void> {
      const store = await this.getStore('messages', 'readwrite');
      store.add(msg);
  }

  async getMessages(groupId: string): Promise<Message[]> {
      const store = await this.getStore('messages', 'readonly');
      const index = store.index('groupId');
      return new Promise(resolve => {
          const req = index.getAll(groupId);
          req.onsuccess = () => resolve(req.result);
      });
  }

  // --- Support Tickets ---
  async createTicket(ticket: SupportTicket): Promise<void> {
      const store = await this.getStore('tickets', 'readwrite');
      store.add(ticket);
  }

  async getTickets(): Promise<SupportTicket[]> {
      const store = await this.getStore('tickets', 'readonly');
      return new Promise(resolve => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result);
      });
  }

  async updateTicket(ticket: SupportTicket): Promise<void> {
      const store = await this.getStore('tickets', 'readwrite');
      store.put(ticket);
  }
}

export const db = new DatabaseService();
