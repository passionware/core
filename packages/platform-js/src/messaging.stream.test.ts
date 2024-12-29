import { describe, expect, it, vi } from "vitest";
import { createRequestStreamMessaging } from "./messaging.stream";

describe("createRequestStreamMessaging (No onEnd callback)", () => {
  it("should reject if there are no listeners", async () => {
    const messaging = createRequestStreamMessaging<number, string>();

    // No listener subscribed
    await expect(
      messaging.sendRequest(42, {
        onData: vi.fn(),
        onError: vi.fn(),
      }),
    ).rejects.toThrow(
      "No listener found in request-stream mode (expected exactly one).",
    );
  });

  it("should reject if there are multiple listeners", async () => {
    const messaging = createRequestStreamMessaging<number, string>();
    messaging.subscribeToRequest(vi.fn());
    messaging.subscribeToRequest(vi.fn());

    await expect(
      messaging.sendRequest(42, {
        onData: vi.fn(),
        onError: vi.fn(),
      }),
    ).rejects.toThrow(
      "Multiple listeners found in request-stream mode (expected exactly one).",
    );
  });

  it("should receive partial data via onData before endStream, then resolve", async () => {
    const messaging = createRequestStreamMessaging<number, string>();
    let pushCounter = 0;

    messaging.subscribeToRequest(({ metadata, pushResponse, endStream }) => {
      const interval = setInterval(() => {
        pushCounter++;
        pushResponse(`Partial #${pushCounter} for ${metadata}`);
        if (pushCounter === 3) {
          clearInterval(interval);
          endStream(); // <-- Promise should resolve here
        }
      }, 10);

      return () => clearInterval(interval);
    });

    const onDataFn = vi.fn();

    await messaging.sendRequest(42, {
      onData: onDataFn,
    });

    // We expect 3 partial responses
    expect(onDataFn).toHaveBeenCalledTimes(3);
    expect(onDataFn).toHaveBeenNthCalledWith(1, "Partial #1 for 42");
    expect(onDataFn).toHaveBeenNthCalledWith(2, "Partial #2 for 42");
    expect(onDataFn).toHaveBeenNthCalledWith(3, "Partial #3 for 42");
  });

  it("should call onError and reject the promise if failStream is called", async () => {
    const messaging = createRequestStreamMessaging<number, string>();

    messaging.subscribeToRequest(({ failStream }) => {
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
  });

  it("should call cleanup after endStream is called", async () => {
    const messaging = createRequestStreamMessaging<number, string>();
    const cleanupFn = vi.fn();

    messaging.subscribeToRequest(({ pushResponse, endStream }) => {
      pushResponse("Hello");
      endStream();
      return cleanupFn;
    });

    await messaging.sendRequest(42);
    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });

  it("should call cleanup after failStream is called", async () => {
    const messaging = createRequestStreamMessaging<number, string>();
    const cleanupFn = vi.fn();

    messaging.subscribeToRequest(({ failStream }) => {
      failStream(new Error("test-error"));
      return cleanupFn;
    });

    await expect(messaging.sendRequest(42)).rejects.toThrow("test-error");
    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });
});
