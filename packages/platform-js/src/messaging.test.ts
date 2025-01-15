import { describe, expect, it, vi } from "vitest";
import { delay } from "./delay";
import {
  createRequestCollectMessaging,
  createRequestFirstResponseMessaging,
  createRequestResponseMessaging,
} from "./messaging";

describe("Messaging Systems", () => {
  describe("createRequestResponseMessaging", () => {
    it("should reject if there are no listeners", async () => {
      const messaging = createRequestResponseMessaging<number, string>();

      await expect(messaging.sendRequest(42)).rejects.toThrow(
        "No listener found for the request in request-response mode",
      );
    });

    it("should reject if there are multiple listeners", async () => {
      const messaging = createRequestResponseMessaging<number, string>();
      messaging.subscribeToRequest(vi.fn());
      messaging.subscribeToRequest(vi.fn());

      await expect(messaging.sendRequest(42)).rejects.toThrow(
        "Multiple listeners found for the request in request-response mode",
      );
    });

    it("should resolve with the correct response if a single listener is present", async () => {
      const messaging = createRequestResponseMessaging<number, string>();
      messaging.subscribeToRequest(({ request, sendResponse }) => {
        sendResponse(`Response for ${request}`);
      });

      const result = await messaging.sendRequest(42);
      expect(result).toBe("Response for 42");
    });

    it("should call cleanup functions after a response is received", async () => {
      const messaging = createRequestResponseMessaging<number, string>();

      const cleanup = vi.fn();
      messaging.subscribeToRequest(({ request, sendResponse }) => {
        sendResponse(`Response for ${request}`);
        return cleanup;
      });

      const result = await messaging.sendRequest(42);
      expect(result).toBe("Response for 42");
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe("createRequestCollectMessaging", () => {
    it("should reject if there are no listeners", async () => {
      const messaging = createRequestCollectMessaging<number, string>();

      await expect(messaging.sendRequest(42)).rejects.toThrow(
        "No listener found for the request in request-collect mode, expected at least one",
      );
    });

    it("should collect responses from multiple listeners", async () => {
      const messaging = createRequestCollectMessaging<number, string>();

      messaging.subscribeToRequest(({ request, sendResponse }) => {
        sendResponse(`First response for ${request}`);
      });
      messaging.subscribeToRequest(({ request, sendResponse }) => {
        sendResponse(`Second response for ${request}`);
      });

      const result = await messaging.sendRequest(42);
      expect(result).toEqual([
        "First response for 42",
        "Second response for 42",
      ]);
    });

    it("should resolve with responses in order received", async () => {
      const messaging = createRequestCollectMessaging<number, string>();

      messaging.subscribeToRequest(({ request, sendResponse }) => {
        setTimeout(
          () => sendResponse(`Delayed response for ${request}`),
          10,
        );
      });
      messaging.subscribeToRequest(({ request, sendResponse }) => {
        sendResponse(`Immediate response for ${request}`);
      });

      const result = await messaging.sendRequest(42);
      expect(result).toEqual([
        "Immediate response for 42",
        "Delayed response for 42",
      ]);
    });

    it("should call cleanup functions after all responses are collected", async () => {
      const messaging = createRequestCollectMessaging<number, string>();

      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      messaging.subscribeToRequest(({ request, sendResponse }) => {
        sendResponse(`First response for ${request}`);
        return cleanup1;
      });
      messaging.subscribeToRequest(({ request, sendResponse }) => {
        sendResponse(`Second response for ${request}`);
        return cleanup2;
      });

      const result = await messaging.sendRequest(42);
      expect(result).toEqual([
        "First response for 42",
        "Second response for 42",
      ]);
      expect(cleanup1).toHaveBeenCalledTimes(1);
      expect(cleanup2).toHaveBeenCalledTimes(1);
    });
  });

  describe("createRequestFirstResponseMessaging", () => {
    it("should reject if there are no listeners", async () => {
      const messaging = createRequestFirstResponseMessaging<number, string>();

      await expect(messaging.sendRequest(42)).rejects.toThrow(
        "No listener found for the request in request-first-response mode, expected at least one",
      );
    });

    it("should resolve with the first response from multiple listeners", async () => {
      const messaging = createRequestFirstResponseMessaging<number, string>();

      messaging.subscribeToRequest(({ request, sendResponse }) => {
        setTimeout(() => sendResponse(`First response for ${request}`), 10);
      });
      messaging.subscribeToRequest(({ request, sendResponse }) => {
        sendResponse(`Immediate response for ${request}`);
      });

      const result = await messaging.sendRequest(42);
      expect(result).toBe("Immediate response for 42");
    });

    it("should ignore other responses after the first one", async () => {
      const messaging = createRequestFirstResponseMessaging<number, string>();

      const listener1 = vi.fn(({ request, sendResponse }) => {
        setTimeout(() => sendResponse(`First response for ${request}`), 10);
      });
      const listener2 = vi.fn(({ request, sendResponse }) => {
        sendResponse(`Immediate response for ${request}`);
      });

      messaging.subscribeToRequest(listener1);
      messaging.subscribeToRequest(listener2);

      const result = await messaging.sendRequest(42);
      expect(result).toBe("Immediate response for 42");

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should call cleanup functions once a response is received", async () => {
      const messaging = createRequestFirstResponseMessaging<number, string>();

      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      messaging.subscribeToRequest(({ request, sendResponse }) => {
        delay(10).then(() => sendResponse(`Response for ${request}`));
        return cleanup1;
      });
      messaging.subscribeToRequest(({ request, sendResponse }) => {
        delay(5).then(() => sendResponse(`Response for ${request}`));
        return cleanup2;
      });

      const result = await messaging.sendRequest(42);
      expect(result).toBe("Response for 42");

      // Ensure each cleanup function was called once
      expect(cleanup1).toHaveBeenCalledTimes(1);
      expect(cleanup2).toHaveBeenCalledTimes(1);
    });

    it("should clear cleanup functions after first response", async () => {
      const messaging = createRequestFirstResponseMessaging<number, string>();

      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      messaging.subscribeToRequest(({ request, sendResponse }) => {
        delay(10).then(() => sendResponse(`Response for ${request}`));
        return cleanup1;
      });
      messaging.subscribeToRequest(({ request, sendResponse }) => {
        delay(10).then(() => sendResponse(`Response for ${request}`));
        return cleanup2;
      });

      const result = await messaging.sendRequest(42);
      expect(result).toBe("Response for 42");

      // Ensure cleanup functions are called once
      expect(cleanup1).toHaveBeenCalledTimes(1);
      expect(cleanup2).toHaveBeenCalledTimes(1);

      await messaging.sendRequest(43).catch(() => {}); // Catch expected error for no listeners
      expect(cleanup1).toHaveBeenCalledTimes(2);
      expect(cleanup2).toHaveBeenCalledTimes(2);
    });
  });
});
