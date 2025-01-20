export type RemoteDataIdle = { status: "idle" };
export type RemoteDataPending = { status: "pending"; isFetching: boolean };
export type RemoteDataError = {
  status: "error";
  error: Error;
  isFetching: boolean;
};
export type RemoteDataSuccess<T> = {
  status: "success";
  data: T;
  isPlaceholderData: boolean;
  isFetching: boolean;
};

export type RemoteData<T> =
  | RemoteDataIdle
  | RemoteDataPending
  | RemoteDataError
  | RemoteDataSuccess<T>;
/**
 * Extracts the response type from a RemoteData type
 */
export type RemoteDataResponse<T extends RemoteData<unknown>> = T extends {
  data: infer U;
}
  ? U
  : never;
/**
 * Extracts the request type from a RemoteData type
 */
export type RemoteDataToSuccess<T extends RemoteData<unknown>> = T extends {
  data: infer U;
}
  ? RemoteDataSuccess<U>
  : never;
