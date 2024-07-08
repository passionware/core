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
        (num) => testQuery.useMappedData(testQuery.of(rd.of(1), 0), mapper, [num]),
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
});
