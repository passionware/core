import { useEffect } from "react";

export type SimpleEventListener<E, Metadata = undefined> = [Metadata] extends [
  undefined,
]
  ? (e: E) => void
  : (e: E, metadata: Metadata) => void;

export type SimpleEventSubscribe<E, Metadata = undefined> = (
  listener: SimpleEventListener<E, Metadata>,
) => /* unsubscribe */ () => void;

// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
export type SimpleEventEmitter<E, Metadata> = [Metadata] extends [undefined]
  ? (e: E) => void
  : (e: E, metadata: Metadata) => void;

export interface SimpleEvent<E = void, Metadata = undefined> {
  addListener: SimpleEventSubscribe<E, Metadata>;
  emit: SimpleEventEmitter<E, Metadata>;
}

export type InspectableEvent<E = void, Metadata = undefined> = SimpleEvent<
  E,
  Metadata
> & {
  getListeners: () => SimpleEventListener<E, Metadata>[];
};

export const createSimpleEvent = <
  E = void,
  Metadata = undefined,
>(): SimpleEvent<E, Metadata> => {
  const inspecableEvent = createInspectableEvent<E, Metadata>();
  return {
    addListener: inspecableEvent.addListener,
    emit: inspecableEvent.emit,
  };
};

export const createInspectableEvent = <
  E = void,
  Metadata = undefined,
>(): InspectableEvent<E, Metadata> => {
  type Listener = SimpleEventListener<E, Metadata>;
  const listeners: Listener[] = [];
  const addListener = (listener: Listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  };
  const emit = (value: E, metadata: Metadata) => {
    [...listeners].forEach((listener) => {
      listener(value, metadata);
    });
  };
  return {
    addListener,
    emit: emit as SimpleEventEmitter<E, Metadata>, // casting since we can't check Metadata being undefined in runtime outside emit call
    getListeners: () => listeners,
  };
};

export const useSimpleEventSubscription = <E, Metadata>(
  subscribe: SimpleEventSubscribe<E, Metadata>,
  listener: SimpleEventListener<E, Metadata>,
) => {
  useEffect(() => {
    const unsubscribe = subscribe(listener);
    return () => unsubscribe();
  }, [subscribe, listener]);
};

/**
 * Convenient way to create a mechanism that can subscribe to one event emitter at a time.
 */
export const createSwitchingSubscriber = () => {
  let unsubscribe: (() => void) | undefined;
  return {
    switchTo: <E, Metadata>(
      subscribe: SimpleEventSubscribe<E, Metadata>,
      listener: SimpleEventListener<E, Metadata>,
    ) => {
      unsubscribe?.();
      unsubscribe = subscribe(listener);
    },
    unsubscribe: () => {
      unsubscribe?.();
      unsubscribe = undefined;
    },
  };
};
