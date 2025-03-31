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

export const promiseState = {
  useRemoteData,
  useMutation,
  syncMutation,
  syncRemoteData,
};
