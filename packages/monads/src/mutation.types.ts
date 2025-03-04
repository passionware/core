export type IdleMutationData = { status: "idle" };
export type PendingMutationData<Request> = {
  status: "pending";
  request: Request;
};
export type SuccessMutationData<Request, Response> = {
  status: "success";
  request: Request;
  response: Response;
};
export type ErrorMutationData<Request> = {
  status: "error";
  request: Request;
  error: Error;
};
export type MutationData<Request, Response> =
  | IdleMutationData
  | PendingMutationData<Request>
  | SuccessMutationData<Request, Response>
  | ErrorMutationData<Request>;
/**
 * Extracts the response type from a mutation data type
 */
export type MutationResponse<T extends MutationData<unknown, unknown>> =
  T extends SuccessMutationData<unknown, infer R> ? R : never;
/**
 * Extracts the request type from a mutation data type
 */
export type MutationRequest<T extends MutationData<unknown, unknown>> =
  T extends {
    request: infer R;
  }
    ? R
    : never;
/**
 * Converts a mutation data type to a success mutation data type
 */
export type MutationDataToSuccess<T extends MutationData<unknown, unknown>> =
  T extends { request: infer R; response: infer S }
    ? SuccessMutationData<R, S>
    : never;
/**
 * Converts a mutation data type to an error mutation data type
 */
export type MutationDataToError<T extends MutationData<unknown, unknown>> =
  T extends { request: infer R } ? ErrorMutationData<R> : never;
/**
 * Converts a mutation data type to a pending mutation data type
 */
export type MutationDataToPending<T extends MutationData<unknown, unknown>> =
  T extends { request: infer R } ? PendingMutationData<R> : never;

export type MutationDataToInProgress<T extends MutationData<unknown, unknown>> =
  Exclude<T, IdleMutationData>;
