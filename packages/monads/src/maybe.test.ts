// maybe.test.ts
import { assertType, AssertType, describe, expect, it, vi } from "vitest";
import { maybe } from "./maybe";

// Adjust the import path as necessary

describe("maybe utility", () => {
  describe("of", () => {
    it("should return the input value", () => {
      expect(maybe.of(5)).toBe(5);
      expect(maybe.of(null)).toBeUndefined();
      expect(maybe.of(undefined)).toBeUndefined();
    });
  });

  describe("isPresent", () => {
    it("should return true for non-null/undefined values", () => {
      expect(maybe.isPresent(5)).toBeTruthy();
      expect(maybe.isPresent("")).toBeTruthy();
      expect(maybe.isPresent(false)).toBeTruthy();
    });

    it("should return false for null or undefined", () => {
      expect(maybe.isPresent(null)).toBeFalsy();
      expect(maybe.isPresent(undefined)).toBeFalsy();
    });
  });

  describe("assertPresent", () => {
    it("should throw an error if the value is absent", () => {
      expect(() => maybe.assertPresent(null)).toThrowError("Value is absent");
      expect(() => maybe.assertPresent(undefined)).toThrowError(
        "Value is absent",
      );
    });

    it("should not throw an error if the value is present", () => {
      expect(() => maybe.assertPresent(5)).not.toThrow();
      expect(() => maybe.assertPresent("")).not.toThrow();
      expect(() => maybe.assertPresent(false)).not.toThrow();
    });
  });

  describe("isAbsent", () => {
    it("should return true for null or undefined", () => {
      expect(maybe.isAbsent(null)).toBeTruthy();
      expect(maybe.isAbsent(undefined)).toBeTruthy();
    });

    it("should return false for non-null/undefined values", () => {
      expect(maybe.isAbsent(5)).toBeFalsy();
      expect(maybe.isAbsent("")).toBeFalsy();
      expect(maybe.isAbsent(false)).toBeFalsy();
    });
  });

  describe("getOrElse", () => {
    it("should return the value if present", () => {
      expect(maybe.getOrElse(5, 10)).toBe(5);
    });

    it("should return the default value if absent", () => {
      expect(maybe.getOrElse(null, 10)).toBe(10);
      expect(maybe.getOrElse(undefined, 10)).toBe(10);
    });
  });

  describe("getOrMake", () => {
    it("should return the value if present", () => {
      expect(maybe.getOrMake(5, () => 10)).toBe(5);
    });

    it("should return the produced value if absent", () => {
      expect(maybe.getOrMake(null, () => 10)).toBe(10);
      expect(maybe.getOrMake(undefined, () => 10)).toBe(10);
    });
  });

  describe("getOrThrow", () => {
    it("should return the value if present", () => {
      expect(maybe.getOrThrow(5)).toBe(5);
    });

    it("should throw an error if absent", () => {
      expect(() => maybe.getOrThrow(null)).toThrowError(
        "Attempted to unwrap an absent value",
      );
      expect(() => maybe.getOrThrow(undefined)).toThrowError(
        "Attempted to unwrap an absent value",
      );
    });

    it("should throw a custom error message if provided", () => {
      expect(() => maybe.getOrThrow(null, "You are wrong!")).toThrowError(
        "You are wrong!",
      );
      expect(() => maybe.getOrThrow(undefined, "You are wrong!")).toThrowError(
        "You are wrong!",
      );
    });
  });

  describe("getOrUndefined", () => {
    it("should return the value if present", () => {
      expect(maybe.getOrUndefined(5)).toBe(5);
    });

    it("should return undefined if absent", () => {
      expect(maybe.getOrUndefined(null)).toBeUndefined();
      expect(maybe.getOrUndefined(undefined)).toBeUndefined();
    });
  });

  describe("getOrNull", () => {
    it("should return the value if present", () => {
      expect(maybe.getOrNull(5)).toBe(5);
    });

    it("should return null if absent", () => {
      expect(maybe.getOrNull(null)).toBeNull();
      expect(maybe.getOrNull(undefined)).toBeNull();
    });
  });

  describe("map", () => {
    it("should apply the function to the value if present", () => {
      expect(maybe.map(5, (x) => x * 2)).toBe(10);
    });

    it("should return null if absent", () => {
      expect(maybe.map(maybe.of<number>(null), (x) => x * 2)).toBeUndefined();
      expect(
        maybe.map(maybe.of<number>(undefined), (x) => x * 2),
      ).toBeUndefined();
    });

    it("it should return the present type if the argument is statically known as present", () => {
      const value = 5;
      const result = maybe.map(value, (x) => x * 2);
      assertType<number>(result);
      expect(result).toBe(10);
    });
  });

  describe("call", () => {
    it("should call the function with the value if present", () => {
      const fn = vi.fn();
      maybe.call(5, fn);
      expect(fn).toHaveBeenCalledWith(5);
    });

    it("should not call the function if absent", () => {
      const fn = vi.fn();
      maybe.call(maybe.of<number>(null), fn);
      expect(fn).not.toHaveBeenCalled();
      maybe.call(maybe.of<number>(undefined), fn);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("callOrFallback", () => {
    it("should call the function with the value if present", () => {
      const fn = vi.fn();
      maybe.callOrFallback(5, fn, () => 0);
      expect(fn).toHaveBeenCalledWith(5);
    });

    it("should call the fallback function if absent", () => {
      const fn = vi.fn();
      const fallback = vi.fn(() => 0);
      maybe.callOrFallback(maybe.of<number>(null), fn, fallback);
      expect(fn).not.toHaveBeenCalled();
      expect(fallback).toHaveBeenCalled();
      maybe.callOrFallback(maybe.of<number>(undefined), fn, fallback);
      expect(fn).not.toHaveBeenCalled();
      expect(fallback).toHaveBeenCalled();
    });
  });

  describe("mapOrElse", () => {
    it("should apply the function to the value if present", () => {
      expect(maybe.mapOrElse(5, (x) => x * 2, 0)).toBe(10);
    });

    it("should return the default value if absent", () => {
      expect(maybe.mapOrElse(maybe.of<number>(null), (x) => x * 2, 0)).toBe(0);
      expect(
        maybe.mapOrElse(maybe.of<number>(undefined), (x) => x * 2, 0),
      ).toBe(0);
    });
  });

  describe("mapOrMake", () => {
    it("should apply the function to the value if present", () => {
      expect(
        maybe.mapOrMake(
          5,
          (x) => x * 2,
          () => 0,
        ),
      ).toBe(10);
    });

    it("should return the produced value if absent", () => {
      expect(
        maybe.mapOrMake(
          maybe.of<number>(null),
          (x) => x * 2,
          () => 0,
        ),
      ).toBe(0);
      expect(
        maybe.mapOrMake(
          maybe.of<number>(undefined),
          (x) => x * 2,
          () => 0,
        ),
      ).toBe(0);
    });
  });

  describe("mapOrThrow", () => {
    it("should apply the function to the value if present", () => {
      expect(maybe.mapOrThrow(5, (x) => x * 2)).toBe(10);
    });

    it("should throw an error if absent", () => {
      expect(() =>
        maybe.mapOrThrow(maybe.of<number>(null), (x) => x * 2),
      ).toThrowError("Attempted to unwrap an absent value");
      expect(() =>
        maybe.mapOrThrow(
          maybe.of<number>(undefined),
          (x) => x * 2,
          "You are wrong!",
        ),
      ).toThrowError("You are wrong!");
    });
  });

  describe("mapOrUndefined", () => {
    it("should apply the function to the value if present", () => {
      expect(maybe.mapOrUndefined(5, (x) => x * 2)).toBe(10);
    });

    it("should return undefined if absent", () => {
      expect(
        maybe.mapOrUndefined(maybe.of<number>(null), (x) => x * 2),
      ).toBeUndefined();
      expect(
        maybe.mapOrUndefined(maybe.of<number>(undefined), (x) => x * 2),
      ).toBeUndefined();
    });
  });

  describe("mapOrNull", () => {
    it("should apply the function to the value if present", () => {
      expect(maybe.mapOrNull(5, (x) => x * 2)).toBe(10);
    });

    it("should return null if absent", () => {
      expect(maybe.mapOrNull(maybe.of<number>(null), (x) => x * 2)).toBeNull();
      expect(
        maybe.mapOrNull(maybe.of<number>(undefined), (x) => x * 2),
      ).toBeNull();
    });
  });

  describe("flatMapOrElse", () => {
    it("should return the value if present", () => {
      expect(maybe.flatMapOrElse(5, (x) => maybe.of(x * 2), 0)).toBe(10);
    });

    it("should return the default value if absent", () => {
      expect(maybe.flatMapOrElse(null, (x) => maybe.of(x * 2), 0)).toBe(0);
      expect(maybe.flatMapOrElse(undefined, (x) => maybe.of(x * 2), 0)).toBe(0);
    });

    it("should return the default value if the mapping function returns an absent value", () => {
      expect(maybe.flatMapOrElse(5, () => null, 0)).toBe(0);
      expect(maybe.flatMapOrElse(null, () => undefined, 0)).toBe(0);
    });
  });

  describe("flatMapOrMake", () => {
    it("should return the value if present", () => {
      expect(
        maybe.flatMapOrMake(
          5,
          (x) => maybe.of(x * 2),
          () => 0,
        ),
      ).toBe(10);
    });

    it("should return the produced value if absent", () => {
      expect(
        maybe.flatMapOrMake(
          null,
          (x) => maybe.of(x * 2),
          () => 0,
        ),
      ).toBe(0);
      expect(
        maybe.flatMapOrMake(
          undefined,
          (x) => maybe.of(x * 2),
          () => 0,
        ),
      ).toBe(0);
    });

    it("should return the produced value if the mapping function returns an absent value", () => {
      expect(
        maybe.flatMapOrMake(
          5,
          () => null,
          () => 0,
        ),
      ).toBe(0);
      expect(
        maybe.flatMapOrMake(
          null,
          () => undefined,
          () => 0,
        ),
      ).toBe(0);
    });
  });

  describe("filter", () => {
    it("should return the value if it satisfies the predicate", () => {
      expect(maybe.filter(5, (x) => x > 3)).toBe(5);
    });

    it("should return null if the value does not satisfy the predicate", () => {
      expect(maybe.filter(2, (x) => x > 3)).toBeUndefined();
    });

    it("should return null if absent", () => {
      expect(
        maybe.filter(maybe.of<number>(null), (x) => x > 3),
      ).toBeUndefined();
      expect(
        maybe.filter(maybe.of<number>(undefined), (x) => x > 3),
      ).toBeUndefined();
    });
  });

  describe("filterOrElse", () => {
    it("should return the value if it satisfies the predicate", () => {
      expect(maybe.filterOrElse(5, (x) => x > 3, 0)).toBe(5);
    });

    it("should return the default value if the value does not satisfy the predicate", () => {
      expect(maybe.filterOrElse(2, (x) => x > 3, 0)).toBe(0);
    });

    it("should return the default value if absent", () => {
      expect(maybe.filterOrElse(null, (x) => x > 3, 0)).toBe(0);
      expect(maybe.filterOrElse(undefined, (x) => x > 3, 0)).toBe(0);
    });
  });

  describe("filterOrMake", () => {
    it("should return the value if it satisfies the predicate", () => {
      expect(
        maybe.filterOrMake(
          5,
          (x) => x > 3,
          () => 0,
        ),
      ).toBe(5);
    });

    it("should return the produced value if the value does not satisfy the predicate", () => {
      expect(
        maybe.filterOrMake(
          2,
          (x) => x > 3,
          () => 0,
        ),
      ).toBe(0);
    });

    it("should return the produced value if absent", () => {
      expect(
        maybe.filterOrMake(
          null,
          (x) => x > 3,
          () => 0,
        ),
      ).toBe(0);
      expect(
        maybe.filterOrMake(
          undefined,
          (x) => x > 3,
          () => 0,
        ),
      ).toBe(0);
    });
  });

  describe("maybe.combine", () => {
    it("should combine multiple present Maybes into a single Maybe object", () => {
      const maybe1 = maybe.of(10);
      const maybe2 = maybe.of("text");
      const maybe3 = maybe.of(true);

      const combined = maybe.combine({ maybe1, maybe2, maybe3 });

      // Check that the combined is present and has the correct structure and values
      expect(combined).toEqual({
        maybe1: 10,
        maybe2: "text",
        maybe3: true,
      });
    });

    it("should return null (or undefined) if any of the Maybes is absent", () => {
      const maybe1 = maybe.of(10);
      const maybe2 = maybe.of(null);
      const maybe3 = maybe.of(true);

      const combined = maybe.combine({ maybe1, maybe2, maybe3 });

      // Check that the combined is null or undefined due to the absence of maybe2
      expect(combined).toBeUndefined(); // or toBeUndefined(), depending on your implementation
    });

    it("should work correctly with different types of values", () => {
      const maybeNumber = maybe.of(42);
      const maybeString = maybe.of("hello");
      const maybeBoolean = maybe.of(false);

      const combined = maybe.combine({
        maybeNumber,
        maybeString,
        maybeBoolean,
      });

      // Check that the combined Maybe object contains all the correct types and values
      expect(combined).toEqual({
        maybeNumber: 42,
        maybeString: "hello",
        maybeBoolean: false,
      });
    });

    it("should return null (or undefined) for an empty input object", () => {
      const combined = maybe.combine({});

      // Check that combining an empty object results in null or undefined
      expect(combined).toBeUndefined(); // or toBeUndefined(), depending on your preference
    });
  });

  describe("fromTruthy", () => {
    it("should return the value if it is truthy", () => {
      expect(maybe.fromTruthy(5)).toBe(5);
      expect(maybe.fromTruthy(" ")).toBe(" ");
      expect(maybe.fromTruthy(true)).toBe(true);
    });

    it("should return undefined if the value is falsy", () => {
      expect(maybe.fromTruthy(null)).toBe(maybe.ofAbsent());
      expect(maybe.fromTruthy("")).toBe(maybe.ofAbsent());
      expect(maybe.fromTruthy(0)).toBe(maybe.ofAbsent());
      expect(maybe.fromTruthy(undefined)).toBe(maybe.ofAbsent());
    });
  });
});
