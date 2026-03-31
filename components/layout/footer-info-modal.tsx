'use client';

import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, type ReactNode } from 'react';

type FooterInfoModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Centered dialog on md+; bottom sheet style on small screens. */
export default function FooterInfoModal({ open, onClose, title, children }: FooterInfoModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[100]">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px]" aria-hidden />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto" onClick={onClose}>
          <div className="flex min-h-full items-end justify-center md:items-center md:p-4 lg:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-y-full opacity-95 md:translate-y-4 md:scale-[0.98]"
              enterTo="translate-y-0 opacity-100 md:translate-y-0 md:scale-100"
              leave="ease-in duration-150"
              leaveFrom="translate-y-0 opacity-100 md:translate-y-0 md:scale-100"
              leaveTo="translate-y-full opacity-95 md:translate-y-4 md:scale-[0.98]"
            >
              <Dialog.Panel
                className="flex max-h-[min(92vh,900px)] w-full max-w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/5 md:max-w-2xl md:rounded-2xl lg:max-w-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4 md:px-6">
                  <Dialog.Title className="text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                    aria-label="Close dialog"
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6 md:py-6">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
