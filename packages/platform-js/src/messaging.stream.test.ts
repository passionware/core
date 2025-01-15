import { describe, expect, it, vi } from "vitest";
import { createRequestStreamMessaging } from "./messaging.stream";

// we sometimes use this in the test to ensure that function overloading also works

type TestMessage = {
  request: number;
  response: { partial: string; final: void };
};

describe("createRequestStreamMessaging (partial=string, final=void)", () => {
  it("should reject if there are no listeners", async () => {
    const messaging = createRequestStreamMessaging<TestMessage>();

    await expect(
      messaging.sendRequest(42, {
        onData: vi.fn(), // onData receives string
        onError: vi.fn(),
      }),
    ).rejects.toThrow(
      "No listener found in request-stream mode (expected exactly one).",
    );
  });

  it("should reject if there are multiple listeners", async () => {
    const messaging = createRequestStreamMessaging<
      number,
      { partial: string; final: void }
    >();

    // Subscribe two dummy listeners
    const unsub1 = messaging.subscribeToRequest(vi.fn());
    const unsub2 = messaging.subscribeToRequest(vi.fn());

    await expect(
      messaging.sendRequest(42, {
        onData: vi.fn(),
        onError: vi.fn(),
      }),
    ).rejects.toThrow(
      "Multiple listeners found in request-stream mode (expected exactly one).",
    );

    // Cleanup
    unsub1();
    unsub2();
  });

  it("should receive partial data (string) via onData, then resolve (void) when endStream is called", async () => {
    const messaging = createRequestStreamMessaging<
      number,
      { partial: string; final: void }
    >();
    let pushCounter = 0;

    // Subscribe exactly one listener that pushes partial data 3 times
    // and then calls endStream() with no final argument (since final=void).
    const unsubscribe = messaging.subscribeToRequest(
      ({ request, pushResponse, endStream }) => {
        const interval = setInterval(() => {
          pushCounter++;
          pushResponse(`Partial #${pushCounter} for ${request}`);
          if (pushCounter === 3) {
            clearInterval(interval);
            endStream(); // <--- final=void
          }
        }, 10);

        // Cleanup if needed
        return () => clearInterval(interval);
      },
    );

    const onDataFn = vi.fn();
    const promiseResult = await messaging.sendRequest(42, {
      onData: onDataFn,
    });
    // Because final=void, we expect promiseResult to be `undefined`
    expect(promiseResult).toBeUndefined();

    // We expect 3 partial responses
    expect(onDataFn).toHaveBeenCalledTimes(3);
    expect(onDataFn).toHaveBeenNthCalledWith(1, "Partial #1 for 42");
    expect(onDataFn).toHaveBeenNthCalledWith(2, "Partial #2 for 42");
    expect(onDataFn).toHaveBeenNthCalledWith(3, "Partial #3 for 42");

    unsubscribe();
  });

  it("should call onError and reject the promise if failStream is called", async () => {
    const messaging = createRequestStreamMessaging<
      number,
      { partial: string; final: void }
    >();

    const unsubscribe = messaging.subscribeToRequest(({ failStream }) => {
      setTimeout(() => {
        failStream(new Error("failStream test error"));
      }, 10);
    });

    const onErrorFn = vi.fn();
    await expect(
      messaging.sendRequest(123, {
        onError: onErrorFn,
      }),
    ).rejects.toThrow("failStream test error");

    // onError callback should be called once
    expect(onErrorFn).toHaveBeenCalledTimes(1);
    expect(onErrorFn.mock.calls[0][0].message).toBe("failStream test error");

    unsubscribe();
  });

  it("should call cleanup after endStream is called", async () => {
    const messaging = createRequestStreamMessaging<
      number,
      { partial: string; final: void }
    >();
    const cleanupFn = vi.fn();

    const unsubscribe = messaging.subscribeToRequest(
      ({ pushResponse, endStream }) => {
        pushResponse("Hello");
        endStream(); // final=void
        return cleanupFn;
      },
    );

    // The resolved promise should be `undefined` because final=void
    const result = await messaging.sendRequest(42);
    expect(result).toBeUndefined();

    // Cleanup function is called
    expect(cleanupFn).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("should call cleanup after failStream is called", async () => {
    const messaging = createRequestStreamMessaging<
      number,
      { partial: string; final: void }
    >();
    const cleanupFn = vi.fn();

    const unsubscribe = messaging.subscribeToRequest(({ failStream }) => {
      failStream(new Error("test-error"));
      return cleanupFn;
    });

    await expect(messaging.sendRequest(42)).rejects.toThrow("test-error");

    expect(cleanupFn).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("should allow to send final data with endStream", async () => {
    const messaging = createRequestStreamMessaging<
      number,
      { partial: string; final: number }
    >();
    const cleanupFn = vi.fn();
    const unsubscribe = messaging.subscribeToRequest(
      ({ pushResponse, endStream }) => {
        pushResponse("Hello");
        endStream(123);
        return cleanupFn;
      },
    );

    const result = await messaging.sendRequest(42);
    expect(result).toBe(123);

    expect(cleanupFn).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
