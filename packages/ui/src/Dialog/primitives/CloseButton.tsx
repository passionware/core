import { cfe } from "@passionware/component-factory";
import { XMarkIcon } from "@heroicons/react/24/outline/index";
import { Button } from "@passionware/ui/button";

export const CloseButton = cfe(Button, {
  colorVariant: "secondary",
  styleVariant: "ghost",
  children: <XMarkIcon />,
});
