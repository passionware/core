import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { buffer } from "./buffer";

beforeAll(() => {
  vi.useFakeTimers();
});
afterAll(() => {
  vi.useRealTimers();
});

describe("createBufferedFunction", () => {
  it("should buffer and flush calls correctly", async () => {
    const mockCallback = vi.fn();
    const bufferedLog = buffer(mockCallback, 100);

    bufferedLog(1);
    bufferedLog(2);
    bufferedLog(3);

    // At this point, the callback should not have been called yet
    expect(mockCallback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(90);

    expect(mockCallback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(11);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith([1, 2, 3]);
  });

  it("should handle multiple flushes correctly", async () => {
    const mockCallback = vi.fn();
    const bufferedLog = buffer(mockCallback, 100);

    bufferedLog(1);
    bufferedLog(2);

    vi.advanceTimersByTime(100);

    bufferedLog(3);
    bufferedLog(4);

    vi.advanceTimersByTime(100);

    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenNthCalledWith(1, [1, 2]);
    expect(mockCallback).toHaveBeenNthCalledWith(2, [3, 4]);
  });

  it("should reset the buffer after flush", async () => {
    const mockCallback = vi.fn();
    const bufferedLog = buffer(mockCallback, 100);

    bufferedLog(1);
    bufferedLog(2);

    vi.advanceTimersByTime(100);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith([1, 2]);

    bufferedLog(3);
    bufferedLog(4);

    vi.advanceTimersByTime(100);

    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenNthCalledWith(2, [3, 4]);
  });
});
