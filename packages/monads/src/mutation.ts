// We no longer use v4 single mutation, in v5 we separate mutation state and page actions

import { mutationDataToRemoteData, remoteDataToMutationData } from "./convert";
import { Maybe } from "./maybe";
import {
  ErrorMutationData,
  MutationData,
  PendingMutationData,
  SuccessMutationData,
} from "./mutation.types";

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
  getRequest: <Request, Response>(
    mutation: MutationData<Request, Response>,
  ): Maybe<Request> => (mt.isStarted(mutation) ? mutation.request : null),
  getResponse: <Request, Response>(
    mutation: MutationData<Request, Response>,
  ): Maybe<Response> => (mt.isSuccess(mutation) ? mutation.response : null),
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
  isStarted: <M extends MutationData<unknown, unknown>>(
    mutation: M,
  ): mutation is Exclude<M, { status: "idle" }> => mutation.status !== "idle",
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
  toRemoteData: mutationDataToRemoteData,
  fromRemoteData: remoteDataToMutationData,
};

type NoFunction<T> = T extends Function ? never : T;

const isFunction = <T>(
  value: T,
): value is T extends (...args: any[]) => any ? T : never =>
  typeof value === "function";
