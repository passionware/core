// We no longer use v4 single mutation, in v5 we separate mutation state and page actions

import { mutationDataToRemoteData, remoteDataToMutationData } from "./convert";
import { Maybe } from "./maybe";
import {
  ErrorMutationData,
  IdleMutationData,
  MutationData,
  PendingMutationData,
  SuccessMutationData,
} from "./mutation.types";

export const mt = {
  /**
   * @deprecated Use of instead
   */
  ofSuccess: <Request, Response>(request: Request, response: Response) =>
    ({
      status: "success",
      request,
      response,
    }) satisfies MutationData<Request, Response>,
  of: <Request, Response>(request: Request, response: Response) =>
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
  ofIdle: <Request>(isBlocked = false) =>
    ({ status: "idle", isBlocked }) satisfies MutationData<Request, unknown>,
  ofPending: <Request>(request: Request) =>
    ({
      status: "pending",
      request,
    }) satisfies MutationData<Request, unknown>,
  getRequest: <Request, Response>(
    mutation: MutationData<Request, Response>
  ): Maybe<Request> => (mt.isStarted(mutation) ? mutation.request : null),
  getResponse: <Request, Response>(
    mutation: MutationData<Request, Response>
  ): Maybe<Response> => (mt.isSuccess(mutation) ? mutation.response : null),
  isInProgress: <M extends MutationData<unknown, unknown>>(
    mutation: M
  ): mutation is Extract<M, { status: "pending" }> =>
    mutation.status === "pending",
  isIdle: <M extends MutationData<unknown, unknown>>(
    mutation: M
  ): mutation is Extract<M, { status: "idle" }> => mutation.status === "idle",
  isSuccess: <M extends MutationData<unknown, unknown>>(
    mutation: M
  ): mutation is Extract<M, { status: "success" }> =>
    mutation.status === "success",
  isInError: <M extends MutationData<unknown, unknown>>(
    mutation: M
  ): mutation is Extract<M, { status: "error" }> => mutation.status === "error",
  isStarted: <M extends MutationData<unknown, unknown>>(
    mutation: M
  ): mutation is Exclude<M, { status: "idle" }> => mutation.status !== "idle",
  isBlocked: <M extends MutationData<unknown, unknown>>(mutation: M) =>
    mutation.status === "idle" && mutation.isBlocked === true,
  isExecutable: <M extends MutationData<unknown, unknown>>(mutation: M) =>
    mutation.status !== "pending" && !mt.isBlocked(mutation),
  mapError: <Request, Response>(
    mutation: MutationData<Request, Response>,
    fn: (error: Error) => Error
  ): MutationData<Request, Response> =>
    mt.isInError(mutation)
      ? mt.ofError(mutation.request, fn(mutation.error))
      : mutation,
  mapErrorMonadic: <Request, Response>(
    mutation: MutationData<Request, Response>,
    fn: (error: Error) => MutationData<Request, Response>
  ): MutationData<Request, Response> =>
    mt.isInError(mutation) ? fn(mutation.error) : mutation,
  mapRequest: <Request, Response, MappedRequest>(
    mutation: MutationData<Request, Response>,
    fn: (request: Request) => MappedRequest
  ): MutationData<MappedRequest, Response> => {
    switch (mutation.status) {
      case "idle":
        return mutation;
      case "pending":
        return mt.ofPending(fn(mutation.request));
      case "success":
        return mt.of(fn(mutation.request), mutation.response);
      case "error":
        return mt.ofError(fn(mutation.request), mutation.error);
    }
  },
  mapRequestMonadic: <Request, Response, MappedRequest>(
    mutation: MutationData<Request, Response>,
    fn: (
      request:
        | PendingMutationData<Request>
        | SuccessMutationData<Request, Response>
        | ErrorMutationData<Request>
    ) => MutationData<MappedRequest, Response>
  ): MutationData<MappedRequest, Response> => {
    switch (mutation.status) {
      case "idle":
        return mutation;
      case "pending":
      case "success":
      case "error":
        return fn(mutation);
    }
  },
  mapResponse: <Request, Response, MappedResponse>(
    mutation: MutationData<Request, Response>,
    fn: (response: Response) => MappedResponse
  ): MutationData<Request, MappedResponse> => {
    switch (mutation.status) {
      case "idle":
        return mutation;
      case "pending":
        return mutation;
      case "success":
        return mt.of(mutation.request, fn(mutation.response));
      case "error":
        return mutation;
    }
  },
  mapResponseMonadic: <Request, Response, MappedResponse>(
    mutation: MutationData<Request, Response>,
    fn: (response: Response) => MutationData<Request, MappedResponse>
  ): MutationData<Request, MappedResponse> => {
    switch (mutation.status) {
      case "idle":
        return mutation;
      case "pending":
        return mutation;
      case "success":
        return fn(mutation.response);
      case "error":
        return mutation;
    }
  },
  when: <Request, Response>(
    mutation: MutationData<Request, Response>,
    filter: (request: Request) => boolean
  ): MutationData<Request, Response> => {
    if (mutation.status === "idle") return mutation;
    return filter(mutation.request) ? mutation : mt.ofIdle<Request>();
  },
  /**
   * Same as when, but blocks the mutation if the filter is false
   */
  blockUnless: <Request, Response>(
    mutation: MutationData<Request, Response>,
    filter: (request: Request) => boolean
  ): MutationData<Request, Response> => {
    if (mutation.status === "idle") return mutation;
    return filter(mutation.request)
      ? mutation
      : mt.ofIdle(mt.isInProgress(mutation));
  },
  journey: <Request, Response>(mutation: MutationData<Request, Response>) => ({
    initially: <A>(
      initialRenderer: NoFunction<A> | ((initial: IdleMutationData) => A)
    ) => ({
      during: <B>(
        pendingRenderer:
          | NoFunction<B>
          | ((mutation: PendingMutationData<Request>) => B)
      ) => ({
        catch: <C>(
          errorRenderer: (mutation: ErrorMutationData<Request>) => C
        ) => ({
          done: <D>(
            successRenderer:
              | NoFunction<D>
              | ((data: SuccessMutationData<Request, Response>) => D)
          ) => {
            if (mutation.status === "idle") {
              return isFunction(initialRenderer)
                ? (initialRenderer(mutation) as A)
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
  value: T
): value is T extends (...args: any[]) => any ? T : never =>
  typeof value === "function";
