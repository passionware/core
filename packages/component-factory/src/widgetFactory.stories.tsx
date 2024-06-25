import { rd, RemoteData } from "@passionware/monads";
import { testQuery } from "@passionware/platform-storybook";
import { Meta, StoryObj } from "@storybook/react";
import { clsx } from "clsx";
import { useMemo } from "react";
import { createWidgetFactory } from "./widgeFactory";

interface Order {
  id: string;
  name: string;
  status: "paid" | "unpaid" | "pending" | "expired";
  date: string;
  account: string;
  amount: number;
  currency: string;
}

type WidgetOwnProps = {
  className?: string;
};

type WidgetInjectableProps = {
  userId: string;
  shouldFail: boolean;
  can: boolean;
};

type WidgetConfig = {
  useProduct: (paymentId: string) => RemoteData<Order>;
  useCan: (action: string, resource: string) => boolean;
};

const createPaymentWidget = createWidgetFactory<WidgetConfig, WidgetOwnProps>(
  (config) => {
    return function PaymentWidget(props) {
      const { className, ...rest } = props;
      const payment = config.useProduct("1");
      const can = config.useCan("read", "order");
      return (
        <div
          {...rest}
          className={clsx("bg-white shadow-md rounded-lg p-6", className)}
        >
          {rd
            .journey(payment)
            .wait(
              <div className="text-center text-lg text-gray-500">
                Loading...
              </div>,
            )
            .catch((e) => (
              <div className="text-red-600 text-center p-4">
                Error: {e.message}
              </div>
            ))
            .done((p) => (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">{p.name}</h1>
                <p className="text-gray-600">Account: {p.account}</p>
                <p className="text-gray-600">Date: {p.date}</p>
                <p className="text-gray-600">Amount: {p.amount}</p>
                <p className="text-gray-600">Currency: {p.currency}</p>
                <p
                  className={`text-${p.status === "paid" ? "green" : "red"}-600`}
                >
                  Status: {p.status}
                </p>
              </div>
            ))}
          <div className="mt-4 text-lg">
            Can:{" "}
            {can ? (
              <span className="text-green-600">yes</span>
            ) : (
              <span className="text-red-600">no</span>
            )}
          </div>
        </div>
      );
    };
  },
);

const MockPaymentWidget = createPaymentWidget<WidgetInjectableProps>({
  useProduct: (productId, { userId, shouldFail }) =>
    testQuery.useData(
      testQuery.of(
        useMemo(
          () =>
            shouldFail
              ? rd.ofError(new Error("Failed to fetch product"))
              : rd.of<Order>({
                  id: productId,
                  name: `Product from user ${userId} with id ${productId}`,
                  status: "paid",
                  date: new Date().toDateString(),
                  account: "Account from " + userId,
                  amount: 100,
                  currency: "EUR",
                }),
          [shouldFail, userId, productId],
        ),
        1000,
      ),
    ),
  useCan: (action, resource, { can }) => can,
}).withIsolatedProps(["userId", "can", "shouldFail"]);

const meta = {
  component: MockPaymentWidget,
  args: {
    userId: "1",
    shouldFail: false,
    can: true,
  },
} satisfies Meta<typeof MockPaymentWidget>;

export default meta;

type Story = StoryObj<typeof MockPaymentWidget>;

export const Default = {} satisfies Story;

export const Failing = {
  args: {
    shouldFail: true,
  },
} satisfies Story;

export const AnotherUser = {
  args: {
    userId: "2",
  },
} satisfies Story;

export const WithCannot = {
  args: {
    ...AnotherUser.args,
    can: false,
  },
} satisfies Story;

export const WithSomeClassNames = {
  args: {
    ...WithCannot.args,
    className: "!bg-violet-50 !shadow-none !border !border-purple-500",
  },
} satisfies Story;
