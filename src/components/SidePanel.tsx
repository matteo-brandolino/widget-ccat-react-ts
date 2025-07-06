import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

type SidePanelProps = {
  title: string;
  isOpen?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function SidePanel({
  title,
  isOpen,
  onClose,
  children,
}: SidePanelProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-base-100/50 transition-opacity" />
        </Transition>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto relative w-screen md:max-w-xl">
                  <div className="flex h-full flex-col gap-4 overflow-y-auto bg-base-200 text-neutral">
                    <div className="flex items-center justify-between gap-2 p-2 md:p-4">
                      <DialogTitle className="text-lg font-semibold">
                        {title}
                      </DialogTitle>
                      <button
                        className="btn btn-circle btn-error btn-sm"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="relative flex flex-1 flex-col p-2 md:p-4">
                      {children}
                    </div>
                  </div>
                </DialogPanel>
              </Transition>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
