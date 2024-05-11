import classNames from "classnames";
import { cloneElement, ReactElement, ReactNode } from "react";

const wrapNode = Symbol("wrapNode" + "");
const addClass = Symbol("addClass");

/**
 * Creates an element that will indicate that the default layout wapper should be skipped.
 * @example
 * <SomeSkippableLayout title="DefaultTitle"/>
 * <SomeSkippableLayout title={skipLayout(<div className="text-sm text-black p-1">Element with own layout</div>)}/>
 *
 * This allows you to use the same layout for different pages, but skip the layout for some elements.
 * Thanks to that you don't need to create a separate layout wrappers for each layout slots everytime.
 */
export function skipWrap(node: ReactNode) {
  return {
    [wrapNode]: {
      node,
      skip: true,
    },
  };
}

export function withWrapperClass(className: string, node: ReactNode) {
  return {
    [wrapNode]: {
      node,
      skip: false,
      className,
    },
  };
}

export function withoutWrapperPadding(node: ReactNode) {
  return {
    [wrapNode]: {
      node,
      skip: false,
      skipPadding: true,
    },
  };
}

export function adjustWrapper(
  node: React.ReactNode,
  options: { skipPadding?: boolean; className?: string },
) {
  return {
    [wrapNode]: {
      node,
      skip: false,
      ...options,
    },
  };
}

type SkipWrapNodeSpec = {
  node: ReactNode;
} & (
  | {
      skip: true;
    }
  | {
      skip: false;
      className?: string;
      skipPadding?: boolean;
    }
);
export type SkipWrapNode =
  | ReactNode
  | {
      [wrapNode]: SkipWrapNodeSpec;
    };

/**
 * Allows to render the element with the default layout wrapper, but ignore the layout for the element if it was wrapped with `skipNode`.
 * @example
 * function SomeSkippableLayout({ title }: { title: SkipNode}) {
 *  return (
 *   <Layout>
 *    <h1>{skipWrap(title, <div className="text-2xl text-black p-1">DefaultTitle</div>)}</h1>
 *   </Layout>
 *  );
 * }
 *
 *
 *
 */
export function wrap(
  node: SkipWrapNode,
  wrapper: ReactElement,
  options: {
    paddingClass?: string;
  } = {},
) {
  if (node && typeof node === "object") {
    if (wrapNode in node) {
      const spec = node[wrapNode];
      if (spec.skip) {
        return spec.node;
      }
      const wrapperProps: Partial<ReactElement["props"]> = {
        children: spec.node,
      };
      if (spec.className) {
        wrapperProps.className = classNames(
          wrapper.props.className,
          spec.className,
        );
      }
      if (spec.skipPadding !== true && options.paddingClass) {
        wrapperProps.className = classNames(
          wrapperProps.className,
          options.paddingClass,
        );
      }
      return cloneElement(wrapper, wrapperProps);
    }
  }
  if (!node) {
    return null;
  }
  if (!wrapper) {
    return node;
  }
  if (options.paddingClass) {
    return cloneElement(wrapper, {
      children: node,
      className: classNames(wrapper.props.className, options.paddingClass),
    });
  }
  return cloneElement(wrapper, { children: node });
}
