import { mt, MutationData, rd, RemoteData } from "@passionware/monads";
import { ensureError } from "@passionware/platform-js";
import { useEffect, useRef, useState } from "react";

function useRemoteDataState<Response>() {
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

function useMutationState<Request, Response>(
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

export const promiseState = {
  useRemoteData: useRemoteDataState,
  useMutation: useMutationState,
};
