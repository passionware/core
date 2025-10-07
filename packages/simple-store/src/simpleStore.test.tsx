import { describe, expect, it, vi } from "vitest";
import { createSimpleStore } from "./simpleStore";

describe("simpleStore", () => {
  it("should create a simple store", async () => {
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

  it("should fire change listener even if value did not change effectively", async () => {
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

  it("should create a simple store with metadata", async () => {
    const store = createSimpleStore<number, { type: "own" | "external" }>(3);

    const listener = vi.fn();
    store.addUpdateListener(listener);
    expect(store.getCurrentValue()).toBe(3);

    expect(listener).not.toHaveBeenCalled();

    store.setNewValue(4, { type: "own" });
    expect(store.getCurrentValue()).toBe(4);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(4, { type: "own" });

    listener.mockClear();
    store.setNewValue(2, { type: "external" });
    expect(store.getCurrentValue()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(2, { type: "external" });
  });

  it("waitFor should resolve immediately when current value matches", async () => {
    const store = createSimpleStore(5);

    await expect(store.waitFor((v) => v === 5)).resolves.toBe(5);
  });

  it("waitFor should resolve on future matching update", async () => {
    const store = createSimpleStore(0);

    const promise = store.waitFor((v) => v === 2);

    store.setNewValue(1);
    await Promise.resolve();

    store.setNewValue(2);
    await expect(promise).resolves.toBe(2);
  });

  it("waitFor should work with type guard and return narrowed type", async () => {
    type A = { kind: "a"; a: number };
    type B = { kind: "b"; b: string };
    type U = A | B;

    const store = createSimpleStore<U>({ kind: "a", a: 1 });

    const promise = store.waitFor((v): v is B => v.kind === "b");

    store.setNewValue({ kind: "a", a: 2 });
    store.setNewValue({ kind: "b", b: "ok" });

    await expect(promise).resolves.toEqual({ kind: "b", b: "ok" });
  });

  it("waitFor should allow multiple concurrent waiters", async () => {
    const store = createSimpleStore(0);

    const p1 = store.waitFor((v) => v === 1);
    const p2 = store.waitFor((v) => v === 2);

    store.setNewValue(2);
    store.setNewValue(1);

    await expect(p1).resolves.toBe(1);
    await expect(p2).resolves.toBe(2);
  });
});
