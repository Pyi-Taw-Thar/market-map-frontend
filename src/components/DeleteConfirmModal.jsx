import React from 'react';
import ReactDOM from 'react-dom';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white/90 border border-gray-100/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Warning Icon Banner */}
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 border border-red-100 text-red-600 mb-5 animate-pulse">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Delete Shop?</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-gray-800">"{itemName}"</span>? This action is permanent and cannot be undone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary py-3 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-bold text-sm shadow-lg shadow-red-600/10 hover:shadow-red-700/20 transition-all active:scale-95 duration-150"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteConfirmModal;
