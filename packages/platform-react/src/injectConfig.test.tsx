/* @jest-environment jsdom */
import { render } from "@testing-library/react";
import { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { injectConfig } from "./injectConfig";

// A simple mock component to wrap
const MockComponent: ComponentType<{
  config: { configKey: string };
  value: string;
}> = ({ config, value }) => {
  return <div>{`config-${config.configKey}-value-${value}`}</div>;
};

const mockInjectLogic = (api: any) => {
  const props = api.useProps();
  return {
    configKey: `injected value from ${props.value}`,
  };
};

const mockResolveTransformer = () => (props: any) => props;

describe("injectConfig fromProps", () => {
  it("should inject dynamic config based on props", () => {
    const InjectedComponent = injectConfig(MockComponent)
      .fromProps(mockInjectLogic)
      .transformProps(mockResolveTransformer);

    const screen = render(<InjectedComponent value="test value" />);

    // Use a custom matcher to handle potential formatting issues
    expect(
      screen.getByText(
        /config-injected value from test value-value-test value/,
      ),
    ).toBeInTheDocument();
  });

  it("should correctly apply prop transformations", () => {
    const injectLogic = (api: any) => ({
      configKey: `injected value from ${api.useProps().value}`,
    });

    const resolveTransformer = () => (props: { value: string }) => ({
      value: `transformed-${props.value}`,
    });

    const InjectedComponent = injectConfig(MockComponent)
      .fromProps(injectLogic)
      .transformProps(resolveTransformer);

    const screen = render(<InjectedComponent value="test value" />);

    // Use a custom matcher to match the transformed props
    expect(
      screen.getByText(
        /config-injected value from test value-value-transformed-test value/,
      ),
    ).toBeInTheDocument();
  });
});
