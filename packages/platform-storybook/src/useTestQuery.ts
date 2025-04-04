import { rd, RemoteData } from "@passionware/monads";
import { delay } from "@passionware/platform-js";
import { isEqual } from "lodash";
import { useEffect, useState, type DependencyList, useRef } from "react";

export type TestQuery<T> = {
  remoteData: RemoteData<T>;
  delay: number;
};

function getInitialState<T>(query: TestQuery<T>) {
  if (rd.isIdle(query.remoteData)) {
    return rd.ofIdle();
  }
  if (rd.isPending(query.remoteData)) {
    return rd.ofPending();
  }
  // error or data - let's honour the delay 0 or more
  if (query.delay === 0) {
    return query.remoteData;
  }
  return rd.ofPending();
}

export const testQuery = {
  of: <T>(remoteData: RemoteData<T>, delay: number = 0): TestQuery<T> => ({
    remoteData,
    delay,
  }),
  useData: <T>(query_: TestQuery<T>) => {
    const queryRef = useRef(query_);
    if (!isEqual(queryRef.current, query_)) {
      queryRef.current = query_;
    }
    const query = queryRef.current;

    const [state, setState] = useState<RemoteData<T>>(() =>
      getInitialState(query),
    );
    const queryStatus = query.remoteData.status;
    const maybeData = rd.tryGet(query.remoteData);
    const maybeError = rd.tryGetError(query.remoteData);
    useEffect(() => {
      setState(getInitialState(query));
      if (query.delay > 0) {
        const timer = setTimeout(() => {
          setState(query.remoteData);
        }, query.delay);
        return () => clearTimeout(timer);
      }
    }, [queryStatus, maybeData, maybeError, query.delay]);

    return state;
  },
  asPromise: async <T>(query: TestQuery<T>): Promise<T> => {
    await delay(query.delay);
    if (rd.isSuccess(query.remoteData)) {
      return query.remoteData.data;
    }
    if (rd.isError(query.remoteData)) {
      throw query.remoteData.error;
    }
    return new Promise(() => void 0);
  },
  useMappedData: <T, V, D extends DependencyList>(
    query: TestQuery<T>,
    producer: (data: T, ...deps: D) => V,
    deps: D,
  ) =>
    testQuery.useData(
      testQuery.of(
        rd.useMemo(
          query.remoteData,
          (remoteData, ...deps) =>
            rd.map(remoteData, (data) => producer(data, ...deps)),
          deps,
        ),
        query.delay,
      ),
    ),
};
