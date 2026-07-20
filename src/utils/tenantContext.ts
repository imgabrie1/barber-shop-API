import { AsyncLocalStorage } from "async_hooks";

interface TenantStore {
  tenantId: string | undefined;
  bypass: boolean;
}

const storage = new AsyncLocalStorage<TenantStore>();

export const TenantContext = {
  run<T>(tenantId: string | undefined, callback: () => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      storage.run({ tenantId, bypass: false }, async () => {
        try {
          resolve(await callback());
        } catch (err) {
          reject(err);
        }
      });
    });
  },

  getTenantId(): string | undefined {
    return storage.getStore()?.tenantId;
  },

  isBypassed(): boolean {
    return storage.getStore()?.bypass === true;
  },

  async bypass<T>(callback: () => Promise<T> | T): Promise<T> {
    const store = storage.getStore();
    if (store) {
      const originalBypass = store.bypass;
      store.bypass = true;
      try {
        return await callback();
      } finally {
        store.bypass = originalBypass;
      }
    } else {
      return storage.run({ tenantId: undefined, bypass: true }, async () => {
        return await callback();
      });
    }
  }
};
