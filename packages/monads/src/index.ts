export {
  type RemoteData,
  type RemoteDataResponse,
  type RemoteDataToSuccess,
  type RemoteDataIdle,
  type RemoteDataPending,
  type RemoteDataError,
  type RemoteDataSuccess,
} from "./remoteData.types";

export {
  rd,
  type RemoteCombinedError,
  type MappingError,
  type RemoteDataGetError,
} from "./remoteData";

export { maybe, type Maybe, type Absent, type Present } from "./maybe";

export { type Falsy, type Truthy, truthy } from "./truthy";
export {
  type MutationDataToPending,
  type MutationDataToSuccess,
  type MutationDataToError,
  type MutationData,
  type ErrorMutationData,
  type SuccessMutationData,
  type PendingMutationData,
  type MutationResponse,
  type MutationRequest,
  type IdleMutationData,
} from "./mutation.types";
export { mt } from "./mutation";
