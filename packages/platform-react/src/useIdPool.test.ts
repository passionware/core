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

  it("should work with deep keys", () => {
    const { result } = renderHook(() =>
      useDynamicIdPool<{ foo: { bar: string } }>(),
    );
    expect(result.current["foo.bar"]).toMatch(/-foo.bar$/);
    expect(result.current["foo"]).toMatch(/-foo$/);
  });

  it("should work with string literal", () => {
    const { result } = renderHook(() =>
      useDynamicIdPool<"alpha" | "beta" | "gam.ma">(),
    );
    expect(result.current["alpha"]).toMatch(/-alpha$/);
    expect(result.current["beta"]).toMatch(/-beta$/);
    expect(result.current["gam.ma"]).toMatch(/-gam.ma$/);
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
