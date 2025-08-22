import { Batcher, create, windowScheduler } from "@yornaath/batshit";

export const createBatcher = <
  SinglePayload,
  AggregatedResponse,
  ResolvedSingleResponse,
>(
  batchQueryFn: (
    payload: SinglePayload[],
    signal: AbortSignal,
  ) => Promise<AggregatedResponse>,
  resolver: (
    items: AggregatedResponse,
    payload: SinglePayload,
  ) => ResolvedSingleResponse,
) =>
  create({
    fetcher: async (
      requests: { payload: SinglePayload; signal: AbortSignal }[],
    ) => {
      const abortController = new AbortController();
      const allSignals = requests.map((r) => r.signal);
      allSignals.forEach((signal) =>
        signal.addEventListener("abort", () => {
          const areThereAnyActiveRequests = allSignals.some(
            (signal) => !signal.aborted,
          );
          if (!areThereAnyActiveRequests) {
            abortController.abort();
          }
        }),
      );
      return await batchQueryFn(
        requests.map((r) => r.payload),
        abortController.signal,
      );
    },
    resolver: (items, request) => resolver(items, request.payload),
    scheduler: windowScheduler(10),
  });

export class BatchingImpossibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BatchingImpossibleError";
  }
}

export function createBatcherWithFallback<T, Q, R>(
  batcher: Batcher<T, Q, R>,
  fallback: (payload: Q) => Promise<R>,
): Batcher<T, Q, R> {
  return {
    fetch: async function (data) {
      try {
        return await batcher.fetch(data);
      } catch (error) {
        if (error instanceof BatchingImpossibleError) {
          return await fallback(data);
        }
        throw error;
      }
    },
  };
}
