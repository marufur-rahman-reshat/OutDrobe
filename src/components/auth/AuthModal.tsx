import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { UserProfile } from '../../types/outdrobe';
import { outdrobeApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onClose,
  onAuthenticated,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startWithCapsule, setStartWithCapsule] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await outdrobeApi.login(email, password);
        onAuthenticated(res.user);
      } else {
        const res = await outdrobeApi.register(displayName, email, password, startWithCapsule);
        onAuthenticated(res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.authError', 'Unable to authenticate.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1C1D1A]/45 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-heading"
    >
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-md p-7 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('auth.closeDialog', 'Close sign in dialog')}
          className="absolute top-5 right-5 w-10 h-10 rounded-lg flex items-center justify-center text-[#5C5E58] hover:text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-xs text-[#526B56] font-medium mb-1">
          {t('auth.closetAccess', 'Personal Closet Access')}
        </p>
        <h2 id="auth-modal-heading" className="text-3xl font-medium text-[#1C1D1A] tracking-tight">
          {mode === 'login'
            ? t('auth.signInTitle', 'Sign in to OutDrobe')
            : t('auth.registerTitle', 'Create your wardrobe')}
        </h2>
        <p className="mt-1.5 text-sm text-[#5C5E58]">
          {t(
            'auth.subtitle',
            'Every garment, outfit, and calendar plan is isolated to your private account.'
          )}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-1 p-1 bg-[#EFECE6] rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'login' ? 'bg-white text-[#1C1D1A] shadow-xs' : 'text-[#5C5E58] hover:text-[#1C1D1A]'
            }`}
          >
            {t('auth.signInBtn', 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#1C1D1A] shadow-xs'
                : 'text-[#5C5E58] hover:text-[#1C1D1A]'
            }`}
          >
            {t('auth.createAccountBtn', 'Create Account')}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-[#FDF2F0] border border-[#E8C5BE] text-xs text-[#9E2B1E]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#1C1D1A] mb-1.5">
                {t('auth.fullName', 'Full Name')}
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder', 'Claire Vance')}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D3C8] rounded-lg focus:outline-none focus:border-[#526B56]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#1C1D1A] mb-1.5">
              {t('auth.email', 'Email Address')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder', 'claire.vance@outdrobe.studio')}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D3C8] rounded-lg focus:outline-none focus:border-[#526B56]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1C1D1A] mb-1.5">
              {t('auth.password', 'Password')}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder', 'At least 6 characters')}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D3C8] rounded-lg focus:outline-none focus:border-[#526B56]"
            />
          </div>

          {mode === 'register' && (
            <label className="flex items-start gap-2.5 text-xs text-[#5C5E58] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={startWithCapsule}
                onChange={(e) => setStartWithCapsule(e.target.checked)}
                className="mt-0.5 accent-[#526B56]"
              />
              <span>
                {t(
                  'auth.sampleCapsule',
                  'Pre-load a 9-piece minimalist sample capsule so I can test the Outfit Builder right away'
                )}
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-[#1C1D1A] text-white hover:bg-[#31332E] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {submitting
              ? t('auth.openingWardrobe', 'Opening Wardrobe...')
              : mode === 'login'
              ? t('auth.signInBtn', 'Sign In')
              : t('auth.createAccountBtn', 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
};
