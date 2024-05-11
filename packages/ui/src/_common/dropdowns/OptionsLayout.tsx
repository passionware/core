import { rd, RemoteData } from "@passionware/monads";
import { ReactNode } from "react";
import { DimmedContainer } from "./DimmedContainer";
import { SelectOptionEmpty } from "./SelectOptionEmpty";
import { SelectOptionError } from "./SelectOptionError";
import { SelectOptionLoading } from "./SelectOptionLoading";

export interface OptionsLayoutProps<T> {
  optionsState: RemoteData<T[]>;
  renderEmpty?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
  renderLoading?: () => ReactNode;
  renderOptions: (options: T[]) => ReactNode;
  dimmedContainerClassName?: string;
}

const defaultRenderers = {
  renderEmpty: () => <SelectOptionEmpty />,
  renderError: (error: Error) => <SelectOptionError message={error.message} />,
  renderLoading: () => <SelectOptionLoading />,
};

export function OptionsLayout<T>({
  optionsState,
  renderEmpty = defaultRenderers.renderEmpty,
  renderError = defaultRenderers.renderError,
  renderLoading = defaultRenderers.renderLoading,
  renderOptions,
  dimmedContainerClassName,
}: OptionsLayoutProps<T>) {
  if (rd.isAwaiting(optionsState)) return renderLoading();

  if (optionsState.status === "error")
    return (
      <DimmedContainer shouldDim={false} className={dimmedContainerClassName}>
        {renderError(optionsState.error)}
      </DimmedContainer>
    );

  return (
    <DimmedContainer
      shouldDim={optionsState.isPlaceholderData}
      className={dimmedContainerClassName}
    >
      {optionsState.data.length === 0
        ? renderEmpty()
        : renderOptions(optionsState.data)}
    </DimmedContainer>
  );
}

export interface ComplexOptionsLayoutProps<T> {
  optionsState: RemoteData<T>;
  renderError?: (error: Error) => ReactNode;
  renderLoading?: () => ReactNode;
  renderOptions: (options: T) => ReactNode;
  dimmedContainerClassName?: string;
}

/**
 * Similar to OptionsLayout, but for data that is not necessarily an simple array.
 */
export function ComplexOptionsLayout<T>({
  optionsState,
  renderError = defaultRenderers.renderError,
  renderLoading = defaultRenderers.renderLoading,
  renderOptions,
  dimmedContainerClassName,
}: ComplexOptionsLayoutProps<T>) {
  if (rd.isAwaiting(optionsState)) return renderLoading();

  if (optionsState.status === "error")
    return (
      <DimmedContainer shouldDim={false} className={dimmedContainerClassName}>
        {renderError(optionsState.error)}
      </DimmedContainer>
    );

  return (
    <DimmedContainer
      shouldDim={optionsState.isPlaceholderData}
      className={dimmedContainerClassName}
    >
      {renderOptions(optionsState.data)}
    </DimmedContainer>
  );
}
