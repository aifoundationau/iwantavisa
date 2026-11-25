import React from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';

interface PostcardDialogProps {
  /** id of the postcard's headline (names the dialog). */
  titleId: string;
  testId: string;
  closeTestId: string;
  closeLabel?: string;
  onClose: () => void;
  /** The full postcard (or listing). */
  children: React.ReactNode;
}

/** The full postcard, opened from a compact grid card: Escape, the backdrop or ✕ closes it. */
export const PostcardDialog: React.FC<PostcardDialogProps> = ({
  titleId,
  testId,
  closeTestId,
  closeLabel = 'Close postcard',
  onClose,
  children,
}) => (
  <Modal titleId={titleId} onClose={onClose} maxWidthClass="max-w-2xl" testId={testId} bare>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClose}
        autoFocus
        aria-label={closeLabel}
        data-agent-id={closeTestId}
        data-testid={closeTestId}
        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-amber-500/40 shadow-lg flex items-center justify-center text-slate-800 dark:text-slate-100"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
    {children}
  </Modal>
);
