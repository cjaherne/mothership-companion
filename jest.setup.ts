import "@testing-library/jest-dom";

// Mock fetch for syncRunStateToApi (used by createRun)
global.fetch = jest.fn(() => Promise.resolve({ ok: true } as Response));

// Mock localStorage for runs
const storage = new Map<string, string>();
Object.defineProperty(global, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
    get length() {
      return storage.size;
    },
    key: (i: number) => Array.from(storage.keys())[i] ?? null,
  },
  writable: true,
});

// Reset storage before each test
beforeEach(() => {
  storage.clear();
});
