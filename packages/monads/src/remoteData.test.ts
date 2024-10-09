// @jest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MappingError, rd, RemoteCombinedError } from "./remoteData";

describe("RemoteData Utility", () => {
  it("maps over success data correctly", () => {
    const successData = rd.of(10);
    const mappedData = rd.map(successData, (num) => num * 2);
    expect(mappedData).toEqual({ ...successData, data: 20 });
  });

  it("handles mapping error correctly", () => {
    const mapper = (num: number) => {
      throw new Error(`Test error + ${num}`);
    };
    const example = rd.of(10);
    expect(rd.map(example, mapper)).toEqual(
      rd.ofError(new MappingError(new Error("Test error + 10"))),
    );
    expect(() => rd.unsafeMap(example, mapper)).toThrowError(
      new MappingError(new Error("Test error + 10")),
    );
  });

  it("replace should replace the data of a success state", () => {
    expect(rd.replace(rd.of(10), 20)).toEqual(rd.of(20));
    expect(rd.replace(rd.ofPending(), 20)).toEqual(rd.ofPending());
    expect(rd.replace(rd.ofError(new Error("Test error")), 20)).toEqual(
      rd.ofError(new Error("Test error")),
    );
  });

  it("postpone should return pending if the second argument is pending", () => {
    const pendingData = rd.ofPending();
    const successData = rd.of(10);
    const errorData = rd.ofError(new Error("Test error"));
    expect(rd.postpone(successData, pendingData)).toEqual(pendingData);
    expect(rd.postpone(pendingData, pendingData)).toEqual(pendingData);
    expect(rd.postpone(errorData, pendingData)).toEqual(pendingData);
  });

  it("postpone should return first argument if the second argument is success", () => {
    const pendingData = rd.ofPending();
    const successData = rd.of(10);
    const errorData = rd.ofError(new Error("Test error"));
    expect(rd.postpone(successData, successData)).toEqual(successData);
    expect(rd.postpone(pendingData, successData)).toEqual(pendingData);
    expect(rd.postpone(errorData, successData)).toEqual(errorData);
  });

  it("postpone should return the first argument if the second argument is error", () => {
    const pendingData = rd.ofPending();
    const successData = rd.of(10);
    const errorData = rd.ofError(new Error("Test error"));
    expect(rd.postpone(successData, errorData)).toEqual(successData);
    expect(rd.postpone(pendingData, errorData)).toEqual(pendingData);
    expect(rd.postpone(errorData, errorData)).toEqual(errorData);
  });

  it("getOrElse returns fallback for non-success states", () => {
    const pendingData = rd.ofPending();
    const errorData = rd.ofError(new Error("Test error"));
    expect(rd.getOrElse(pendingData, () => 42)).toBe(42);
    expect(rd.getOrElse(errorData, () => 42)).toBe(42);
  });

  it("getOrThrow returns the data for success states", () => {
    const successData = rd.of(10);
    expect(rd.getOrThrow(successData)).toBe(10);
  });

  it("getOrThrow throws for non-success states", () => {
    const pendingData = rd.ofPending();
    const errorData = rd.ofError(new Error("Test error"));
    expect(() => rd.getOrThrow(pendingData)).toThrow();
    expect(() => rd.getOrThrow(errorData)).toThrow();
  });

  it("getOrThrow re-throws error from the state", () => {
    const pendingData = rd.ofPending();
    const errorData = rd.ofError(new Error("Test error"));
    expect(() => rd.getOrThrow(errorData, "Fallback error message")).toThrow(
      "Fallback error message: Test error",
    );
    expect(() => rd.getOrThrow(pendingData, "Fallback error message")).toThrow(
      "Fallback error message",
    );
  });

  it("mapOrElse maps over success data correctly", () => {
    const successData = rd.of(10);
    const mappedData = rd.mapOrElse(successData, (num) => num * 2, 0);
    expect(mappedData).toBe(20);
  });

  it("mapOrElse returns fallback for non-success states", () => {
    const pendingData = rd.ofPending();
    const errorData = rd.ofError(new Error("Test error"));
    expect(rd.mapOrElse(pendingData, () => 42, 0)).toBe(0);
    expect(rd.mapOrElse(errorData, () => 42, 0)).toBe(0);
  });

  it("mapOrMake maps over success data correctly", () => {
    const successData = rd.of(10);
    const mappedData = rd.mapOrMake(
      successData,
      (num) => num * 2,
      () => 0,
    );
    expect(mappedData).toBe(20);
  });

  it("mapOrMake returns fallback for non-success states", () => {
    const pendingData = rd.ofPending();
    const errorData = rd.ofError(new Error("Test error"));
    expect(
      rd.mapOrMake(
        pendingData,
        () => 42,
        () => 0,
      ),
    ).toBe(0);
    expect(
      rd.mapOrMake(
        errorData,
        () => 42,
        () => 0,
      ),
    ).toBe(0);
  });

  it("tryMap maps over success data correctly", () => {
    const successData = rd.of(10);
    const mappedData = rd.tryMap(successData, (num) => num * 2);
    expect(mappedData).toBe(20);
  });

  it("tryMap returns undefined for non-success states", () => {
    const pendingData = rd.ofPending();
    const errorData = rd.ofError(new Error("Test error"));
    expect(rd.tryMap(pendingData, () => 42)).toBe(undefined);
    expect(rd.tryMap(errorData, () => 42)).toBe(undefined);
  });

  it("mapError maps over error data correctly", () => {
    const errorData = rd.ofError(new Error("Test error"));
    const mappedData = rd.mapError(
      errorData,
      (error) => new Error(error.message + " mapped"),
    );
    expect(mappedData).toEqual(rd.ofError(new Error("Test error mapped")));
  });

  it("mapError does nothing for non-error states", () => {
    const pendingData = rd.ofPending();
    const successData = rd.of(10);
    expect(
      rd.mapError(pendingData, (error) => new Error(error.message + " mapped")),
    ).toEqual(pendingData);
    expect(
      rd.mapError(successData, (error) => new Error(error.message + " mapped")),
    ).toEqual(successData);
  });

  it("mapErrorMonadic maps over error data correctly", () => {
    const errorData = rd.ofError(new Error("Test error"));
    expect(
      rd.mapErrorMonadic(errorData, (error) =>
        rd.ofError(new Error(error.message + " mapped")),
      ),
    ).toEqual(rd.ofError(new Error("Test error mapped")));

    expect(rd.mapErrorMonadic(errorData, (error) => rd.ofPending())).toEqual(
      rd.ofPending(),
    );
  });

  it("mapErrorMonadic does nothing for non-error states", () => {
    const pendingData = rd.ofPending();
    const successData = rd.of(10);
    expect(
      rd.mapErrorMonadic(pendingData, (error) =>
        rd.ofError(new Error(error.message + " mapped")),
      ),
    ).toEqual(pendingData);
    expect(
      rd.mapErrorMonadic(successData, (error) =>
        rd.ofError(new Error(error.message + " mapped")),
      ),
    ).toEqual(successData);
  });

  describe("combine Function", () => {
    it("combines two success states correctly", () => {
      const successData1 = rd.of(10);
      const successData2 = rd.of(20);
      const combinedData = rd.combine({ a: successData1, b: successData2 });
      expect(combinedData).toEqual({
        status: "success",
        data: { a: 10, b: 20 },
        isFetching: false,
        isPlaceholderData: false,
      });
    });

    it("combines two pending states correctly", () => {
      const pendingData1 = rd.ofPending();
      const pendingData2 = rd.ofPending();
      const combinedData = rd.combine({ a: pendingData1, b: pendingData2 });
      expect(combinedData).toEqual({
        status: "pending",
        isFetching: true,
      });
    });

    it("combines two error states correctly", () => {
      const errorData1 = rd.ofError(new Error("Test error 1"));
      const errorData2 = rd.ofError(new Error("Test error 2"));
      const combinedData = rd.combine({ a: errorData1, b: errorData2 });
      expect(combinedData).toEqual({
        status: "error",
        error: expect.any(RemoteCombinedError),
        isFetching: false,
      });
    });

    it("combines a success and a pending state correctly", () => {
      const successData = rd.of(10);
      const pendingData = rd.ofPending();
      const combinedData = rd.combine({ a: successData, b: pendingData });
      expect(combinedData).toEqual({
        status: "pending",
        isFetching: true,
      });
    });

    it("combines a success and an error state correctly", () => {
      const successData = rd.of(10);
      const errorData = rd.ofError(new Error("Test error"));
      const combinedData = rd.combine({ a: successData, b: errorData });
      expect(combinedData).toEqual({
        status: "error",
        error: expect.any(RemoteCombinedError),
        isFetching: false,
      });
    });

    it("combines a pending and an error state correctly", () => {
      const pendingData = rd.ofPending();
      const errorData = rd.ofError(new Error("Test error"));
      const combinedData = rd.combine({ a: pendingData, b: errorData });
      expect(combinedData).toEqual({
        status: "error",
        error: expect.any(RemoteCombinedError),
        isFetching: false,
      });
    });

    it("combines with idle", () => {
      const successData = rd.of(10);
      const idleData = rd.ofIdle();
      const combinedData = rd.combine({ a: successData, b: idleData });
      expect(combinedData).toEqual(
        rd.ofError(
          new Error("Combine does not support idle and success together"),
        ),
      );
    });
  });

  describe("journey Function", () => {
    const successData = rd.of("success");
    const errorData = rd.ofError(new Error("Test error"));
    const pendingData = rd.ofPending();

    it("handles the success state", () => {
      const result = rd
        .journey(successData)
        .wait(() => "Loading")
        .catch(() => "Error")
        .done((data) => `Success: ${data}`);
      expect(result).toBe("Success: success");
    });

    it("handles the error state", () => {
      const result = rd
        .journey(errorData)
        .wait(() => "Loading")
        .catch((e) => `Error: ${e.message}`)
        .done(() => "Success");
      expect(result).toBe("Error: Test error");
    });

    it("handles the pending state", () => {
      const result = rd
        .journey(pendingData)
        .wait(() => "Loading")
        .catch(() => "Error")
        .done(() => "Success");
      expect(result).toBe("Loading");
    });

    describe("journey get function", () => {
      it("handles the success state with get", () => {
        const successData = rd.of("success");
        const result = rd
          .journey(successData)
          .wait(() => "Loading")
          .catch(() => "Error")
          .get();
        expect(result).toBe("success");
      });

      it("handles the error state with get", () => {
        const errorData = rd.ofError(new Error("Test error"));
        const result = rd
          .journey(errorData)
          .wait(() => "Loading")
          .catch((e) => `Error: ${e.message}`)
          .get();
        expect(result).toBe("Error: Test error");
      });

      it("handles the pending state with get", () => {
        const pendingData = rd.ofPending();
        const result = rd
          .journey(pendingData)
          .wait(() => "Loading")
          .catch(() => "Error")
          .get();
        expect(result).toBe("Loading");
      });
    });

    describe("journey map function", () => {
      it("maps the success data correctly", () => {
        const successData = rd.of(5);
        const result = rd
          .journey(successData)
          .wait(() => "Loading")
          .catch(() => "Error")
          .map((data) => data * 2);
        expect(result).toBe(10);
      });

      it("handles the error state with map", () => {
        const errorData = rd.ofError(new Error("Test error"));
        const result = rd
          .journey(errorData)
          .wait(() => "Loading")
          .catch((e) => `Error: ${e.message}`)
          .map(() => 42);
        expect(result).toBe("Error: Test error");
      });
    });
  });

  describe("fullJourney Function", () => {
    it("handles the success state", () => {
      const successData = rd.of("success");
      const result = rd
        .fullJourney(successData)
        .initially(() => "Initial")
        .wait(() => "Loading")
        .catch(() => "Error")
        .done((data) => `Success: ${data}`);
      expect(result).toBe("Success: success");
    });

    it("handles the error state", () => {
      const errorData = rd.ofError(new Error("Test error"));
      const result = rd
        .fullJourney(errorData)
        .initially(() => "Initial")
        .wait(() => "Loading")
        .catch((e) => `Error: ${e.message}`)
        .done(() => "Success");
      expect(result).toBe("Error: Test error");
    });

    it("handles the pending state", () => {
      const pendingData = rd.ofPending();
      const result = rd
        .fullJourney(pendingData)
        .initially(() => "Initial")
        .wait(() => "Loading")
        .catch(() => "Error")
        .done(() => "Success");
      expect(result).toBe("Loading");
    });

    it("handles the idle state", () => {
      const idleData = rd.ofIdle();
      const result = rd
        .fullJourney(idleData)
        .initially(() => "Initial")
        .wait(() => "Loading")
        .catch(() => "Error")
        .done(() => "Success");
      expect(result).toBe("Initial");
    });

    describe("fullJourney get function", () => {
      it("handles the success state with get", () => {
        const successData = rd.of("success");
        const result = rd
          .fullJourney(successData)
          .initially(() => "Initial")
          .wait(() => "Loading")
          .catch(() => "Error")
          .get();
        expect(result).toBe("success");
      });

      it("handles the error state with get", () => {
        const errorData = rd.ofError(new Error("Test error"));
        const result = rd
          .fullJourney(errorData)
          .initially(() => "Initial")
          .wait(() => "Loading")
          .catch((e) => `Error: ${e.message}`)
          .get();
        expect(result).toBe("Error: Test error");
      });
    });

    describe("fullJourney map function", () => {
      it("maps the success data correctly", () => {
        const successData = rd.of(5);
        const result = rd
          .fullJourney(successData)
          .initially(() => "Initial")
          .wait(() => "Loading")
          .catch(() => "Error")
          .map((data) => data * 2);
        expect(result).toBe(10);
      });

      it("handles the error state with map", () => {
        const errorData = rd.ofError(new Error("Test error"));
        const result = rd
          .fullJourney(errorData)
          .initially(() => "Initial")
          .wait(() => "Loading")
          .catch((e) => `Error: ${e.message}`)
          .map(() => 42);
        expect(result).toBe("Error: Test error");
      });
    });
  });

  describe("of, ofPending, and ofError Functions", () => {
    it("creates a success state correctly", () => {
      const successData = rd.of("success");
      expect(successData).toEqual({
        status: "success",
        data: "success",
        isFetching: false,
        isPlaceholderData: false,
      });
    });

    it("creates a pending state correctly", () => {
      const pendingData = rd.ofPending();
      expect(pendingData).toEqual({
        status: "pending",
        isFetching: true,
      });
    });

    it("creates an error state correctly", () => {
      const errorData = rd.ofError(new Error("Test error"));
      expect(errorData).toEqual({
        status: "error",
        error: expect.any(Error),
        isFetching: false,
      });
    });
  });

  describe("useDataEffect", () => {
    it("should call the effect when the data changes", () => {
      const effect = vi.fn();
      const screen = renderHook((p) => rd.useDataEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.widen(rd.of(1)),
        },
      });
      expect(effect).toHaveBeenCalledTimes(1);
      screen.rerender({ remoteData: rd.of(2) });
      expect(effect).toHaveBeenCalledTimes(2);
      screen.rerender({ remoteData: rd.ofPending() });
      expect(effect).toHaveBeenCalledTimes(2);
      screen.rerender({ remoteData: rd.ofError(new Error("Test error")) });
      expect(effect).toHaveBeenCalledTimes(2);
      screen.rerender({ remoteData: rd.of(2) });
      expect(effect).toHaveBeenCalledTimes(3);
      screen.rerender({ remoteData: rd.of(2) });
      expect(effect).toHaveBeenCalledTimes(3);
      screen.rerender({ remoteData: rd.of(3) });
      expect(effect).toHaveBeenCalledTimes(4);
    });

    it("should handle transition from initial load to success correctly", () => {
      const effect = vi.fn();
      const screen = renderHook((p) => rd.useDataEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.widen(rd.ofIdle()),
        },
      });
      expect(effect).toHaveBeenCalledTimes(0);
      screen.rerender({ remoteData: rd.of(1) });
      expect(effect).toHaveBeenCalledTimes(1); // Check if it correctly handles the initial transition to success
    });

    it("should not call the effect when transitioning from success to different error states", () => {
      const effect = vi.fn();
      const screen = renderHook((p) => rd.useDataEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.widen(rd.of(1)),
        },
      });
      screen.rerender({ remoteData: rd.ofError(new Error("Test error 1")) });
      expect(effect).toHaveBeenCalledTimes(1);
      screen.rerender({ remoteData: rd.ofError(new Error("Test error 2")) });
      expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should not call the effect when transitioning between idle and pending states", () => {
      const effect = vi.fn();
      const screen = renderHook((p) => rd.useDataEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.widen(rd.ofIdle()),
        },
      });
      screen.rerender({ remoteData: rd.ofPending() });
      expect(effect).toHaveBeenCalledTimes(0);
      screen.rerender({ remoteData: rd.ofIdle() });
      expect(effect).toHaveBeenCalledTimes(0);
    });

    it("should perform cleanup when the component unmounts", () => {
      const cleanup = vi.fn();
      const effect = vi.fn(() => cleanup);
      const screen = renderHook((p) => rd.useDataEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.of(1),
        },
      });
      screen.unmount();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    describe("should not call the effect on initial mount unless it starts in a success state", () => {
      it("idle state", () => {
        const effect = vi.fn();
        const screen = renderHook(
          (p) => rd.useDataEffect(p.remoteData, effect),
          {
            initialProps: {
              remoteData: rd.widen<number>(rd.ofIdle()),
            },
          },
        );
        expect(effect).toHaveBeenCalledTimes(0);
        screen.rerender({ remoteData: rd.of(1) });
        expect(effect).toHaveBeenCalledTimes(1);
      });
      it("success state", () => {
        const effect = vi.fn();
        const screen = renderHook(
          (p) => rd.useDataEffect(p.remoteData, effect),
          {
            initialProps: {
              remoteData: rd.widen<number>(rd.of(1)),
            },
          },
        );
        expect(effect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("useEffect", () => {
    it("should call the effect when the state changes", () => {
      const effect = vi.fn();
      const screen = renderHook((p) => rd.useEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.widen(rd.of(1)),
        },
      });
      expect(effect).toHaveBeenCalledTimes(1);
      screen.rerender({ remoteData: rd.of(2) });
      expect(effect).toHaveBeenCalledTimes(2);
      screen.rerender({ remoteData: rd.ofPending() });
      expect(effect).toHaveBeenCalledTimes(3);
      screen.rerender({ remoteData: rd.ofError(new Error("Test error")) });
      expect(effect).toHaveBeenCalledTimes(4);
      screen.rerender({ remoteData: rd.of(2) });
      expect(effect).toHaveBeenCalledTimes(5);
      screen.rerender({ remoteData: rd.of(2) });
      expect(effect).toHaveBeenCalledTimes(5);
      screen.rerender({ remoteData: rd.of(3) });
      expect(effect).toHaveBeenCalledTimes(6);
    });

    it("should handle transition from initial load to success correctly", () => {
      const effect = vi.fn();
      const screen = renderHook((p) => rd.useEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.widen(rd.ofIdle()),
        },
      });
      expect(effect).toHaveBeenCalledTimes(1);
      screen.rerender({ remoteData: rd.of(1) });
      expect(effect).toHaveBeenCalledTimes(2); // Check if it correctly handles the initial transition to success
    });

    it("should call the effect when transitioning from success to different error states", () => {
      const effect = vi.fn();
      const screen = renderHook((p) => rd.useEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.widen(rd.of(1)),
        },
      });
      expect(effect).toHaveBeenCalledTimes(1);
      screen.rerender({ remoteData: rd.ofError(new Error("Test error 1")) });
      expect(effect).toHaveBeenCalledTimes(2);
      screen.rerender({ remoteData: rd.ofError(new Error("Test error 2")) });
      expect(effect).toHaveBeenCalledTimes(3);
    });

    it("should call the effect when transitioning between idle and pending states", () => {
      const effect = vi.fn();
      const screen = renderHook((p) => rd.useEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.widen(rd.ofIdle()),
        },
      });
      expect(effect).toHaveBeenCalledTimes(1);
      screen.rerender({ remoteData: rd.ofPending() });
      expect(effect).toHaveBeenCalledTimes(2);
      screen.rerender({ remoteData: rd.ofIdle() });
      expect(effect).toHaveBeenCalledTimes(3);
    });

    it("should perform cleanup when the component unmounts", () => {
      const cleanup = vi.fn();
      const effect = vi.fn(() => cleanup);
      const screen = renderHook((p) => rd.useEffect(p.remoteData, effect), {
        initialProps: {
          remoteData: rd.of(1),
        },
      });
      screen.unmount();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe("useDataMemo", () => {
    it("returns the same reference when dependencies do not change", () => {
      const initialValue = { data: 10 };
      const { result, rerender } = renderHook(
        (input) =>
          rd.useMemo(
            input,
            (data) => rd.map(data, (data) => ({ result: data.data * 2 })),
            [],
          ),
        { initialProps: rd.of(initialValue) },
      );

      const firstResult = result.current;
      expect(rd.getOrThrow(firstResult).result).toBe(20);

      // Rerender with the same data value
      rerender(rd.of(initialValue));
      expect(result.current).toBe(firstResult); // Checks if the reference is the same
    });

    it("recomputes and returns a new reference when dependencies change", () => {
      const initialData = { data: 10 };
      const newData = { data: 20 }; // New object to trigger recomputation
      const { result, rerender } = renderHook(
        (input) =>
          rd.useMemo(
            input,
            (data) => rd.map(data, (data) => ({ result: data.data * 2 })),
            [],
          ),
        { initialProps: rd.of(initialData) },
      );

      const firstResult = result.current;
      expect(rd.getOrThrow(firstResult).result).toBe(20);

      // Rerender with new data
      rerender(rd.of(newData));
      expect(result.current).not.toBe(firstResult);
      expect(rd.getOrThrow(result.current).result).toBe(40);
    });

    it("maintains the same reference when rerendered with equivalent but not identical data", () => {
      const data = rd.of(100);
      const { result, rerender } = renderHook(
        (input) =>
          rd.useMemo(
            input,
            (data) =>
              rd.map(data, (input) => ({
                complex: { value: input },
              })),
            [],
          ),
        { initialProps: data },
      );

      const firstResult = result.current;
      expect(rd.getOrThrow(firstResult).complex.value).toBe(100);

      // Create a new object with the same content
      const newData = rd.of(100);
      rerender(newData);

      // Reference should not change because the dependency [data.data] didn't change meaningfully
      expect(result.current).toBe(firstResult);
    });
  });

  describe("useLastWithPlaceholder", () => {
    it("complex scenarios", () => {
      const data = rd.widen<number>(rd.ofPending());
      const { result, rerender } = renderHook(
        (data) => rd.useLastWithPlaceholder(data),
        {
          initialProps: data,
        },
      );
      expect(result.current).toEqual(rd.ofPending());

      rerender(rd.of(1));

      expect(result.current).toEqual(rd.of(1));
      expect(rd.isPlaceholderData(result.current)).toBe(false);

      rerender(rd.ofPending());

      expect(result.current.status).toBe("success");
      expect(rd.isPlaceholderData(result.current)).toBe(true);

      rerender(rd.ofError(new Error("Test error")));
      expect(result.current.status).toBe("error");

      rerender(rd.ofIdle());
      expect(result.current.status).toBe("idle");

      rerender(rd.ofPending());
      expect(result.current.status).toBe("pending");

      rerender(rd.of(2));
      expect(result.current).toEqual(rd.of(2));
    });
  });
});
