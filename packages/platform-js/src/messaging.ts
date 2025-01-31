export type MessageEventPayload<Request, Response> = {
  request: Request;
  sendResponse: (response: Response) => void;
};
type MaybeCleanupFnWithSource = void | ((source: "self" | "other") => void);
type MaybeCleanupFn = void | (() => void);
export function createRequestResponseMessaging<
  Message extends MessageSpec<unknown, unknown>,
>(): Messaging<Message>;
export function createRequestResponseMessaging<Request, Response>(): Messaging<{
  request: Request;
  response: Response;
}>;
export function createRequestResponseMessaging<Request, Response>(): Messaging<{
  request: Request;
  response: Response;
}> {
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
              request: request,
              sendResponse: async (response) => {
                // edge case - someone in the listener synchronously calls the cleanup function so cleanup is not set yet
                await Promise.resolve();
                resolve(response);
                for (const [, cleanup] of cleanups) {
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
export function createRequestCollectMessaging<
  Message extends MessageSpec<unknown, unknown>,
>(): CollectResponseMessaging<Message>;
export function createRequestCollectMessaging<
  Request,
  Response,
>(): CollectResponseMessaging<{
  request: Request;
  response: Response;
}>;
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
    sendRequest(request: Request, warningTimeout?: number) {
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

          const timeoutId = warningTimeout
            ? setTimeout(() => {
                if (collectedResponses.length < numListeners) {
                  console.warn(
                    "[request-collect messaging]: No response received within 10 seconds for the request.",
                    "Expected responses from",
                    numListeners,
                    "listeners, but received only",
                    collectedResponses.length,
                    ".",
                    "Please make sure that all listeners are sending a response",
                  );
                }
              }, warningTimeout)
            : undefined;

          listeners.forEach((listener) => {
            const cleanup = listener({
              request: request,
              sendResponse: async (response) => {
                // edge case - someone in the listener synchronously calls the cleanup function so cleanup is not set yet
                await Promise.resolve();
                collectedResponses.push(response);
                if (collectedResponses.length === numListeners) {
                  clearTimeout(timeoutId);
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

export function createRequestFirstResponseMessaging<
  Message extends MessageSpec<unknown, unknown>,
>(): FirstResponseMessaging<Message>;
export function createRequestFirstResponseMessaging<
  Request,
  Response,
>(): FirstResponseMessaging<{
  request: Request;
  response: Response;
}>;
export function createRequestFirstResponseMessaging<Request, Response>() {
  type MessageEventPayload = {
    request: Request;
    sendResponse: (response: Response) => Promise<void>;
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

          listeners.forEach((listener) => {
            const cleanup = listener({
              request: request,
              sendResponse: async (response) => {
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
                    let savedsendResponse;
                    subscribeToRequest(({ request, sendResponse }) => {
                      savedResolvedCallback=sendResponse("response");
                      return () => { savedsendResponse = undefined; };
                    });
                    
                    // later in the code
                    savedsendResponse?.("response"); // this will be called only if the cleanup function was not called before
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
export type Messaging<Message extends MessageSpec<unknown, unknown>> = {
  subscribeToRequest: (
    listener: (
      payload: MessageEventPayload<Message["request"], Message["response"]>,
    ) => void,
  ) => () => void;
  sendRequest: (request: Message["request"]) => Promise<Message["response"]>;
};

export type CollectResponseMessaging<
  Message extends MessageSpec<unknown, unknown>,
> = {
  subscribeToRequest: (
    listener: (
      payload: MessageEventPayload<Message["request"], Message["response"]>,
    ) => void,
  ) => () => void;
  sendRequest: (
    request: Message["request"],
    warningTimeout?: number,
  ) => Promise<Message["response"][]>;
};

export type FirstResponseMessaging<
  Message extends MessageSpec<unknown, unknown>,
> = {
  subscribeToRequest: (
    listener: (
      payload: MessageEventPayload<Message["request"], Message["response"]>,
    ) => void,
  ) => () => void;
  sendRequest: (request: Message["request"]) => Promise<Message["response"]>;
};

export type MessageToPromiseApi<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? (request: Request) => Promise<Response>
    : never;

export type MessageToSubscriberPayload<Message> =
  Message extends MessageSpec<infer Request, infer Response>
    ? MessageEventPayload<Request, Response>
    : never;
