// @jest-environment jsdom
import { render } from "@testing-library/react";
import assert from "node:assert";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { adjustWrapper, skipWrap, withWrapperClass, wrap } from "./skipWrap";

describe("wrap", () => {
  it("should return null if no node is provided", () => {
    const result = wrap(null, <div />);
    expect(result).toBeNull();
  });

  it("does wrap a node when a wrapper is provided", () => {
    const node = <span>Test</span>;
    const result = wrap(node, <div id="bear" />);
    expect(result).toEqual(
      <div id="bear">
        <span>Test</span>
      </div>,
    );
  });

  it("does not wrap a node marked with skipWrap", () => {
    const node = skipWrap(<span>Test</span>);
    const result = wrap(node, <div />);
    expect(result).toEqual(<span>Test</span>);
  });

  it("should return the node itself if it is marked to skip", () => {
    const testNode = <div>Test Content</div>;
    const skippedNode = skipWrap(testNode);
    const result = wrap(skippedNode, <section />);
    expect(result).toEqual(testNode);
  });

  it("should wrap the node with the given wrapper if not marked to skip", () => {
    const testNode = <span>Test Content</span>;
    const wrapper = <div className="wrapper" />;
    const result = wrap(testNode, wrapper);
    expect(result).toEqual(
      <div className="wrapper">
        <span>Test Content</span>
      </div>,
    );
  });

  it("should clone the wrapper element and pass the node as children", () => {
    const testNode = <span>Test Content</span>;
    const wrapper = <div className="wrapper" />;
    const result = wrap(testNode, wrapper);

    // Use @testing-library/react to render and test the output
    const { container } = render(result);
    const wrapperElement = container.querySelector(".wrapper");
    assert.ok(wrapperElement);
    expect(wrapperElement.textContent).toBe("Test Content");
  });

  it("adds a class to the wrapped node", () => {
    const testNode = <div>Test Content</div>;
    const className = "additional-class";
    const wrappedNode = withWrapperClass(className, testNode);
    const wrapper = <section className="original-class" />;
    const result = wrap(wrappedNode, wrapper);

    const { container } = render(result);
    const element = container.firstChild;
    expect(element).toHaveClass("original-class", "additional-class");
    expect(container.outerHTML).toBe(
      '<div><section class="original-class additional-class"><div>Test Content</div></section></div>',
    );
  });

  it("renders padding when not skipped", () => {
    const testNode = "Test Content";
    const { container } = render(
      wrap(testNode, <div />, { paddingClass: "p-4" }),
    );
    expect(container.firstChild).toHaveClass("p-4");
  });

  it("skips padding when skipped", () => {
    const testNode = adjustWrapper("Test Content", { skipPadding: true });
    const { container } = render(
      wrap(testNode, <div />, { paddingClass: "p-4" }),
    );
    expect(container.firstChild).not.toHaveClass("p-4");
  });
});
