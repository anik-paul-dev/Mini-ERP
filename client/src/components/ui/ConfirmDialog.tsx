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
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse w-full gap-2">
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-brand-600 hover:bg-brand-700 focus:ring-brand-500'
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
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
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
