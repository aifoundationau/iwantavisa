import React, { useEffect } from 'react';

interface ModalProps {
  /** id of the element that names the dialog (aria-labelledby). */
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Full Tailwind class, e.g. "max-w-lg". */
  maxWidthClass?: string;
  testId?: string;
  /** No panel background or padding — for content that is already a card (a full postcard). */
  bare?: boolean;
}

/** Scrollable overlay dialog: Escape and backdrop clicks close it. */
export const Modal: React.FC<ModalProps> = ({
  titleId,
  onClose,
  children,
  maxWidthClass = 'max-w-lg',
  testId,
  bare = false,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm overflow-y-auto overscroll-contain">
      <div
        className="min-h-full flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-testid={testId}
          className={`w-full ${maxWidthClass} ${
            bare
              ? 'space-y-3'
              : 'bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-amber-500/40 space-y-4'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
