import { createPortal } from 'react-dom';

function DeleteConfirmModal({ isOpen, shopName, onConfirm, onClose, loading }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-gray-100 animate-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Delete Shop</h3>
            <p className="text-xs text-gray-500 font-medium">ဆိုင်မှတ်တမ်း ဖျက်ပစ်ခြင်း</p>
          </div>
        </div>

        <div className="p-4 bg-red-50/70 border border-red-100 rounded-2xl">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-bold text-gray-900">"{shopName}"</span> ဆိုင်ကို ဖျက်ပစ်ရန် သေချာပါသလား?
          </p>
          <p className="text-xs text-red-600 font-medium mt-1">
            ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>ဖျက်နေပါသည်...</span>
              </>
            ) : (
              'Confirm Delete (ဖျက်မည်)'
            )}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="py-3 px-5 btn-secondary text-sm font-semibold disabled:opacity-50"
          >
            မလုပ်တော့ပါ
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteConfirmModal;
