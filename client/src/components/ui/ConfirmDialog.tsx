import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmation Required" maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full mb-5 shadow-inner ${isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'}`}>
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-surface-300 mb-8 px-2">{message}</p>
        
        <div className="w-full flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2.5 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-800 sm:w-auto sm:text-sm transition-colors ${
              isDestructive 
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 focus:ring-rose-500' 
                : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus:ring-brand-500'
            }`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg border border-surface-600 bg-surface-700 px-4 py-2.5 text-base font-medium text-slate-300 shadow-sm hover:bg-surface-600 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface-800 sm:w-auto sm:text-sm transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
