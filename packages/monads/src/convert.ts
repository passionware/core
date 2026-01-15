import { MutationData } from "./mutation.types";
import { RemoteData } from "./remoteData.types";

export function remoteDataToMutationData<Response>(
  remoteData: RemoteData<Response>
): MutationData<void, Response> {
  switch (remoteData.status) {
    case "idle":
      return { status: "idle", isBlocked: false };
    case "pending":
      return { status: "pending", request: void 0 };
    case "success":
      return {
        status: "success",
        request: void 0,
        response: remoteData.data,
      };
    case "error":
      return {
        status: "error",
        request: void 0,
        error: remoteData.error,
      };
  }
}

export function mutationDataToRemoteData<Request, Response>(
  mutationData: MutationData<Request, Response>
): RemoteData<Response> {
  switch (mutationData.status) {
    case "idle":
      return { status: "idle" };
    case "pending":
      return { status: "pending", isFetching: true };
    case "success":
      return {
        status: "success",
        isFetching: false,
        isPlaceholderData: false,
        data: mutationData.response,
      };
    case "error":
      return { status: "error", isFetching: false, error: mutationData.error };
  }
}
