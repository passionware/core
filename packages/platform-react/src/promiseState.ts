import { mt, MutationData, rd, RemoteData } from "@passionware/monads";
import { ensureError } from "@passionware/platform-js";
import { useEffect, useRef, useState } from "react";

function useRemoteData<Response>() {
  const [state, setState] = useState<RemoteData<Response>>(mt.ofIdle());
  const cancelTokenRef = useRef(0);

  // Optional: Clean up logic if the component unmounts before a promise resolves
  useEffect(() => {
    return () => {
      // Invalidate any promises if the component unmounts
      cancelTokenRef.current++;
    };
  }, []);

  // Helper function to handle state update with a token check
  const updateStateIfValid = (currentToken: number, updateFn: () => void) => {
    if (cancelTokenRef.current === currentToken) {
      updateFn();
    }
  };

  return {
    state,
    reset: () => {
      setState(mt.ofIdle());
      cancelTokenRef.current++;
    },
    track: async (promise: Promise<Response>) => {
      const currentToken = ++cancelTokenRef.current;

      setState(rd.ofPending());
      try {
        const data = await promise;
        updateStateIfValid(currentToken, () => setState(rd.of(data)));
      } catch (error) {
        updateStateIfValid(currentToken, () =>
          setState(rd.ofError(ensureError(error))),
        );
      }
      return promise;
    },
  };
}

function useMutation<Request, Response>(
  mutation: (request: Request) => Promise<Response>,
) {
  const [state, setState] = useState<MutationData<Request, Response>>(
    mt.ofIdle(),
  );
  const cancelTokenRef = useRef(0);

  // Optional: Clean up logic if the component unmounts before a promise resolves
  useEffect(() => {
    return () => {
      // Invalidate any promises if the component unmounts
      cancelTokenRef.current++;
    };
  }, []);

  // Helper function to handle state update with a token check
  const updateStateIfValid = (currentToken: number, updateFn: () => void) => {
    if (cancelTokenRef.current === currentToken) {
      updateFn();
    }
  };

  return {
    state,
    reset: () => {
      setState(mt.ofIdle());
      cancelTokenRef.current++;
    },
    track: async (request: Request) => {
      const currentToken = ++cancelTokenRef.current;

      setState(mt.ofPending(request));
      try {
        const promise = mutation(request);
        const data = await promise;
        updateStateIfValid(currentToken, () =>
          setState(mt.ofSuccess(request, data)),
        );
        return data;
      } catch (error) {
        updateStateIfValid(currentToken, () =>
          setState(mt.ofError(request, ensureError(error))),
        );
        throw error;
      }
    },
  };
}

function syncMutation<Request, Response>(
  onStoreUpdate: (payload: MutationData<Request, Response>) => void,
  promiseFactory: (request: Request) => Promise<Response>,
) {
  let cancelToken = 0; // Token to track active mutations

  // Helper function to update state only if the token is valid
  const updateStateIfValid = (currentToken: number, updateFn: () => void) => {
    if (cancelToken === currentToken) {
      updateFn();
    }
  };

  return {
    reset: () => {
      cancelToken++; // Invalidate any ongoing mutations
      onStoreUpdate(mt.ofIdle());
    },
    track: async (request: Request) => {
      const currentToken = ++cancelToken; // Increment token for new mutation

      onStoreUpdate(mt.ofPending(request));
      try {
        const data = await promiseFactory(request);
        updateStateIfValid(currentToken, () =>
          onStoreUpdate(mt.ofSuccess(request, data)),
        );
        return data;
      } catch (error) {
        updateStateIfValid(currentToken, () =>
          onStoreUpdate(mt.ofError(request, ensureError(error))),
        );
        throw error;
      }
    },
  };
}

function syncRemoteData<Response>(
  onStoreUpdate: (payload: RemoteData<Response>) => void,
) {
  let cancelToken = 0; // Token to track active promises

  // Helper function to update state only if the token is valid
  const updateStateIfValid = (currentToken: number, updateFn: () => void) => {
    if (cancelToken === currentToken) {
      updateFn();
    }
  };

  return {
    reset: () => {
      cancelToken++; // Invalidate any ongoing promises
      onStoreUpdate(mt.ofIdle());
    },
    track: async (promise: Promise<Response>) => {
      const currentToken = ++cancelToken; // Increment token for new promise

      onStoreUpdate(rd.ofPending());
      try {
        const data = await promise;
        updateStateIfValid(currentToken, () => onStoreUpdate(rd.of(data)));
      } catch (error) {
        updateStateIfValid(currentToken, () =>
          onStoreUpdate(rd.ofError(ensureError(error))),
        );
      }
    },
  };
}

function useMutationArray<Key, Request, Response>(
  mutation: (request: Request) => Promise<Response>,
  requestToId: (request: Request) => Key,
) {
  const [states, setStates] = useState<
    Map<Key, MutationData<Request, Response>>
  >(new Map());
  const cancelTokenRef = useRef(new Map<Key, number>());

  const updateStateIfValid = (
    key: Key,
    token: number,
    updateFn: () => void,
  ) => {
    if (cancelTokenRef.current.get(key) === token) {
      updateFn();
    }
  };

  const get = (key: Key): MutationData<Request, Response> =>
    states.get(key) ?? mt.ofIdle();

  return {
    state: states,
    get,
    reset: (key: Key) => {
      cancelTokenRef.current.set(
        key,
        (cancelTokenRef.current.get(key) ?? 0) + 1,
      );
      setStates((prev) => {
        const copy = new Map(prev);
        copy.set(key, mt.ofIdle());
        return copy;
      });
    },
    track: async (request: Request) => {
      const key = requestToId(request);
      const token = (cancelTokenRef.current.get(key) ?? 0) + 1;
      cancelTokenRef.current.set(key, token);

      setStates((prev) => {
        const copy = new Map(prev);
        copy.set(key, mt.ofPending(request));
        return copy;
      });

      try {
        const data = await mutation(request);
        updateStateIfValid(key, token, () => {
          setStates((prev) => {
            const copy = new Map(prev);
            copy.set(key, mt.ofSuccess(request, data));
            return copy;
          });
        });
        return data;
      } catch (error) {
        const err = ensureError(error);
        updateStateIfValid(key, token, () => {
          setStates((prev) => {
            const copy = new Map(prev);
            copy.set(key, mt.ofError(request, err));
            return copy;
          });
        });
        throw err;
      }
    },
  };
}

export const promiseState = {
  useRemoteData,
  useMutation,
  useMutationArray,
  syncMutation,
  syncRemoteData,
};
