import { useState, ReactNode } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";

type ModalBoxProps = {
  isOpen?: boolean;
  closable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
};

export default function ModalBox({
  isOpen = false,
  closable = true,
  onClose,
  children,
}: ModalBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const closeModal = () => {
    if (closable) {
      setIsModalOpen(false);
      onClose?.();
    }
  };

  return (
    <Transition show={isModalOpen} as={Fragment} appear>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition
          show={isModalOpen}
          as={Fragment}
          enter="duration-300 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition
              show={isModalOpen}
              as={Fragment}
              enter="duration-300 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-fit max-w-lg overflow-hidden rounded-lg bg-base-100 p-4 shadow-xl transition-all">
                {children}
              </DialogPanel>
            </Transition>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
