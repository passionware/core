import { Meta } from '@storybook/react';
import * as icons from './icons';

const meta = {
  component: () => null,
} satisfies Meta;

export default meta;

export const Default = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {Object.entries(icons).map(([name, Icon]) => (
        <div key={name} className="flex items-center gap-2">
          <Icon />
          <code>&lt;{name} /&gt;</code>
        </div>
      ))}
    </div>
  ),
};
