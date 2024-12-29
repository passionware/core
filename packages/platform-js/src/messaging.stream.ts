import { MessageSpec } from "./messaging";

/**
 * Represents a single "request" and its corresponding response stream.
 * Here, `Response["partial"]` is the type for partial data,
 * and `Response["final"]` is the type for the final result.
 */
export type MessageEventStreamPayload<
  Request,
  Response extends { partial: unknown; final: unknown },
> = {
  /** Metadata for the request (e.g., parameters). */
  metadata: Request;
  /**
   * Emit a partial piece of data to the caller.
   * This must match Response["partial"].
   */
  pushResponse: (partial: Response["partial"]) => void;
  /**
   * End the stream successfully, passing the final result.
   * This must match Response["final"].
   */
  endStream: (finalData: Response["final"]) => void;
  /** End the stream with an error. */
  failStream: (error: Error) => void;
};

/** A cleanup function can be void or a function that returns void. */
type MaybeCleanupFn = void | (() => void);

/**
 * Optional callbacks the caller can provide:
 * - `onData`: Called for each piece of Response["partial"]
 * - `onError`: Called if `failStream(...)` is invoked
 *
 * The successful end of stream returns a Promise<Response["final"]>,
 * rather than needing a separate `onEnd`.
 */
export type RequestStreamOptions<
  Response extends { partial: unknown; final: unknown },
> = {
  onData?: (partial: Response["partial"]) => void;
  onError?: (err: Error) => void;
};

/**
 * Create a messaging system where exactly one listener can handle
 * a given request. The listener can:
 *  - push multiple pieces of partial data (`pushResponse(...)`),
 *  - eventually call `endStream(finalData)`,
 *  - or fail with `failStream(error)`.
 *
 * The caller provides optional callbacks for partial data and errors,
 * and gets a Promise<Response["final"]> that resolves on endStream(...)
 * or rejects on failStream(...).
 */
export function createRequestStreamMessaging<
  Request,
  Response extends { partial: unknown; final: unknown },
>() {
  /**
   * The listener function receives a payload describing how to push partial data,
   * end the stream, or fail the stream.
   */
  type ListenerFn = (
    payload: MessageEventStreamPayload<Request, Response>,
  ) => MaybeCleanupFn;

  /** We store the listener(s) in a Set, expecting at most one. */
  const listeners = new Set<ListenerFn>();

  return {
    /**
     * Subscribe exactly one listener for this request type.
     * Returns a function to unsubscribe.
     */
    subscribeToRequest(listener: ListenerFn) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    /**
     * Send a request, optionally providing handlers for partial data and errors.
     * Returns a Promise<Response["final"]> that resolves on endStream(...)
     * or rejects on failStream(...).
     */
    sendRequest(
      request: Request,
      options: RequestStreamOptions<Response> = {},
    ): Promise<Response["final"]> {
      const { onData, onError } = options;

      return new Promise<Response["final"]>((resolve, reject) => {
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
          // Invoke the listener
          const cleanup = listener({
            metadata: request,

            pushResponse: (partialData) => {
              onData?.(partialData);
            },

            endStream: async (finalData) => {
              // Successfully end the stream
              await Promise.resolve(); // next tick
              resolve(finalData);
              // Cleanup
              for (const [, cfn] of cleanups) {
                if (typeof cfn === "function") {
                  cfn();
                }
              }
              cleanups.clear();
            },

            failStream: async (error) => {
              onError?.(error);
              await Promise.resolve(); // next tick
              reject(error);
              // Cleanup
              for (const [, cfn] of cleanups) {
                if (typeof cfn === "function") {
                  cfn();
                }
              }
              cleanups.clear();
            },
          });

          // Store any cleanup function returned by the listener
          cleanups.set(listener, cleanup);
        }
      });
    },
  };
}

/**
 * If you want to hook this into your existing "MessageSpec" approach,
 * you can define a type alias that matches your new shape:
 */
export type StreamResponseMessaging<Message> =
  // We now expect MessageSpec<Req, { partial: X; final: Y }>
  Message extends MessageSpec<infer Req, infer Resp>
    ? Resp extends { partial: unknown; final: unknown }
      ? ReturnType<typeof createRequestStreamMessaging<Req, Resp>>
      : never
    : never;

export type MessageToStreamSubscriberPayload<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? Response extends { partial: unknown; final: unknown }
      ? MessageEventStreamPayload<Request, Response>
      : never
    : never;

export type MessageToStreamApi<Message> =
  Message extends MessageSpec<
    infer Request,
    { partial: infer Partial; final: infer Final }
  >
    ? (
        request: Request,
        options?: RequestStreamOptions<{ partial: Partial; final: Final }>,
      ) => Promise<Final>
    : never;
