/** @vitest-environment jsdom */
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createInspectableEvent,
  createSimpleEvent,
  useSimpleEventSubscription,
} from "./index";

describe("simple-event", () => {
  describe("createSimpleEvent", () => {
    it("should allow to add listeners", () => {
      const { addListener, emit } = createSimpleEvent();
      const listener = vi.fn();
      addListener(listener);
      emit();
      expect(listener).toBeCalledTimes(1);
    });

    it("should allow to remove listeners", () => {
      const { addListener, emit } = createSimpleEvent();
      const listener = vi.fn();
      const removeListener = addListener(listener);
      removeListener();
      emit();
      expect(listener).not.toBeCalled();
    });

    it("should allow to add multiple listeners", () => {
      const { addListener, emit } = createSimpleEvent();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      addListener(listener1);
      addListener(listener2);
      emit();
      expect(listener1).toBeCalledTimes(1);
      expect(listener2).toBeCalledTimes(1);
    });

    it("should allow to remove multiple listeners", () => {
      const { addListener, emit } = createSimpleEvent();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const removeListener1 = addListener(listener1);
      const removeListener2 = addListener(listener2);
      removeListener1();
      removeListener2();
      emit();
      expect(listener1).not.toBeCalled();
      expect(listener2).not.toBeCalled();
    });

    it("should allow to emit values", () => {
      const { addListener, emit } = createSimpleEvent<number>();
      const listener = vi.fn();
      addListener(listener);
      emit(1);
      expect(listener).toBeCalledWith(1, undefined);
    });

    it("should allow to emit multiple values", () => {
      const { addListener, emit } = createSimpleEvent<number>();
      const listener = vi.fn();
      addListener(listener);
      emit(1);
      emit(2);
      expect(listener).toBeCalledWith(1, undefined);
      expect(listener).toBeCalledWith(2, undefined);
    });

    it("should allow to add listeners after emit", () => {
      const { addListener, emit } = createSimpleEvent<number>();
      emit(1);
      const listener = vi.fn();
      addListener(listener);
      expect(listener).not.toBeCalled();
    });

    it("should send metadata", () => {
      const { addListener, emit } = createSimpleEvent<number, string>();
      const listener = vi.fn();
      addListener(listener);
      emit(1, "test");
      expect(listener).toBeCalledWith(1, "test");
      listener.mockClear();
      emit(2, "test2");
      expect(listener).toBeCalledWith(2, "test2");
    });

    it("should allow to unsubscribe while emitting an event", () => {
      const { addListener, emit } = createSimpleEvent<number>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();
      addListener(listener1);
      const un2 = addListener(() => {
        listener2();
        un2();
      });
      addListener(listener3);
      emit(1);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });
  });

  describe("useSimpleEventSubscription", () => {
    it("should allow to subscribe on render", () => {
      const event = createSimpleEvent<number>();
      const listener = vi.fn();

      function Component() {
        useSimpleEventSubscription(event.addListener, listener);
        return null;
      }

      const screen = render(<Component />);

      event.emit(3);
      expect(listener).toBeCalledWith(3, undefined);

      screen.unmount();
      event.emit(9);
      expect(listener).not.toBeCalledWith(9, expect.anything());
    });

    it("should allow to subscribe on render with multiple listeners", () => {
      const event = createSimpleEvent<number>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      function Component() {
        useSimpleEventSubscription(event.addListener, listener1);
        useSimpleEventSubscription(event.addListener, listener2);
        return null;
      }

      const screen = render(<Component />);

      event.emit(3);
      expect(listener1).toBeCalledWith(3, undefined);
      expect(listener2).toBeCalledWith(3, undefined);

      screen.unmount();
      event.emit(9);
      expect(listener1).not.toBeCalledWith(9, expect.anything());
      expect(listener2).not.toBeCalledWith(9, expect.anything());
    });

    it("should allow to subscribe on render with multiple events", () => {
      const event1 = createSimpleEvent<number>();
      const event2 = createSimpleEvent<number>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      function Component() {
        useSimpleEventSubscription(event1.addListener, listener1);
        useSimpleEventSubscription(event2.addListener, listener2);
        return null;
      }

      const screen = render(<Component />);

      event1.emit(3);
      event2.emit(4);
      expect(listener1).toBeCalledWith(3, undefined);
      expect(listener2).toBeCalledWith(4, undefined);

      screen.unmount();
      event1.emit(9);
      event2.emit(10);
      expect(listener1).not.toBeCalledWith(9, expect.anything());
      expect(listener2).not.toBeCalledWith(10, expect.anything());
    });

    it("should clean subscriptions on re-render", () => {
      const event = createSimpleEvent();
      const listener = vi.fn();

      function Component({ value }: { value: number }) {
        useSimpleEventSubscription(event.addListener, listener);
        return <div>{value}</div>;
      }

      const screen = render(<Component value={1} />);

      screen.rerender(<Component value={2} />);
      screen.rerender(<Component value={3} />);
      event.emit();
      expect(listener).toBeCalledTimes(1);
    });

    it("should allow to pass absent subscribe", () => {
      const listener = vi.fn();
      function Component() {
        useSimpleEventSubscription(undefined, listener);
        return null;
      }
      render(<Component />);
      expect(listener).not.toBeCalled();
    });

    it("should allow to switch into absent subscribe", () => {
      const event = createSimpleEvent<number>();
      const listener = vi.fn();
      function Component({ subscribe }: { subscribe: boolean }) {
        useSimpleEventSubscription(
          subscribe ? event.addListener : undefined,
          listener,
        );
        return null;
      }
      const screen = render(<Component subscribe={true} />);
      event.emit(0);
      expect(listener).toBeCalledWith(0, undefined);
      screen.rerender(<Component subscribe={false} />);
      listener.mockClear();
      event.emit(1);
      expect(listener).not.toBeCalled();
      screen.rerender(<Component subscribe={true} />);
      listener.mockClear();
      event.emit(2);
      expect(listener).toBeCalledWith(2, undefined);
    });
  });

  describe("inspectableEvent", () => {
    it("should allow to get listeners", () => {
      const event = createInspectableEvent<number>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      event.addListener(listener1);
      event.addListener(listener2);
      expect(event.getListeners()).toEqual([listener1, listener2]);
    });
  });
});
