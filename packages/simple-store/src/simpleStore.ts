import { Absent, Maybe } from "@passionware/monads";
import {
  createSimpleEvent,
  SimpleEventEmitter,
  SimpleEventSubscribe,
  SimpleReadOnlyEvent,
} from "@passionware/simple-event";
import { SetStateAction, useSyncExternalStore } from "react";

export interface SimpleStore<Data, ChangeMeta = undefined> {
  addUpdateListener: SimpleEventSubscribe<Data, ChangeMeta>;
  setNewValue: SimpleEventEmitter<SetStateAction<Data>, ChangeMeta>;
  getCurrentValue: () => Data;
  toReadOnlyEvent: () => SimpleReadOnlyEvent<Data, ChangeMeta>;
  waitFor: {
    <S extends Data>(predicate: (value: Data) => value is S): Promise<S>;
    (predicate: (value: Data) => boolean): Promise<Data>;
  };
}

export type SimpleStoreReadOnly<Data, ChangeMeta = undefined> = Omit<
  SimpleStore<Data, ChangeMeta>,
  "setNewValue"
>;

export const createSimpleStore = <T, ChangeMeta = undefined>(
  initialValue: T,
): SimpleStore<T, ChangeMeta> => {
  let lastValue: T = initialValue;

  const simpleEvent = createSimpleEvent<T, ChangeMeta>();
  const emit = (value: SetStateAction<T>, metadata: ChangeMeta) => {
    const newValue =
      typeof value === "function"
        ? (value as (prevState: T) => T)(lastValue)
        : value;
    lastValue = newValue;
    simpleEvent.emit(newValue, metadata);
  };
  const waitFor: SimpleStore<T, ChangeMeta>["waitFor"] = (
    predicate: (value: T) => boolean,
  ) => {
    return new Promise<any>((resolve) => {
      const value = lastValue;
      if (predicate(value)) {
        resolve(value);
        return;
      }
      const unsubscribe = simpleEvent.addListener((value: T) => {
        if (predicate(value)) {
          unsubscribe();
          resolve(value);
        }
      });
    });
  };
  return {
    // again, casting since we can't check ChangeMeta being undefined in runtime outside emit call
    setNewValue: emit as SimpleEventEmitter<SetStateAction<T>, ChangeMeta>,
    getCurrentValue: () => lastValue,
    addUpdateListener: simpleEvent.addListener,
    toReadOnlyEvent: () => {
      const { emit, ...readOnlyEvent } = simpleEvent;
      return readOnlyEvent;
    },
    waitFor,
  };
};

const noopSubscribe = () => () => {};
const noopGetCurrentValue = () => undefined;

/**
 * Hook to use the current value of a `SimpleStore`, with conditional subscription using `useSyncExternalStore`.
 */
export function useSimpleStore<T extends Maybe<SimpleStoreReadOnly<any>>>(
  store: T,
): T extends Absent
  ? undefined
  : T extends SimpleStoreReadOnly<infer U>
    ? U
    : never {
  return useSyncExternalStore(
    store ? store.addUpdateListener : noopSubscribe, // Use no-op subscribe if signal is absent
    store ? store.getCurrentValue : noopGetCurrentValue, // Use no-op getter if signal is absent
    noopGetCurrentValue, // Server-side rendering fallback
  );
}
