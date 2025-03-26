import { type DependencyList, useEffect, useMemo, useRef } from "react";
import useLast from "use-last";
import { mutationDataToRemoteData, remoteDataToMutationData } from "./convert";
import { maybe, Maybe } from "./maybe";
import {
  RemoteData,
  RemoteDataError,
  RemoteDataIdle,
  RemoteDataPending,
  RemoteDataSuccess,
} from "./remoteData.types";

export class MappingError extends Error {
  originalError: unknown;

  constructor(originalError: unknown) {
    // Check if the original error is an instance of Error and use its message
    const message =
      originalError instanceof Error ? originalError.message : "unknown error";
    const errorMessage = `Error while mapping RemoteData: ${message}`;

    // Call the super constructor with the custom error message
    super(errorMessage);

    // If available, attach the stack trace from the original error
    if (originalError instanceof Error && originalError.stack) {
      this.stack += `\nMappingError: ${errorMessage}\nOriginal stack:\n${originalError.stack}`;
    }

    this.originalError = originalError;
    this.name = "MappingError"; // Setting the error name is good practice

    // Ensure the instance appears to be of type MappingError
    Object.setPrototypeOf(this, MappingError.prototype);
  }

  // You can add additional methods here for error handling, like logging or categorizing the error
}

export class RemoteDataGetError extends Error {
  originalError: unknown;

  constructor(errorMessage: string, originalError: unknown) {
    // Check if the original error is an instance of Error and use its message

    // Call the super constructor with the custom error message
    super(errorMessage);

    // If available, attach the stack trace from the original error
    if (originalError instanceof Error && originalError.stack) {
      this.stack += `\nRemoteDataGetError: ${errorMessage}\nOriginal stack:\n${originalError.stack}`;
    }

    this.originalError = originalError;
    this.name = "RemoteDataGetError"; // Setting the error name is good practice

    // Ensure the instance appears to be of type RemoteDataGetError
    Object.setPrototypeOf(this, RemoteDataGetError.prototype);
  }
}

