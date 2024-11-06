// @jest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createSimpleSignal } from "./simpleSignal";
import { createSimpleStore } from "./simpleStore";

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
});
