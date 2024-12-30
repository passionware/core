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
    },
    track: async (request: Request) => {
      const currentToken = ++cancelTokenRef.current;

      setState(mt.ofPending(request));
      const promise = mutation(request);
      try {
        const data = await promise;
        updateStateIfValid(currentToken, () =>
          setState(mt.ofSuccess(request, data)),
        );
      } catch (error) {
        updateStateIfValid(currentToken, () =>
          setState(mt.ofError(request, ensureError(error))),
        );
      }
      return promise;
    },
  };
}

function syncMutation<Request, Response>(
  onStoreUpdate: (payload: MutationData<Request, Response>) => void,
  promiseFactory: (request: Request) => Promise<Response>,
) {
  return {
    reset: () => {
      onStoreUpdate(mt.ofIdle());
    },
    track: async (request: Request) => {
      onStoreUpdate(mt.ofPending(request));
      try {
        const data = await promiseFactory(request);
        onStoreUpdate(mt.ofSuccess(request, data));
        return data;
      } catch (error) {
        onStoreUpdate(mt.ofError(request, ensureError(error)));
        throw error;
      }
    },
  };
}

function syncRemoteData<Response>(
  onStoreUpdate: (payload: RemoteData<Response>) => void,
) {
  return {
    reset: () => {
      onStoreUpdate(mt.ofIdle());
    },
    track: async (promise: Promise<Response>) => {
      onStoreUpdate(rd.ofPending());
      try {
        const data = await promise;
        onStoreUpdate(rd.of(data));
      } catch (error) {
        onStoreUpdate(rd.ofError(ensureError(error)));
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
