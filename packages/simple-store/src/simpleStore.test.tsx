import { describe, expect, it, vi } from 'vitest';
import { createSimpleStore } from './simpleStore';

describe('simpleStore', () => {
  it('should create a simple store', async () => {
    const store = createSimpleStore(3);

    const listener = vi.fn();
    store.addUpdateListener(listener);
    expect(store.getCurrentValue()).toBe(3);

    expect(listener).not.toHaveBeenCalled();

    store.setNewValue(4);
    expect(store.getCurrentValue()).toBe(4);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(4, undefined);
  });

  it('should fire change listener even if value did not change effectively', async () => {
    const store = createSimpleStore(3);

    const listener = vi.fn();
    store.addUpdateListener(listener);
    expect(store.getCurrentValue()).toBe(3);
    expect(listener).not.toHaveBeenCalled();

    listener.mockClear();
    store.setNewValue(3);
    expect(store.getCurrentValue()).toBe(3);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(3, undefined);

    listener.mockClear();
    store.setNewValue(3);
    expect(store.getCurrentValue()).toBe(3);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(3, undefined);
  });

  it('should create a simple store with metadata', async () => {
    const store = createSimpleStore<number, { type: 'own' | 'external' }>(3);

    const listener = vi.fn();
    store.addUpdateListener(listener);
    expect(store.getCurrentValue()).toBe(3);

    expect(listener).not.toHaveBeenCalled();

    store.setNewValue(4, { type: 'own' });
    expect(store.getCurrentValue()).toBe(4);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(4, { type: 'own' });

    listener.mockClear();
    store.setNewValue(2, { type: 'external' });
    expect(store.getCurrentValue()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(2, { type: 'external' });
  });
});
