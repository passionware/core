import { Decorator } from '@storybook/react';

export const classNameDecorator = (className: string): Decorator =>
  function Decorator(Story) {
    return <div className={className}>{Story()}</div>;
  };
