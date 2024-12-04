export type MessageEventPayload<Request, Response> = {
  metadata: Request;
  resolveCallback: (response: Response) => void;
};
type MaybeCleanupFnWithSource = void | ((source: "self" | "other") => void);
type MaybeCleanupFn = void | (() => void);
export function createRequestResponseMessaging<Request, Response>() {
  const listeners = new Set<
    (payload: MessageEventPayload<Request, Response>) => MaybeCleanupFn
  >();

  return {
    subscribeToRequest(
      listener: (
        payload: MessageEventPayload<Request, Response>,
      ) => MaybeCleanupFn,
    ) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    sendRequest(request: Request) {
      return new Promise<Response>((resolve, reject) => {
        const numListeners = listeners.size;

        if (numListeners === 0) {
          reject(
            new Error(
              "No listener found for the request in request-response mode",
            ),
          );
        } else if (numListeners > 1) {
          reject(
            new Error(
              "Multiple listeners found for the request in request-response mode",
            ),
          );
        } else {
          const cleanups = new Map<
            (payload: MessageEventPayload<Request, Response>) => MaybeCleanupFn,
            MaybeCleanupFn
          >();
          listeners.forEach((listener) => {
            const cleanup = listener({
              metadata: request,
              resolveCallback: async (response) => {
                // edge case - someone in the listener synchronously calls the cleanup function so cleanup is not set yet
                await Promise.resolve();
                resolve(response);
                for (const [listenerOfCleanup, cleanup] of cleanups) {
                  // void functions can return anything, ie promises, so we need to ignore the return value in this case
                  if (cleanup && typeof cleanup === "function") {
                    cleanup();
                  }
                }
                cleanups.clear();
              },
            });
            cleanups.set(listener, cleanup);
          });
        }
      });
    },
  };
}

export function createRequestCollectMessaging<Request, Response>() {
  const listeners: Set<
    (
      payload: MessageEventPayload<Request, Response>,
    ) => MaybeCleanupFnWithSource
  > = new Set();

  return {
    subscribeToRequest(
      listener: (payload: MessageEventPayload<Request, Response>) => void,
    ) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    sendRequest(request: Request) {
      return new Promise<Response[]>((resolve, reject) => {
        const numListeners = listeners.size;

        if (numListeners === 0) {
          reject(
            new Error(
              "No listener found for the request in request-collect mode, expected at least one",
            ),
          );
        } else {
          const collectedResponses: Response[] = [];

          const cleanups = new Map<
            (
              payload: MessageEventPayload<Request, Response>,
            ) => MaybeCleanupFnWithSource,
            MaybeCleanupFnWithSource
          >();

          listeners.forEach((listener) => {
            const cleanup = listener({
              metadata: request,
              resolveCallback: async (response) => {
                // edge case - someone in the listener synchronously calls the cleanup function so cleanup is not set yet
                await Promise.resolve();
                collectedResponses.push(response);
                if (collectedResponses.length === numListeners) {
                  resolve(collectedResponses);
                  for (const [listenerOfCleanup, cleanup] of cleanups) {
                    // void functions can return anything, ie promises, so we need to ignore the return value in this case
                    if (cleanup && typeof cleanup === "function") {
                      cleanup(
                        listenerOfCleanup === listener ? "self" : "other",
                      );
                    }
                  }
                }
              },
            });
            cleanups.set(listener, cleanup);
          });
        }
      });
    },
  };
}

export function createRequestFirstResponseMessaging<Request, Response>() {
  type MessageEventPayload = {
    metadata: Request;
    resolveCallback: (response: Response) => void;
  };

  const listeners: Set<
    (payload: MessageEventPayload) => MaybeCleanupFnWithSource
  > = new Set();

  return {
    subscribeToRequest(
      listener: (payload: MessageEventPayload) => MaybeCleanupFnWithSource,
    ) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    sendRequest(request: Request) {
      // todo - here we should start collecting cleanup functions, so we isolate the cleanup functions for each request
      return new Promise<Response>((resolve, reject) => {
        const numListeners = listeners.size;

        if (numListeners === 0) {
          reject(
            new Error(
              "No listener found for the request in request-first-response mode, expected at least one",
            ),
          );
        } else {
          let isResolved = false;
          const cleanups = new Map<
            (payload: MessageEventPayload) => MaybeCleanupFnWithSource,
            MaybeCleanupFnWithSource
          >();

          listeners.forEach((listener, index) => {
            const cleanup = listener({
              metadata: request,
              resolveCallback: async (response) => {
                // edge case - someone in the listener synchronously calls the cleanup function so cleanup is not set yet
                await Promise.resolve();
                if (!isResolved) {
                  isResolved = true;
                  resolve(response);

                  for (const [listenerOfCleanup, cleanup] of cleanups) {
                    // void functions can return anything, ie promises, so we need to ignore the return value in this case
                    if (cleanup && typeof cleanup === "function") {
                      cleanup(
                        listenerOfCleanup === listener ? "self" : "other",
                      );
                    }
                  }
                  cleanups.clear();
                } else {
                  console.warn(
                    `Multiple responses received in request-first-response mode, expected at most one.
                    You code should prevent this from happening by properly utilizing cleanup functions.
                    example:
                    let savedResolveCallback;
                    subscribeToRequest(({ metadata, resolveCallback }) => {
                      savedResolvedCallback=resolveCallback("response");
                      return () => { savedResolveCallback = undefined; };
                    });
                    
                    // later in the code
                    savedResolveCallback?.("response"); // this will be called only if the cleanup function was not called before
                    `,
                  );
                }
              },
            });
            cleanups.set(listener, cleanup);
          });
        }
      });
    },
  };
}
export type MessageSpec<TInferRequest, TInferResponse> = {
  request: TInferRequest;
  response: TInferResponse;
};
export type Messaging<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? ReturnType<typeof createRequestResponseMessaging<Request, Response>>
    : never;

export type CollectResponseMessaging<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? ReturnType<typeof createRequestCollectMessaging<Request, Response>>
    : never;

export type FirstResponseMessaging<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? ReturnType<typeof createRequestFirstResponseMessaging<Request, Response>>
    : never;

export type MessageToPromise<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? (request: Request) => Promise<Response>
    : never;

export type MessageToSubscriberPayload<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? MessageEventPayload<Request, Response>
    : never;
