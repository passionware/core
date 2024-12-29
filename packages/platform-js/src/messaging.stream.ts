import { createRequestFirstResponseMessaging, MessageSpec } from "./messaging";

/**
 * Represents a single "request" and its corresponding response stream.
 */
export type MessageEventStreamPayload<Request, Response> = {
  /** Metadata for the request (e.g., parameters). */
  metadata: Request;
  /** Emit a piece of partial data to the caller. */
  pushResponse: (partial: Response) => void;
  /** End the stream successfully. */
  endStream: () => void;
  /** End the stream with an error. */
  failStream: (error: Error) => void;
};

/** A cleanup function can be void or a function that returns void. */
type MaybeCleanupFn = void | (() => void);

/**
 * Optional callbacks the caller can provide:
 * - `onData`  : Called for each partial response
 * - `onError` : Called if `failStream(...)` is invoked
 *
 * The "end of stream" success is signaled by the Promise resolve,
 * rather than a callback like `onEnd`.
 */
export type RequestStreamOptions<Response> = {
  onData?: (partial: Response) => void;
  onError?: (err: Error) => void;
};

/**
 * Creates a messaging system where exactly one listener can handle
 * a given request. The listener can:
 *  - push multiple pieces of data (`pushResponse`),
 *  - eventually call `endStream()` or `failStream(...)`.
 *
 * The caller provides optional callbacks for partial data and errors,
 * and uses the returned Promise to detect the successful end.
 */
export function createRequestStreamMessaging<Request, Response>() {
  type ListenerFn = (
    payload: MessageEventStreamPayload<Request, Response>,
  ) => MaybeCleanupFn;

  /** We store the listener(s) in a Set, expecting at most one. */
  const listeners = new Set<ListenerFn>();

  return {
    /**
     * Subscribe a single listener to handle requests of this type.
     * Returns a function to unsubscribe that listener.
     */
    subscribeToRequest(listener: ListenerFn) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    /**
     * Send a request, optionally providing handlers for partial data and errors.
     * Returns a Promise that resolves on `endStream()` or rejects on `failStream(...)`.
     */
    sendRequest(
      request: Request,
      options: RequestStreamOptions<Response> = {},
    ): Promise<void> {
      const { onData, onError } = options;

      return new Promise<void>((resolve, reject) => {
        // Check how many listeners we have
        const numListeners = listeners.size;
        if (numListeners === 0) {
          const err = new Error(
            "No listener found in request-stream mode (expected exactly one).",
          );
          onError?.(err);
          return reject(err);
        } else if (numListeners > 1) {
          const err = new Error(
            "Multiple listeners found in request-stream mode (expected exactly one).",
          );
          onError?.(err);
          return reject(err);
        }

        // We have exactly one listener
        const cleanups = new Map<ListenerFn, MaybeCleanupFn>();

        for (const listener of listeners) {
          const cleanup = listener({
            metadata: request,

            pushResponse: (partialData) => {
              onData?.(partialData);
            },

            endStream: async () => {
              // Successfully end the stream
              await Promise.resolve(); // next tick
              resolve();
              // Cleanup
              for (const [_, cfn] of cleanups) {
                if (typeof cfn === "function") {
                  cfn();
                }
              }
              cleanups.clear();
            },

            failStream: async (error) => {
              // End the stream with an error
              onError?.(error);
              await Promise.resolve(); // next tick
              reject(error);
              // Cleanup
              for (const [_, cfn] of cleanups) {
                if (typeof cfn === "function") {
                  cfn();
                }
              }
              cleanups.clear();
            },
          });

          cleanups.set(listener, cleanup);
        }
      });
    },
  };
}

export type StreamResponseMessaging<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? ReturnType<typeof createRequestStreamMessaging<Request, Response>>
    : never;