export const rd = {
  // consider map catching mapping errors and replacing them with a RemoteDataError of MappingError
  // we can also add unSafeMap that throws the error as this one currently does
  map<T, U>(remoteData: RemoteData<T>, f: (data: T) => U): RemoteData<U> {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "error":
        return remoteData;
      case "success":
        try {
          return { ...remoteData, data: f(remoteData.data) };
        } catch (error) {
          return rd.ofError(new MappingError(error));
        }
    }
  },
  unsafeMap<T, U>(remoteData: RemoteData<T>, f: (data: T) => U): RemoteData<U> {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "error":
        return remoteData;
      case "success":
        try {
          return { ...remoteData, data: f(remoteData.data) };
        } catch (error) {
          throw new MappingError(error);
        }
    }
  },

  // todo unsafe.mapOrElse
  mapOrElse<T, U, V>(
    remoteData: RemoteData<T>,
    f: (data: T) => U,
    defaultValue: V,
  ): U | V {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "error":
        return defaultValue;
      case "success":
        return f(remoteData.data);
    }
  },
  // todo unsafe.mapOrMake
  mapOrMake<T, U, V>(
    remoteData: RemoteData<T>,
    f: (data: T) => U,
    make: () => V,
  ): U | V {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "error":
        return make();
      case "success":
        return f(remoteData.data);
    }
  },
  // todo unsafe.tryMap
  tryMap<T, U>(remoteData: RemoteData<T>, f: (data: T) => U): U | undefined {
    return rd.mapOrElse(remoteData, f, undefined);
  },
  /**
   * Map a function that returns a RemoteData over a RemoteData
   * It's like map, but it allows you to return a RemoteData from the function, so you can map it to error for example
   */
  mapMonadic<T, U>(
    remoteData: RemoteData<T>,
    f: (data: T) => RemoteData<U>,
  ): RemoteData<U> {
    switch (remoteData.status) {
      case "idle":
      case "pending":
        return remoteData;
      case "error":
        return remoteData;
      case "success":
        return f(remoteData.data);
    }
  },
  /**
   * Safely flat maps over the success data of a RemoteData and returns a new RemoteData.
   * If the mapping function throws an error, it catches the error and returns a RemoteDataError.
   */
  flatMap<T, U>(
    remoteData: RemoteData<T>,
    f: (data: T) => RemoteData<U>,
  ): RemoteData<U> {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "error":
        return remoteData;
      case "success":
        try {
          return f(remoteData.data);
        } catch (error) {
          return rd.ofError(new MappingError(error));
        }
    }
  },

  /**
   * Unsafe version of flatMap that throws an error if the mapping function fails.
   * Use this if you want to propagate the error directly instead of returning a RemoteDataError.
   */
  unsafeFlatMap<T, U>(
    remoteData: RemoteData<T>,
    f: (data: T) => RemoteData<U>,
  ): RemoteData<U> {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "error":
        return remoteData;
      case "success":
        return f(remoteData.data); // Unsafe, it throws if f throws
    }
  },
  mapError<T>(
    remoteData: RemoteData<T>,
    f: (error: Error) => Error,
  ): RemoteData<T> {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "success":
        return remoteData;
      case "error":
        return { ...remoteData, error: f(remoteData.error) };
    }
  },
  mapErrorMonadic<T>(
    remoteData: RemoteData<T>,
    f: (error: Error) => RemoteData<T>,
  ): RemoteData<T> {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "success":
        return remoteData;
      case "error":
        return f(remoteData.error);
    }
  },
  getOrElse<T, U>(remoteData: RemoteData<T>, f: U | (() => U)): T | U {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "error":
        return typeof f === "function" ? (f as () => U)() : f;
      case "success":
        return remoteData.data;
    }
  },
  getOrThrow<T>(
    remoteData: RemoteData<T>,
    message = "Attempted to get value from non-successful RemoteData",
  ): T {
    if (remoteData.status === "success") {
      return remoteData.data;
    }
    if (remoteData.status === "error") {
      throw new RemoteDataGetError(
        `${message}: ${remoteData.error.message}`,
        remoteData.error,
      );
    }
    throw new Error(message);
  },
  tryGet<T>(remoteData: RemoteData<T>): T | undefined {
    switch (remoteData.status) {
      case "idle":
      case "pending":
      case "error":
        return undefined;
      case "success":
        return remoteData.data;
    }
  },
  tryGetError<T>(remoteData: RemoteData<T>): Error | undefined {
    if (remoteData.status === "error") {
      return remoteData.error;
    }
    return undefined;
  },
  journey<T>(remote: RemoteData<T>) {
    return {
      wait: <A>(pendingRenderer: NoFunction<A> | (() => A)) => ({
        catch: <B>(errorRenderer: (error: Error) => B) => ({
          /**
           * @deprecated use map or get
           */
          done: <C>(successRenderer: (data: T) => C) => {
            switch (remote.status) {
              case "idle":
              case "pending":
                return isFunction(pendingRenderer)
                  ? (pendingRenderer() as A)
                  : pendingRenderer;
              case "error":
                return errorRenderer(remote.error);
              case "success":
                return successRenderer(remote.data);
            }
          },
          map: <C>(successRenderer: (data: T) => C) => {
            switch (remote.status) {
              case "idle":
              case "pending":
                return isFunction(pendingRenderer)
                  ? (pendingRenderer() as A)
                  : pendingRenderer;
              case "error":
                return errorRenderer(remote.error);
              case "success":
                try {
                  return successRenderer(remote.data);
                } catch (error) {
                  return errorRenderer(new MappingError(error));
                }
            }
          },
          unsafeMap: <C>(successRenderer: (data: T) => C) => {
            switch (remote.status) {
              case "idle":
              case "pending":
                return isFunction(pendingRenderer)
                  ? (pendingRenderer() as A)
                  : pendingRenderer;
              case "error":
                return errorRenderer(remote.error);
              case "success":
                return successRenderer(remote.data);
            }
          },
          get: () => {
            switch (remote.status) {
              case "idle":
              case "pending":
                return isFunction(pendingRenderer)
                  ? (pendingRenderer() as A)
                  : pendingRenderer;
              case "error":
                return errorRenderer(remote.error);
              case "success":
                return remote.data;
            }
          },
        }),
      }),
    };
  },
  fullJourney<T>(remote: RemoteData<T>) {
    return {
      initially: <A>(initialRenderer: NoFunction<A> | (() => A)) => ({
        wait: <B>(pendingRenderer: NoFunction<B> | (() => B)) => ({
          catch: <C>(errorRenderer: (error: Error) => C) => ({
            /**
             * @deprecated use map or get
             */
            done: <D>(successRenderer: (data: T) => D) => {
              switch (remote.status) {
                case "idle":
                  return isFunction(initialRenderer)
                    ? (initialRenderer() as A)
                    : initialRenderer;
                case "pending":
                  return isFunction(pendingRenderer)
                    ? (pendingRenderer() as B)
                    : pendingRenderer;
                case "error":
                  return errorRenderer(remote.error);
                case "success":
                  return successRenderer(remote.data);
              }
            },
            map: <D>(successRenderer: (data: T) => D) => {
              switch (remote.status) {
                case "idle":
                  return isFunction(initialRenderer)
                    ? (initialRenderer() as A)
                    : initialRenderer;
                case "pending":
                  return isFunction(pendingRenderer)
                    ? (pendingRenderer() as B)
                    : pendingRenderer;
                case "error":
                  return errorRenderer(remote.error);
                case "success":
                  return successRenderer(remote.data);
              }
            },
            get: () => {
              switch (remote.status) {
                case "idle":
                  return isFunction(initialRenderer)
                    ? (initialRenderer() as A)
                    : initialRenderer;
                case "pending":
                  return isFunction(pendingRenderer)
                    ? (pendingRenderer() as B)
                    : pendingRenderer;
                case "error":
                  return errorRenderer(remote.error);
                case "success":
                  return remote.data;
              }
            },
          }),
        }),
      }),
    };
  },
  replace<T, U>(remoteData: RemoteData<T>, newResult: U): RemoteData<U> {
    switch (remoteData.status) {
      case "idle":
      case "pending":
        return remoteData;
      case "error":
        return remoteData;
      case "success":
        return { ...remoteData, data: newResult };
    }
  },
  postpone: <T>(a: RemoteData<T>, b: RemoteData<unknown>): RemoteData<T> => {
    if (rd.isPending(b)) {
      return rd.ofPending();
    }
    return a;
  },
  /**
   * Returns second only if first is successful
   * @param first
   * @param second
   */
  then<T, U>(first: RemoteData<T>, second: RemoteData<U>): RemoteData<U> {
    if (rd.isSuccess(first)) {
      return second;
    }
    return first;
  },
  /**
   * Creates a RemoteData with success data.
   */
  of<T>(data: T): RemoteDataSuccess<T> {
    return {
      status: "success",
      data,
      isFetching: false,
      isPlaceholderData: false,
    };
  },
  /**
   * Creates a RemoteData with placeholder data.
   */
  ofPlaceholder<T>(data: T): RemoteDataSuccess<T> {
    return {
      status: "success",
      data,
      isFetching: false,
      isPlaceholderData: true,
    };
  },
  /**
   * If data is success with placeholder, it will be converted to pending.
   * @param data
   */
  unveilPlaceholder<T>(data: RemoteData<T>): RemoteData<T> {
    if (rd.isPlaceholderData(data)) {
      return rd.ofPending();
    }
    return data;
  },
  fromMaybe: <T extends Maybe<unknown>>(
    data: T,
    error: Error | (() => Error) = () =>
      new Error("Expected value to be present"),
  ) => {
    if (maybe.isPresent(data)) {
      return rd.of(data);
    }
    return rd.ofError(typeof error === "function" ? error() : error);
  },
  /**
   * Widen specific RemoteData to a RemoteData
   * @param remoteData
   */
  widen<T>(remoteData: RemoteData<T>): RemoteData<T> {
    return remoteData;
  },
  ofIdle(): RemoteDataIdle {
    return { status: "idle" };
  },
  ofPending(): RemoteDataPending {
    return {
      status: "pending",
      isFetching: true,
    };
  },
  ofError(error: Error): RemoteDataError {
    return {
      status: "error",
      error,
      isFetching: false,
    };
  },
  isIdle<T>(remoteData: RemoteData<T>): remoteData is RemoteDataIdle {
    return remoteData.status === "idle";
  },
  isPending<T>(remoteData: RemoteData<T>): remoteData is RemoteDataPending {
    return remoteData.status === "pending";
  },
  /**
   * Either pending or idle
   * @param remoteData
   */
  isAwaiting<T>(
    remoteData: RemoteData<T>,
  ): remoteData is RemoteDataPending | RemoteDataIdle {
    return remoteData.status === "pending" || remoteData.status === "idle";
  },
  isError<T>(remoteData: RemoteData<T>): remoteData is RemoteDataError {
    return remoteData.status === "error";
  },
  isSuccess<T>(remoteData: RemoteData<T>): remoteData is RemoteDataSuccess<T> {
    return remoteData.status === "success";
  },
  isPlaceholderData<T>(
    remoteData: RemoteData<T>,
  ): remoteData is Extract<RemoteData<T>, { isPlaceholderData: true }> {
    return remoteData.status === "success" && remoteData.isPlaceholderData;
  },
  isFetching<T>(remoteData: RemoteData<T>): boolean {
    return "isFetching" in remoteData && remoteData.isFetching;
  },
  useLast<T>(remoteData: RemoteData<T>): RemoteData<T> {
    const lastNotAwaitingData =
      useLast(remoteData, !rd.isAwaiting(remoteData)) ?? remoteData;
    if (rd.isAwaiting(remoteData) && rd.isSuccess(lastNotAwaitingData)) {
      return lastNotAwaitingData;
    }
    return remoteData;
  },
  useLastWithPlaceholder: <T>(data: RemoteData<T>) => {
    const lastData = useLast(data, !rd.isAwaiting(data));
    if (lastData === undefined) {
      // initial load
      return data;
    }
    if (!rd.isSuccess(lastData)) {
      // we want only successful data to be reused
      return data;
    }
    if (lastData !== data) {
      // reloading
      return {
        ...lastData,
        isPlaceholderData: true,
      };
    }
    return lastData;
  },
  useEffect: <T>(
    data: RemoteData<T>,
    effect: (
      data: RemoteData<T>,
      prevRemoteData: RemoteData<T>,
    ) => void | (() => void),
  ) => {
    const lastRemoteDataRef = useRef(data);

    useEffect(() => {
      const cleanup = effect(data, lastRemoteDataRef.current);
      lastRemoteDataRef.current = data;
      return cleanup;
    }, [
      data.status,
      rd.tryGet(data),
      rd.tryGetError(data),
      rd.isPlaceholderData(data),
    ]);
  },
  useDataEffect: <T>(
    data: RemoteData<T>,
    effect: (data: T, prevRemoteData: RemoteData<T>) => void | (() => void),
  ) => {
    const lastRemoteDataRef = useRef(data);
    const remoteDataRef = useRef(data);
    const effectRef = useRef(effect);
    effectRef.current = effect;
    remoteDataRef.current = data;

    useEffect(() => {
      const lastRemoteData = lastRemoteDataRef.current;
      const currentRemoteData = remoteDataRef.current;
      const effect = effectRef.current;
      try {
        if (rd.isSuccess(currentRemoteData) && !rd.isSuccess(lastRemoteData)) {
          // previous data was not successful, so we call the effect
          return effect(currentRemoteData.data, lastRemoteData);
        } else if (
          rd.isSuccess(currentRemoteData) &&
          rd.isSuccess(lastRemoteData) &&
          currentRemoteData.data !== lastRemoteData.data
        ) {
          // data changed
          return effect(currentRemoteData.data, lastRemoteData);
        }
      } finally {
        lastRemoteDataRef.current = remoteDataRef.current;
      }
    });

    useEffect(() => {
      // initially if we have success, we call the effect too
      if (rd.isSuccess(data)) {
        return effect(data.data, lastRemoteDataRef.current);
      }
      return () => {};
    }, []);
  },
  useMemo: <T, V, D extends DependencyList>(
    // todo useMemo shuold accept also an array to memoize result based on all remote datas all their states
    data: RemoteData<T>,
    producer: (data: RemoteData<T>, ...deps: D) => V,
    deps: D = [] as unknown as D, // todo try with function overload in TypeScript
  ) => {
    const memoFields = [
      data.status, // we should refresh if status changes
      rd.isPlaceholderData(data), // we should refresh if placeholder data changes
      rd.isFetching(data), // we should refresh if fetching changes
      rd.tryGet(data), // we should refresh if data changes
      "error" in data ? data.error : undefined, // we should refresh if error changes
    ];
    return useMemo(() => producer(data, ...deps), [...memoFields, ...deps]);
  },
  /**
   * It ensures stable reference to RemoteData.
   * It's like rd.useMemo, but it does not map anything.
   * @param data
   */
  useStable: <T>(data: RemoteData<T>) => rd.useMemoMap(data, (data) => data),
  useMemoMap: <T, V, D extends DependencyList>(
    data: RemoteData<T>,
    mapper: (data: T, ...deps: D) => V,
    ...deps: D
  ) =>
    rd.useMemo(
      data,
      (data, ...deps) => rd.map(data, (data) => mapper(data, ...deps)),
      deps ?? [],
    ),
  combine<T extends Record<string, RemoteData<any>>>(
    obj: T,
  ): RemoteData<{
    [K in keyof T]: T[K] extends RemoteData<infer U> ? U : never;
  }> {
    const keys = Object.keys(obj) as Array<keyof T>;
    const initialState = {
      result: {} as {
        [K in keyof T]: T[K] extends RemoteData<infer U> ? U : never;
      },
      hasIdle: false,
      hasPending: false,
      hasSuccess: false,
      hasError: false,
      errors: {} as Record<string, Error>,
    };

    const finalState = keys.reduce((acc, key) => {
      const current = obj[key];
      if (!acc.hasPending && rd.isPending(current)) {
        acc.hasPending = true;
      } else if (!acc.hasIdle && rd.isIdle(current)) {
        acc.hasIdle = true;
      } else if (rd.isError(current)) {
        acc.errors[key as string] = current.error;
        acc.hasError = true;
      } else if (rd.isSuccess(current)) {
        acc.result[key] = current.data;
        acc.hasSuccess = true;
      }
      return acc;
    }, initialState);

    if (finalState.hasError) {
      const combinedError = new RemoteCombinedError(
        `${Object.values(finalState.errors).join(", ")}`,
        finalState.errors,
      );
      return rd.ofError(combinedError);
    }
    if (finalState.hasPending) {
      return rd.ofPending();
    }
    if (finalState.hasSuccess && finalState.hasIdle) {
      return rd.ofError(
        new Error("Combine does not support idle and success together"),
      );
    }
    if (finalState.hasIdle) {
      return rd.ofIdle();
    }
    return rd.of(finalState.result);
  },
  combineAll: <T extends RemoteData<any>[]>(
    remotes: T,
  ): RemoteData<T[number] extends RemoteData<infer U> ? U[] : never[]> => {
    if (remotes.length === 0) {
      return rd.of([] as T[number] extends RemoteData<infer U> ? U[] : never[]);
    }

    let hasIdle = false;
    let hasPending = false;
    let hasError = false;
    let errors: Error[] = [];
    let results: (T[number] extends RemoteData<infer U> ? U : never)[] = [];

    for (const remote of remotes) {
      if (rd.isIdle(remote)) {
        hasIdle = true;
      } else if (rd.isPending(remote)) {
        hasPending = true;
      } else if (rd.isError(remote)) {
        hasError = true;
        errors.push(remote.error);
      } else if (rd.isSuccess(remote)) {
        results.push(remote.data);
      }
    }

    if (hasError) {
      return rd.ofError(
        new RemoteCombinedError(
          `Errors in combined remotes: ${errors.map((e) => e.message).join(", ")}`,
          Object.fromEntries(errors.map((e, i) => [i, e])),
        ),
      );
    }

    if (hasIdle && results.length > 0) {
      return rd.ofError(
        new Error("Combine does not support idle and success together"),
      );
    }

    if (hasPending) {
      return rd.ofPending();
    }

    if (hasIdle) {
      return rd.ofIdle();
    }

    return rd.of(
      results as T[number] extends RemoteData<infer U> ? U[] : never[],
    );
  },
  fromMutation: mutationDataToRemoteData,
  toMutation: remoteDataToMutationData,
};

export class RemoteCombinedError extends Error {
  errors: { [key: string]: Error };

  constructor(message: string, errors: { [key: string]: Error }) {
    super(message); // Pass the message to the parent Error class constructor
    this.name = "CombinedError"; // Custom name for the error type
    this.errors = errors; // Assign the passed errors to the class property

    // Maintaining proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RemoteCombinedError);
    }
  }
}

type NoFunction<T> = T extends Function ? never : T;

const isFunction = <T>(
  value: T,
): value is T extends (...args: any[]) => any ? T : never =>
  typeof value === "function";
