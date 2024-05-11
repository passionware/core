import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Meta, StoryObj } from "@storybook/react";
import { Button } from "@passionware/ui/button";
import { DialogClose } from "./compound/DialogClose";
import { DialogDescription } from "./compound/DialogDescription";
import { DialogHeading } from "./compound/DialogHeading";
import { DialogTrigger } from "./compound/DialogTrigger";
import { Dialog, DialogProps } from "./Dialog";
import { DialogContent } from "./compound/DialogContent";
import { CloseButton } from "./primitives/CloseButton";
import { ConfirmationDialogLayout } from "./primitives/ConfirmationDialogLayout";
import { FormDialogLayout } from "./primitives/FormDialogLayout";

const meta = {
  component: Dialog,
  args: {
    children: (
      <>
        <DialogTrigger>
          <Button colorVariant="warning">Check this out</Button>
        </DialogTrigger>
        <DialogContent>
          <ConfirmationDialogLayout
            closeSlot={
              <DialogClose>
                <CloseButton />
              </DialogClose>
            }
            iconSlot={<ExclamationTriangleIcon className="text-red-500" />}
            titleSlot={
              <DialogHeading>
                Are you sure you want to delete this role?
              </DialogHeading>
            }
            descriptionSlot={
              <DialogDescription>
                <div>
                  <div>
                    You will no longer be able to assign this role to any team
                    members.
                  </div>
                  <div className="font-semibold mt-4">
                    This cannot be undone.
                  </div>
                </div>
              </DialogDescription>
            }
            buttonsSlot={
              <>
                <DialogClose>
                  <Button colorVariant="secondary" autoFocus>
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose>
                  <Button colorVariant="danger" leftSlot={<TrashIcon />}>
                    Archive User
                  </Button>
                </DialogClose>
              </>
            }
          />
        </DialogContent>
      </>
    ),
  },
} satisfies Meta<DialogProps>;

export default meta;

export const Default: StoryObj<DialogProps> = {};

export const Controlled: StoryObj<DialogProps> = {
  args: {
    open: true,
    children: (
      <DialogContent>
        <ConfirmationDialogLayout
          closeSlot={
            <DialogClose>
              <CloseButton />
            </DialogClose>
          }
          iconSlot={<InformationCircleIcon className="text-sky-500" />}
          titleSlot={
            <DialogHeading>
              Cannot delete role if team members are assigned
            </DialogHeading>
          }
          descriptionSlot={
            <DialogDescription>
              <div>
                Reassign existing role members to another role to be able to
                delete this.
              </div>
            </DialogDescription>
          }
          buttonsSlot={
            <Button colorVariant="secondary" autoFocus>
              View members
            </Button>
          }
        />
      </DialogContent>
    ),
  },
  argTypes: {
    onOpenChange: { action: "onOpenChange" },
  },
};

export const FormLayout: StoryObj<DialogProps> = {
  ...Controlled.args,
  args: {
    ...Controlled.args,
    children: (
      <DialogContent>
        <FormDialogLayout
          closeSlot={
            <DialogClose>
              <CloseButton />
            </DialogClose>
          }
          navSlot={null}
          titleSlot={<DialogHeading>Invite user</DialogHeading>}
          contentSlot={
            <DialogDescription>
              <div>Form goes here...</div>
            </DialogDescription>
          }
          buttonsSlot={
            <>
              <DialogClose>
                <Button colorVariant="secondary" autoFocus>
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose>
                <Button colorVariant="primary">Save</Button>
              </DialogClose>
            </>
          }
        />
      </DialogContent>
    ),
  },
};

export const FormLayoutOverflow: StoryObj<DialogProps> = {
  ...FormLayout.args,
  args: {
    ...FormLayout.args,
    children: (
      <DialogContent>
        <FormDialogLayout
          closeSlot={
            <DialogClose>
              <CloseButton />
            </DialogClose>
          }
          titleSlot={<DialogHeading>Invite user</DialogHeading>}
          contentSlot={
            <DialogDescription>
              <div className="bg-gradient-to-b from-cyan-600 to-purple-700 text-white h-[140vh]">
                This content is overflowing
              </div>
            </DialogDescription>
          }
          buttonsSlot={
            <>
              <DialogClose>
                <Button colorVariant="secondary" autoFocus>
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose>
                <Button colorVariant="primary">Save</Button>
              </DialogClose>
            </>
          }
        />
      </DialogContent>
    ),
  },
};
