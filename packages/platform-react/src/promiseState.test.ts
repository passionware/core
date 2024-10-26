/** @jest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { mt, rd } from "@passionware/monads";
import {} from "@passionware/platform-js";
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
        promiseState.useMutation((req) => Promise.resolve("response")),
      );

      await act(async () => {
        await result.current.track("request");
      });

      expect(result.current.state).toEqual(mt.ofSuccess("request", "response"));
    });

    it("should set state to error with request when the mutation rejects", async () => {
      const { result } = renderHook(() =>
        promiseState.useMutation((req) =>
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
});