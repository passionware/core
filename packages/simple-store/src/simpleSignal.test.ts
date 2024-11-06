// @jest-environment jsdom
import { Maybe } from "@passionware/monads";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createSimpleSignal, useSimpleSignal } from "./simpleSignal";
import { createSimpleStore, SimpleStore } from "./simpleStore";

describe("SimpleSignal", () => {
  it("should return the current value from the store", () => {
    const store = createSimpleStore(5);
    const signal = createSimpleSignal(store);

    expect(signal.current).toBe(5);

    store.setNewValue(10);
    expect(signal.current).toBe(10);
  });

  it("should update useValue hook when the store value changes", () => {
    const store = createSimpleStore(3);
    const signal = createSimpleSignal(store);

    const { result } = renderHook(() => signal.useValue());

    expect(result.current).toBe(3);

    act(() => {
      store.setNewValue(7);
    });
    expect(result.current).toBe(7);

    act(() => {
      store.setNewValue(15);
    });
    expect(result.current).toBe(15);
  });

  it("should not re-render useValue hook if set to the same value", () => {
    const store = createSimpleStore(3);
    const signal = createSimpleSignal(store);

    const { result, rerender } = renderHook(() => signal.useValue());
    const initialRenderValue = result.current;

    act(() => {
      store.setNewValue(3);
    });

    rerender();
    expect(result.current).toBe(initialRenderValue);
  });

  it("should handle metadata correctly if provided", () => {
    const store = createSimpleStore<
      number,
      { source: "internal" | "external" }
    >(10);
    const signal = createSimpleSignal(store);

    const listener = vi.fn();
    store.addUpdateListener(listener);

    act(() => {
      store.setNewValue(20, { source: "internal" });
    });

    expect(signal.current).toBe(20);
    expect(listener).toHaveBeenCalledWith(20, { source: "internal" });
  });

  describe("useSimpleSignal", () => {
    it("should return the current value from the store when the store is provided", () => {
      const store = createSimpleStore(5);

      const { result } = renderHook(() => useSimpleSignal(store));
      expect(result.current).toBe(5);

      act(() => {
        store.setNewValue(10);
      });
      expect(result.current).toBe(10);
    });

    it("should return undefined when the store is null", () => {
      const { result } = renderHook(() => useSimpleSignal(null));
      expect(result.current).toBeUndefined();
    });

    it("should re-render when the store value changes", () => {
      const store = createSimpleStore(7);

      const { result } = renderHook(() => useSimpleSignal(store));
      expect(result.current).toBe(7);

      act(() => {
        store.setNewValue(12);
      });
      expect(result.current).toBe(12);
    });

    it("should not re-render when setting the same value", () => {
      const store = createSimpleStore(9);

      const { result, rerender } = renderHook(() => useSimpleSignal(store));
      const initialRenderValue = result.current;

      act(() => {
        store.setNewValue(9);
      });

      rerender();
      expect(result.current).toBe(initialRenderValue);
    });

    it("should unsubscribe when the store is removed", () => {
      const store = createSimpleStore(4);
      const listener = vi.fn();

      const { unmount } = renderHook(() => listener(useSimpleSignal(store)));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(4);
      act(() => {
        store.setNewValue(100);
      });
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenCalledWith(100);
      unmount();
      expect(listener).toHaveBeenCalledTimes(2);
      act(() => {
        store.setNewValue(101);
      });
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });
  describe("useSimpleSignal with conditional store presence", () => {
    it("should return undefined when store is initially null, and update when store becomes available", () => {
      const { result, rerender } = renderHook(
        ({ store }) => useSimpleSignal(store),
        { initialProps: { store: null as Maybe<SimpleStore<number>> } },
      );

      // Initially, the store is null
      expect(result.current).toBeUndefined();

      // Now create a store and update the hook's props to use it
      const store = createSimpleStore(5);
      rerender({ store });

      expect(result.current).toBe(5);

      act(() => {
        store.setNewValue(10);
      });
      expect(result.current).toBe(10);
    });

    it("should unsubscribe and return undefined when store is removed", () => {
      const store = createSimpleStore(7);
      const { result, rerender } = renderHook(
        ({ store }) => useSimpleSignal(store),
        { initialProps: { store: store as Maybe<SimpleStore<number>> } },
      );

      // Initially, the store is present and value should be 7
      expect(result.current).toBe(7);

      act(() => {
        store.setNewValue(15);
      });
      expect(result.current).toBe(15);

      // Now remove the store
      rerender({ store: null });

      // When store is removed, result should be undefined
      expect(result.current).toBeUndefined();

      // Even if we update the store after it's removed, result shouldn't change
      act(() => {
        store.setNewValue(20);
      });
      expect(result.current).toBeUndefined();
    });

    it("should correctly resubscribe if store changes to a different instance", () => {
      const initialStore = createSimpleStore(10);
      const { result, rerender } = renderHook(
        ({ store }) => useSimpleSignal(store),
        { initialProps: { store: initialStore } },
      );

      expect(result.current).toBe(10);

      // Update the initial store value and verify
      act(() => {
        initialStore.setNewValue(12);
      });
      expect(result.current).toBe(12);

      // Now replace with a new store
      const newStore = createSimpleStore(20);
      rerender({ store: newStore });

      // Should now return the value from the new store
      expect(result.current).toBe(20);

      act(() => {
        newStore.setNewValue(25);
      });
      expect(result.current).toBe(25);

      // Verify that the old store updates no longer affect the result
      act(() => {
        initialStore.setNewValue(30);
      });
      expect(result.current).toBe(25); // Should remain 25 as we're subscribed to newStore
    });
  });
});
