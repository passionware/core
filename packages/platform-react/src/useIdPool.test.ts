// @jest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDynamicIdPool, useIdPool } from "./useIdPool"; // replace with the correct path to your module

describe("useDynamicIdPool", () => {
  it("should return dynamic ids based on keys", () => {
    const { result } = renderHook(() =>
      useDynamicIdPool<{ foo: string; bar: string }>(),
    );

    const baseIdRegex = /-foo$/;
    expect(result.current.foo).toMatch(baseIdRegex);

    const baseIdRegexBar = /-bar$/;
    expect(result.current.bar).toMatch(baseIdRegexBar);
  });

  it("should return dynamic ids for arbitrary keys", () => {
    const { result } = renderHook(() =>
      useDynamicIdPool<Record<string, unknown>>(),
    );

    const baseIdRegex = /-anyKey$/;
    expect(result.current.anyKey).toMatch(baseIdRegex);
  });
});

describe("useIdPool", () => {
  it("should return ids for a given shape", () => {
    const { result } = renderHook(() => useIdPool({ foo: "", bar: "" }));

    const baseIdRegex = /-foo$/;
    expect(result.current.foo).toMatch(baseIdRegex);

    const baseIdRegexBar = /-bar$/;
    expect(result.current.bar).toMatch(baseIdRegexBar);
  });
});
