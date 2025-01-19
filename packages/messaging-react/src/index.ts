import { maybe, Maybe } from "@passionware/monads";
import { useEffect, useRef, useState } from "react";

export {
  type Messaging,
  type MessageSpec,
  type MessageEventStreamPayload,
  type MessageToStreamApi,
  type MessageToPromiseApi,
  type MessageToSubscriberPayload,
  type MessageToStreamSubscriberPayload,
  type MessageEventPayload,
  type StreamResponseMessaging,
  type CollectResponseMessaging,
  type FirstResponseMessaging,
  type RequestStreamOptions,
  createRequestResponseMessaging,
  createRequestCollectMessaging,
  createRequestStreamMessaging,
  createRequestFirstResponseMessaging,
} from "@passionware/platform-js";
export type ListenerWithDispose<T> = (value: T) => () => void;
export type SubscriberFunction<T> = (listener: ListenerWithDispose<T>) => void;

/**
 * Handy hook to subscribe to an event and automatically unsubscribe when the component is unmounted
 * Also, it will automatically update the listener when the listener function is changed
 * @param subscribe
 * @param listener
 */
export function useDisposableEventSubscription<T>(
  subscribe: SubscriberFunction<T>,
  listener: ListenerWithDispose<T>,
) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;
  useEffect(() => {
    const unsubscribe = subscribe((value) => {
      return listenerRef.current(value);
    });
    return unsubscribe;
  }, [subscribe]);
}

/**
 *
 * Handy hook to subscribe to an event and keep the latest message in the state
 * Important: there is no way to set message to absent, because it is designed to be cleared only as a result of calling resolveCallback
 *
 * @example
 *
 * const message = useSubscribedMessage(subscribe);
 *
 * // somewhere in the component
 * message?.resolveCallback({ action: 'cancel' });
 * // that will indirectly set message to absent
 *
 * @param subscribe
 */
export function useSubscribedMessage<T>(subscribe: SubscriberFunction<T>) {
  const [message, setMessage] = useState<Maybe<T>>(maybe.ofAbsent());

  useDisposableEventSubscription(subscribe, (message) => {
    setMessage(message);
    return () => setMessage(maybe.ofAbsent());
  });

  return message;
}
