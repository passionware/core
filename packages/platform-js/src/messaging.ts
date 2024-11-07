import { createInspectableEvent } from "@passionware/simple-event";

export type MessageEventPayload<Request, Response> = {
  metadata: Request;
  resolveCallback: (response: Response) => void;
};
export function createRequestResponseMessaging<Request, Response>() {
  const event =
    createInspectableEvent<MessageEventPayload<Request, Response>>();

  return {
    subscribeToRequest(
      listener: (payload: MessageEventPayload<Request, Response>) => void,
    ) {
      return event.addListener(listener);
    },
    sendRequest(request: Request) {
      return new Promise<Response>((resolve, reject) => {
        const numListeners = event.getListeners().length;
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
          event.emit({
            metadata: request,
            resolveCallback: resolve,
          });
        }
      });
    },
  };
}

export function createRequestCollectMessaging<Request, Response>() {
  type MessageEventPayload = {
    metadata: Request;
    resolveCallback: (response: Response) => void;
  };

  const event = createInspectableEvent<MessageEventPayload>();

  return {
    subscribeToRequest(listener: (payload: MessageEventPayload) => void) {
      return event.addListener(listener);
    },
    sendRequest(request: Request) {
      return new Promise<Response[]>((resolve, reject) => {
        const numListeners = event.getListeners().length;

        if (numListeners === 0) {
          reject(
            new Error(
              "No listener found for the request in request-collect mode, expected at least one",
            ),
          );
        } else {
          const collectedResponses: Response[] = [];
          event.emit({
            metadata: request,
            resolveCallback: (response) => {
              collectedResponses.push(response);
              if (collectedResponses.length === numListeners) {
                resolve(collectedResponses);
              }
            },
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

  const event = createInspectableEvent<MessageEventPayload>();
  const cleanupFunctions: ((source: "self" | "other") => void)[] = [];
  let responderIndex: number | null = null; // Tracks which listener responded

  return {
    subscribeToRequest(
      listener: (
        payload: MessageEventPayload,
      ) => ((source: "self" | "other") => void) | void,
    ) {
      const wrappedListener = (payload: MessageEventPayload) => {
        const cleanup = listener(payload);
        if (cleanup) {
          cleanupFunctions.push(cleanup);
        }
      };

      return event.addListener(wrappedListener);
    },
    sendRequest(request: Request) {
      return new Promise<Response>((resolve, reject) => {
        const listeners = event.getListeners();
        const numListeners = listeners.length;

        if (numListeners === 0) {
          reject(
            new Error(
              "No listener found for the request in request-first-response mode, expected at least one",
            ),
          );
        } else {
          let isResolved = false;

          listeners.forEach((listener, index) => {
            listener({
              metadata: request,
              resolveCallback: (response) => {
                if (!isResolved) {
                  isResolved = true;
                  resolve(response);
                  responderIndex = index; // Set the index of the responding listener

                  // Call each cleanup function with the appropriate source parameter
                  cleanupFunctions.forEach((cleanup, cleanupIndex) => {
                    cleanup(cleanupIndex === responderIndex ? "self" : "other");
                  });

                  cleanupFunctions.length = 0; // Clear cleanup functions after calling them
                }
              },
            });
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
