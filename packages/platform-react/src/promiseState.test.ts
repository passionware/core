/** @jest-environment jsdom */
import { mt, rd } from "@passionware/monads";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { promiseState } from "./promiseState";

describe("promiseState", () => {
  describe("useRemoteData", () => {
    it("should initialize with idle state", () => {
      const { result } = renderHook(() => promiseState.useRemoteData());
      expect(result.current.state).toEqual(mt.ofIdle());
    });

    it("should set state to pending when track is called", async () => {
      const { result } = renderHook(() => promiseState.useRemoteData());

      act(() => {
        result.current.track(Promise.resolve("response"));
      });

      expect(result.current.state).toEqual(rd.ofPending());
    });

    it("should set state to success when the promise resolves", async () => {
      const { result } = renderHook(() => promiseState.useRemoteData());

      await act(async () => {
        await result.current.track(Promise.resolve("response"));
      });

      expect(result.current.state).toEqual(rd.of("response"));
    });

    it("should set state to error when the promise rejects", async () => {
      const { result } = renderHook(() => promiseState.useRemoteData());

      await act(async () => {
        await result.current
          .track(Promise.reject(new Error("test error")))
          .catch(() => {
            // Swallow the error to allow state to be updated
          });
      });

      expect(result.current.state).toEqual(rd.ofError(new Error("test error")));
    });

    it("should set state to error when the promise rejects, without awaiting track result", async () => {
      const { result } = renderHook(() => promiseState.useRemoteData());

      await act(
        async () =>
          await result.current
            .track(Promise.reject(new Error("test error")))
            .catch(() => {}),
      );
      expect(result.current.state).toEqual(rd.ofError(new Error("test error")));
    });

    it("should reset state to idle", () => {
      const { result } = renderHook(() => promiseState.useRemoteData());

      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toEqual(mt.ofIdle());
    });

    it("useRemoteData should not update state from previous promise after reset", async () => {
      const { result, rerender } = renderHook(() =>
        promiseState.useRemoteData(),
      );

      const firstPromise = new Promise((resolve) =>
        setTimeout(() => resolve("first response"), 100),
      );

      act(() => {
        result.current.track(firstPromise);
      });

      // Reset before the first promise resolves
      act(() => {
        result.current.reset();
      });

      // Verify the state is reset to idle immediately after reset
      expect(result.current.state).toEqual(mt.ofIdle());

      // Allow the first promise to resolve
      await firstPromise;
      rerender();

      // Verify the state remains idle, unaffected by the resolved promise
      expect(result.current.state).toEqual(mt.ofIdle());
    });
  });

  describe("useMutationState", () => {
    it("should initialize with idle state", () => {
      const { result } = renderHook(() =>
        promiseState.useMutation((req) => Promise.resolve(req)),
      );
      expect(result.current.state).toEqual(mt.ofIdle());
    });

    it("should set state to pending with request when track is called", async () => {
      const { result } = renderHook(() =>
        promiseState.useMutation((req) => Promise.resolve(req)),
      );

      act(() => {
        result.current.track("request");
      });

      expect(result.current.state).toEqual(mt.ofPending("request"));
    });

    it("should set state to success with request and response when the mutation resolves", async () => {
      const { result } = renderHook(() =>
        promiseState.useMutation(() => Promise.resolve("response")),
      );

      await act(async () => {
        await result.current.track("request");
      });

      expect(result.current.state).toEqual(mt.ofSuccess("request", "response"));
    });

    it("should set state to error with request when the mutation rejects", async () => {
      const { result } = renderHook(() =>
        promiseState.useMutation(() =>
          Promise.reject(new Error("mutation error")),
        ),
      );

      await act(async () => {
        await result.current.track("request").catch(() => {
          // Swallow the error because we are testing state change, not the throw
        });
      });

      expect(result.current.state).toEqual(
        mt.ofError("request", new Error("mutation error")),
      );
    });

    it("should reset state to idle", () => {
      const { result } = renderHook(() =>
        promiseState.useMutation((req) => Promise.resolve(req)),
      );

      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toEqual(mt.ofIdle());
    });
  });

  describe("syncRemoteData", () => {
    it("should initialize with idle state", () => {
      const onStoreUpdate = vi.fn();
      const syncData = promiseState.syncRemoteData(onStoreUpdate);

      act(() => {
        syncData.reset();
      });

      expect(onStoreUpdate).toHaveBeenCalledWith(mt.ofIdle());
    });

    it("should set state to pending when track is called", async () => {
      const onStoreUpdate = vi.fn();
      const syncData = promiseState.syncRemoteData(onStoreUpdate);

      await act(async () => {
        syncData.track(Promise.resolve("response"));
      });

      expect(onStoreUpdate).toHaveBeenCalledWith(rd.ofPending());
    });

    it("should set state to success when the promise resolves", async () => {
      const onStoreUpdate = vi.fn();
      const syncData = promiseState.syncRemoteData(onStoreUpdate);

      await act(async () => {
        await syncData.track(Promise.resolve("response"));
      });

      expect(onStoreUpdate).toHaveBeenLastCalledWith(rd.of("response"));
    });

    it("should set state to error when the promise rejects", async () => {
      const onStoreUpdate = vi.fn();
      const syncData = promiseState.syncRemoteData(onStoreUpdate);

      await act(async () => {
        await syncData
          .track(Promise.reject(new Error("test error")))
          .catch(() => {
            // Swallow the error to allow state to be updated
          });
      });

      expect(onStoreUpdate).toHaveBeenLastCalledWith(
        rd.ofError(new Error("test error")),
      );
    });

    it("useMutation should not update state from previous mutation after reset", async () => {
      const { result, rerender } = renderHook(() =>
        promiseState.useMutation(
          (req) =>
            new Promise((resolve) =>
              setTimeout(() => resolve(`${req} response`), 100),
            ),
        ),
      );

      const firstMutation = "first request";

      act(() => {
        result.current.track(firstMutation);
      });

      // Reset before the mutation resolves
      act(() => {
        result.current.reset();
      });
      rerender();

      // Verify the state is reset to idle immediately after reset
      expect(result.current.state).toEqual(mt.ofIdle());

      // Allow the first mutation to resolve
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate mutation delay
      rerender();

      // Verify the state remains idle, unaffected by the resolved mutation
      expect(result.current.state).toEqual(mt.ofIdle());
    });
  });

  describe("syncMutation", () => {
    it("should initialize with idle state", () => {
      const onStoreUpdate = vi.fn();
      const syncMutate = promiseState.syncMutation(onStoreUpdate, (req) =>
        Promise.resolve(req),
      );

      act(() => {
        syncMutate.reset();
      });

      expect(onStoreUpdate).toHaveBeenCalledWith(mt.ofIdle());
    });

    it("should set state to pending with request when track is called", async () => {
      const onStoreUpdate = vi.fn();
      const syncMutate = promiseState.syncMutation(onStoreUpdate, (req) =>
        Promise.resolve(req),
      );

      await act(async () => {
        syncMutate.track("request");
      });

      expect(onStoreUpdate).toHaveBeenCalledWith(mt.ofPending("request"));
    });

    it("should set state to success with request and response when mutation resolves", async () => {
      const onStoreUpdate = vi.fn();
      const syncMutate = promiseState.syncMutation(onStoreUpdate, () =>
        Promise.resolve("response"),
      );

      await act(async () => {
        await syncMutate.track("request");
      });

      expect(onStoreUpdate).toHaveBeenLastCalledWith(
        mt.ofSuccess("request", "response"),
      );
    });

    it("should set state to error with request when mutation rejects", async () => {
      const onStoreUpdate = vi.fn();
      const syncMutate = promiseState.syncMutation(onStoreUpdate, () =>
        Promise.reject(new Error("mutation error")),
      );

      await act(async () => {
        await syncMutate.track("request").catch(() => {
          // Swallow the error because we are testing state change, not the throw
        });
      });

      expect(onStoreUpdate).toHaveBeenLastCalledWith(
        mt.ofError("request", new Error("mutation error")),
      );
    });
  });
});
