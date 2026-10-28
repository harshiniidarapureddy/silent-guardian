import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, X, KeyRound, Lock, Info } from 'lucide-react';
import { api } from '../../lib/api';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionTitle: string;
  actionDescription: string;
  targetEntity: string;
  onSuccess: () => Promise<void> | void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  actionTitle,
  actionDescription,
  targetEntity,
  onSuccess,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setError(null);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric input
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const nextIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const fullCode = digits.join('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the administrative authenticator code.');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      // Verify code against API
      await api.post('/admin/verify-2fa', {
        code: fullCode,
        action: actionTitle,
        target: targetEntity,
        details: actionDescription,
      });

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify 2FA code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="two-factor-title"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-300 font-semibold">
                  Privileged Security Gateway
                </span>
              </div>
              <h3 id="two-factor-title" className="text-base font-bold text-white">
                Admin 2FA Authorization
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Details Box */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>High-Impact Action Requiring Dual-Signature:</span>
            </div>
            <div className="text-xs font-medium text-gray-800 pl-6">
              <strong className="text-gray-900">{actionTitle}</strong> — {targetEntity}
            </div>
            <p className="text-[11px] text-gray-600 pl-6 leading-relaxed">
              {actionDescription}
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 6 Digit Input */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Enter 6-Digit Authenticator Token (TOTP)
              </label>
              <div className="flex items-center justify-between gap-2">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      digit
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900 focus:ring-indigo-500'
                        : 'border-gray-200 bg-gray-50/50 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Authenticator hint for demo testing */}
            <div className="flex items-start gap-2 p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-800">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span>Admin Hardware Token / Authenticator Key: </span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = ['8', '2', '9', '4', '1', '0'];
                    setDigits(sample);
                    setError(null);
                  }}
                  className="font-mono font-bold underline text-blue-900 hover:text-blue-700"
                >
                  829410
                </button>
                <span className="text-gray-500 ml-1">(click to auto-paste for rapid verification)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={fullCode.length !== 6 || isVerifying}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                {isVerifying ? 'Authorizing & Signing...' : 'Authorize Action'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
