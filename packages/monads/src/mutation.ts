// We no longer use v4 single mutation, in v5 we separate mutation state and page actions

export type IdleMutationData = { status: "idle" };
export type PendingMutationData<Request> = {
  status: "pending";
  request: Request;
};
export type SuccessMutationData<Request, Response> = {
  status: "success";
  request: Request;
  response: Response;
};
export type ErrorMutationData<Request> = {
  status: "error";
  request: Request;
  error: Error;
};
export type MutationData<Request, Response> =
  | IdleMutationData
  | PendingMutationData<Request>
  | SuccessMutationData<Request, Response>
  | ErrorMutationData<Request>;

export const mt = {
  ofSuccess: <Request, Response>(request: Request, response: Response) =>
    ({
      status: "success",
      request,
      response,
    }) satisfies MutationData<Request, Response>,
  ofError: <Request>(request: Request, error: Error) =>
    ({
      status: "error",
      request,
      error,
    }) satisfies MutationData<Request, Response>,
  ofIdle: <Request>() =>
    ({ status: "idle" }) satisfies MutationData<Request, unknown>,
  ofPending: <Request>(request: Request) =>
    ({
      status: "pending",
      request,
    }) satisfies MutationData<Request, unknown>,
  isInProgress: <M extends MutationData<unknown, unknown>>(
    mutation: M,
  ): mutation is Extract<M, { status: "pending" }> =>
    mutation.status === "pending",
  isIdle: <M extends MutationData<unknown, unknown>>(
    mutation: M,
  ): mutation is Extract<M, { status: "idle" }> => mutation.status === "idle",
  isSuccess: <M extends MutationData<unknown, unknown>>(
    mutation: M,
  ): mutation is Extract<M, { status: "success" }> =>
    mutation.status === "success",
  isInError: <M extends MutationData<unknown, unknown>>(
    mutation: M,
  ): mutation is Extract<M, { status: "error" }> => mutation.status === "error",
  isExecutable: <M extends MutationData<unknown, unknown>>(mutation: M) =>
    mutation.status !== "pending",
  mapError: <Request, Response>(
    mutation: MutationData<Request, Response>,
    fn: (error: Error) => Error,
  ): MutationData<Request, Response> =>
    mt.isInError(mutation)
      ? mt.ofError(mutation.request, fn(mutation.error))
      : mutation,
  mapErrorMonadic: <Request, Response>(
    mutation: MutationData<Request, Response>,
    fn: (error: Error) => MutationData<Request, Response>,
  ): MutationData<Request, Response> =>
    mt.isInError(mutation) ? fn(mutation.error) : mutation,
  when: <Request, Response>(
    mutation: MutationData<Request, Response>,
    filter: (request: Request) => boolean,
  ): MutationData<Request, Response> => {
    if (mutation.status === "idle") return mutation;
    return filter(mutation.request) ? mutation : mt.ofIdle<Request>();
  },
  journey: <Request, Response>(mutation: MutationData<Request, Response>) => ({
    initially: <A>(initialRenderer: NoFunction<A> | (() => A)) => ({
      during: <B>(
        pendingRenderer:
          | NoFunction<B>
          | ((mutation: PendingMutationData<Request>) => B),
      ) => ({
        catch: <C>(
          errorRenderer: (mutation: ErrorMutationData<Request>) => C,
        ) => ({
          done: <D>(
            successRenderer:
              | NoFunction<D>
              | ((data: SuccessMutationData<Request, Response>) => D),
          ) => {
            if (mutation.status === "idle") {
              return isFunction(initialRenderer)
                ? (initialRenderer() as A)
                : initialRenderer;
            }
            if (mutation.status === "pending") {
              return isFunction(pendingRenderer)
                ? (pendingRenderer(mutation) as B)
                : pendingRenderer;
            }
            if (mutation.status === "error") {
              return errorRenderer(mutation) as C;
            }
            if (mutation.status === "success") {
              return isFunction(successRenderer)
                ? (successRenderer(mutation) as D)
                : successRenderer;
            }
            throw new Error("Unrecognized mutation status");
          },
        }),
      }),
    }),
  }),
};

type NoFunction<T> = T extends Function ? never : T;

const isFunction = <T>(
  value: T,
): value is T extends (...args: any[]) => any ? T : never =>
  typeof value === "function";
