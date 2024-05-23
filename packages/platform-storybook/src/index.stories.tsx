import { rd, RemoteData } from "@passionware/monads";
import { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState, useMemo } from "react";
import { TestQuery, testQuery } from "./useTestQuery";

const cycleData = ["a", "b", new Error("error c"), "d", "e"];
const cycleDuration = 2000;

function Renderer(props: { data: RemoteData<string> }) {
  return rd
    .fullJourney(props.data)
    .initially("idle")
    .wait("waiting")
    .catch((e) => `Error: ${e.message}`)
    .done((d) => `Data: ${d}`);
}

function TestComponent(props: { query: TestQuery<string> }) {
  const data = testQuery.useData(props.query);
  return <Renderer data={data} />;
}

const meta = {
  component: TestComponent,
} satisfies Meta<typeof TestComponent>;

export default meta;

type Story = StoryObj<typeof TestComponent>;
export const Idle = {
  args: {
    query: testQuery.of(rd.ofIdle()),
  },
} satisfies Story;

export const Pending = {
  args: {
    query: testQuery.of(rd.ofPending()),
  },
} satisfies Story;

export const WithError = {
  args: {
    query: testQuery.of(rd.ofError(new Error("test error"))),
  },
} satisfies Story;
export const WithErrorAndDelay = {
  args: {
    query: testQuery.of(rd.ofError(new Error("test error")), 500),
  },
} satisfies Story;

export const WithData = {
  args: {
    query: testQuery.of(rd.of("test data")),
  },
} satisfies Story;

export const WithDataAndDelay = {
  args: {
    query: testQuery.of(rd.of("test data"), 500),
  },
} satisfies Story;

export const WithDataChanging = {
  render: () => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((index + 1) % cycleData.length);
      }, cycleDuration);
      return () => clearInterval(interval);
    }, [index]);

    const sourceData = cycleData[index];
    const source = useMemo(
      () =>
        sourceData instanceof Error
          ? rd.ofError(sourceData)
          : rd.of(sourceData),
      [index],
    );
    const data = testQuery.useData(testQuery.of(source, 500));

    return <Renderer data={data} />;
  },
};
