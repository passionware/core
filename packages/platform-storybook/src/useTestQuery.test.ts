// @jest-environment jsdom
import { rd } from "@passionware/monads";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { testQuery } from "./useTestQuery";

describe("useTestQuery", () => {
  describe("useMappedData", () => {
    it("should map the data", () => {
      const mapper = vi.fn((x: number, num: number) => (x + 1) * num);
      const { result, rerender } = renderHook(
        (num) =>
          testQuery.useMappedData(testQuery.of(rd.of(1), 0), mapper, [num]),
        { initialProps: 10 },
      );
      expect(result.current).toEqual(rd.of(20));
      expect(mapper).toHaveBeenCalledTimes(1);
      rerender(10);
      expect(result.current).toEqual(rd.of(20));
      expect(mapper).toHaveBeenCalledTimes(1);

      rerender(20);
      expect(result.current).toEqual(rd.of(40));
      expect(mapper).toHaveBeenCalledTimes(2);
    });
  });
  describe("asPromise", () => {
    it("should return the data", async () => {
      const data = await testQuery.asPromise(testQuery.of(rd.of(1), 0));
      expect(data).toBe(1);
    });
    it("should throw the error", async () => {
      const error = new Error("error");
      await expect(
        testQuery.asPromise(testQuery.of(rd.ofError(error), 0)),
      ).rejects.toThrow(error);
    });
    it("should wait for the delay", async () => {
      const data = await testQuery.asPromise(testQuery.of(rd.of(1), 100));
      expect(data).toBe(1);
    });
  });
});
