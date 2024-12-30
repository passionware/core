// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { cf, cfe } from "./componentFactory";

describe("cf", () => {
  describe("cf component rendering", () => {
    it("renders a div with correct text", () => {
      const Div = cf.div({ children: "Hello World" });
      render(<Div />);
      expect(screen.getByText("Hello World")).toBeDefined();
    });
  });

  describe("cf component callbacks", () => {
    it("calls onClick callback when button is clicked", () => {
      const onClickMock = vi.fn();
      const Button = cf.button({
        onClick: () => onClickMock,
        children: "Click Me",
      });
      render(<Button />);
      fireEvent.click(screen.getByText("Click Me"));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("cf component ref forwarding", () => {
    it("forwards ref to a button element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      const Button = cf.button({ children: "Click Me" });
      render(<Button ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("cf component className and style merging", () => {
    it("merges className correctly", () => {
      const Div = cf.div({
        className: "base-class",
        children: "Test Div",
      });
      render(<Div className="additional-class" />);
      const divElement = screen.getByText("Test Div");
      expect(divElement.classList.contains("base-class")).toBe(true);
      expect(divElement.classList.contains("additional-class")).toBe(true);
    });

    it("merges style correctly", () => {
      const initialStyle = { color: "red" };
      const additionalStyle = { backgroundColor: "blue" };

      const Div = cf.div({
        style: initialStyle,
        children: "Test Div",
      });
      render(<Div style={additionalStyle} />);
      const divElement = screen.getByText("Test Div");

      expect(divElement.style.color).toBe("red");
      expect(divElement.style.backgroundColor).toBe("blue");
    });

    it("resolves children using a function without merging", () => {
      // Define a function that dynamically sets children

      // Create a div component with children prop as a function
      const Div = cf.div({
        children: (props) => <>before: {props.children}</>,
      });

      // Render the Div component with additional static children
      render(<Div>Static Content</Div>);

      // Assert that only dynamic content is rendered, not merged with static content
      expect(screen.queryByText("before: Static Content")).toBeInTheDocument();
    });

    // only tests typescript
    it.skip("makes props optional", () => {
      interface Props {
        required: string;
        optional?: string;
      }
      function BaseComponent(_props: Props) {
        return <div />;
      }

      const ComponentWithRequired = cfe(BaseComponent, {
        required: "required",
      });

      const ComponentWithoutRequired = cfe(BaseComponent, {
        optional: "optional",
      });

      // @ts-expect-error required prop is missing
      const test1 = <ComponentWithRequired optional="value" />;
      // @ts-expect-error required prop is missing
      const test2 = <ComponentWithoutRequired optional="value" />;
    });
  });

  describe("cfe component prop exclusion", () => {
    it("excludes specified props from being passed to the element", () => {
      const ExcludedPropDiv = cfe(
        "div",
        {
          className: "test-class",
          children: "Test Content",
        },
        ["customProp"],
      );

      render(<ExcludedPropDiv customProp="should not be passed" />);
      const divElement = screen.getByText("Test Content");

      // Test that the customProp is not present on the DOM element
      expect(divElement).not.toHaveAttribute("customProp");
    });

    it("passes non-excluded props to the element", () => {
      const NonExcludedPropDiv = cfe(
        "div",
        {
          className: ({ variant }) => `test-class-${variant}`,
          children: "Test Content",
        },
        ["variant"],
      ); // 'passedProp' is not in the excluded list

      render(<NonExcludedPropDiv variant="solid" data-id="123" />);
      const divElement = screen.getByText("Test Content");

      // Test that the passedProp is present on the DOM element
      expect(divElement.attributes.getNamedItem("data-id")?.value).toEqual(
        "123",
      );
      expect(
        divElement.attributes.getNamedItem("variant")?.value,
      ).toBeUndefined();
    });
  });
});
