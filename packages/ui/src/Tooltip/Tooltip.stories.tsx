import { FloatingDelayGroup } from "@floating-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import { Tooltip, TooltipPrimitive, TooltipProps } from "./Tooltip";

const meta = {
  component: Tooltip,
  args: {
    children: <button>Hover me</button>,
    popoverSlot: <TooltipPrimitive>Tooltip content</TooltipPrimitive>,
  },
} satisfies Meta<TooltipProps>;

export default meta;

export const Default = {} satisfies StoryObj<TooltipProps>;

export const InsideDelayGroup = {
  render: (args) => {
    return (
      <div className="flex flex-row gap-md">
        <FloatingDelayGroup delay={1000}>
          <Tooltip {...args} />
          <Tooltip {...args} />
          <Tooltip {...args} />
        </FloatingDelayGroup>
      </div>
    );
  },
} satisfies StoryObj<TooltipProps>;

export const DifferentPlacement = {
  args: {
    placement: "right",
  },
};

export const CustomPrimitive = {
  parameters: {
    layout: "centered",
  },
  args: {
    popoverSlot: (
      <div className="bg-red-200 border border-red-700 text-red-900 px-1 py-0.5 text-xs rounded-md shadow-md">
        Custom tooltip content
      </div>
    ),
  },
};
