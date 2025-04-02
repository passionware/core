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

    it("syncRemoteData should not update state from previous promise after reset", async () => {
      const onStoreUpdate = vi.fn();
      const syncData = promiseState.syncRemoteData(onStoreUpdate);

      const firstPromise = new Promise((resolve) =>
        setTimeout(() => resolve("first response"), 100),
      );

      // Start tracking the first promise
      void syncData.track(firstPromise);

      // Reset before the promise resolves
      syncData.reset();

      // Ensure reset sets the state to idle
      expect(onStoreUpdate).toHaveBeenLastCalledWith(mt.ofIdle());

      // Allow the first promise to resolve
      await firstPromise;

      // Ensure the state remains idle and is not updated by the first promise
      expect(onStoreUpdate).toHaveBeenCalledTimes(2); // Only pending and idle
      expect(onStoreUpdate).not.toHaveBeenCalledWith(rd.of("first response"));
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

    it("syncMutation should not update state from previous mutation after reset", async () => {
      const onStoreUpdate = vi.fn();
      const syncMutate = promiseState.syncMutation(
        onStoreUpdate,
        (req: string) =>
          new Promise((resolve) =>
            setTimeout(() => resolve(`${req} response`), 100),
          ),
      );

      const firstRequest = "first request";

      // Start tracking the first mutation
      syncMutate.track(firstRequest);

      // Reset before the mutation resolves
      syncMutate.reset();

      // Ensure reset sets the state to idle
      expect(onStoreUpdate).toHaveBeenLastCalledWith(mt.ofIdle());

      // Allow the first mutation to resolve
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay

      // Ensure the state remains idle and is not updated by the first mutation
      expect(onStoreUpdate).toHaveBeenCalledTimes(2); // Only pending and idle
      expect(onStoreUpdate).not.toHaveBeenCalledWith(
        mt.ofSuccess(firstRequest, "first request response"),
      );
    });
  });

  describe("useMutationArray", () => {
    type Request = { id: string; value: string };
    type Response = string;

    it("should initialize with empty state", () => {
      const { result } = renderHook(() =>
        promiseState.useMutationArray<string, Request, Response>(
          (r) => Promise.resolve(r.value),
          (r) => r.id,
        ),
      );
      expect(result.current.state.size).toBe(0);
    });

    it("should track multiple mutations by key", async () => {
      const { result } = renderHook(() =>
        promiseState.useMutationArray<string, Request, Response>(
          (req) => Promise.resolve(req.value + "-response"),
          (req) => req.id,
        ),
      );

      const req1 = { id: "a", value: "foo" };
      const req2 = { id: "b", value: "bar" };

      await act(async () => {
        await result.current.track(req1);
        await result.current.track(req2);
      });

      expect(result.current.get("a")).toEqual(
        mt.ofSuccess(req1, "foo-response"),
      );
      expect(result.current.get("b")).toEqual(
        mt.ofSuccess(req2, "bar-response"),
      );
    });

    it("should return idle state from get() for unknown key", () => {
      const { result } = renderHook(() =>
        promiseState.useMutationArray<string, Request, Response>(
          (r) => Promise.resolve(r.value),
          (r) => r.id,
        ),
      );

      expect(result.current.get("missing")).toEqual(mt.ofIdle());
    });

    it("should reset specific mutation state to idle", async () => {
      const { result } = renderHook(() =>
        promiseState.useMutationArray<string, Request, Response>(
          (r) => Promise.resolve(r.value),
          (r) => r.id,
        ),
      );

      const req = { id: "reset-me", value: "x" };

      await act(async () => {
        await result.current.track(req);
      });

      act(() => {
        result.current.reset("reset-me");
      });

      expect(result.current.get("reset-me")).toEqual(mt.ofIdle());
    });

    it("should not update mutation from old request after reset", async () => {
      const { result } = renderHook(() =>
        promiseState.useMutationArray<string, Request, Response>(
          (r) => new Promise((res) => setTimeout(() => res(r.value), 100)),
          (r) => r.id,
        ),
      );

      const req = { id: "foo", value: "late" };

      act(() => {
        void result.current.track(req);
        result.current.reset("foo");
      });

      await new Promise((r) => setTimeout(r, 110));
      expect(result.current.get("foo")).toEqual(mt.ofIdle());
    });
  });
});
