import { rd, RemoteData } from "@passionware/monads";
import { useEffect, useState } from "react";

export type UseTestQueryParams<T> =
  | {
      delay: "infinite";
    }
  | {
      data: T;
      delay?: number;
    }
  | {
      error: Error;
      delay: number;
    };

export function getTestQueryParamsData<T>(
  params: UseTestQueryParams<T>,
): T | undefined {
  if ("data" in params) {
    return params.data;
  }
  throw new Error("No data in params");
}

export function mapTestQuery<Data, NewData>(
  params: UseTestQueryParams<Data>,
  mapper: (data: Data) => NewData,
): UseTestQueryParams<NewData> {
  if ("data" in params) {
    return {
      ...params,
      data: mapper(params.data),
    };
  }
  return params;
}

export function useTestQuery<Data>(params: UseTestQueryParams<Data>) {
  const [state, setState] = useState<RemoteData<Data>>(rd.ofPending());

  const maybeData = "data" in params ? params.data : undefined;

  useEffect(() => {
    // Immediately return if delay is 'infinite' or Infinity to simulate an endless loading state
    if (state.status !== "pending") {
      setState(rd.ofPending());
    }
    if (params.delay === "infinite" || params.delay === Infinity) {
      return;
    }
    function finalize() {
      if ("error" in params && params.error) {
        // Set error state if error is provided
        setState(rd.ofError(params.error));
      } else if ("data" in params && params.data) {
        // Set data state if data fetching is successful
        setState(rd.of(params.data));
      }
    }
    if (params.delay) {
      const timer = setTimeout(() => {
        finalize();
      }, params.delay);

      // Cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timer);
    }
    // no delay, finalize immediately
    finalize();
  }, [params.delay, maybeData]); // Dependency array to trigger effect on cha

  return state;
}
