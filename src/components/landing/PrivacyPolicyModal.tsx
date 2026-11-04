import React, { useEffect } from 'react';
import { X, Shield, Lock, Database, Image, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C1D1A]/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl shadow-2xl flex flex-col text-[#1C1D1A] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E0D8] bg-[#FAF8F5]">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#526B56] font-semibold">
              OutDrobe · Privacy & Data Practices
            </span>
            <h2
              id="privacy-policy-title"
              className="font-editorial text-2xl font-semibold text-[#1C1D1A] tracking-tight"
            >
              Privacy Policy
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#73766E] hover:text-[#1C1D1A] hover:bg-[#EFECE6] transition-colors cursor-pointer"
            aria-label="Close Privacy Policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#5C5E58] leading-relaxed">
          <p className="text-xs text-[#73766E] italic">
            Last updated: 2026. This policy describes how OutDrobe handles your personal data, wardrobe records, and uploaded garment imagery based exclusively on verified system architecture.
          </p>

          {/* Section 1: Authentication */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#1C1D1A] font-semibold">
              <Lock className="w-4 h-4 text-[#526B56]" />
              <h3 className="text-sm font-sans">1. Account Registration & Authentication</h3>
            </div>
            <p>
              When creating an account, OutDrobe requests an email address and password. Authentication is processed through Supabase Auth, which generates secure session tokens. Tokens are stored locally within your browser’s localStorage to preserve your sign-in session between visits. Passwords are cryptographically hashed and never stored or accessible in plain text.
            </p>
          </div>

          {/* Section 2: Wardrobe Data */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#1C1D1A] font-semibold">
              <Database className="w-4 h-4 text-[#526B56]" />
              <h3 className="text-sm font-sans">2. Wardrobe Records & Rotation Information</h3>
            </div>
            <p>
              OutDrobe stores the wardrobe information you deliberately input, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Garment attributes (category, color, season, fabric tags, and purchase price).</li>
              <li>Outfit ensembles composed in the Outfit Builder.</li>
              <li>Calendar scheduling plans and occasion notes.</li>
              <li>Wear log entries used to calculate cost-per-wear and rotation frequency.</li>
            </ul>
          </div>

          {/* Section 3: Uploaded Images */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#1C1D1A] font-semibold">
              <Image className="w-4 h-4 text-[#526B56]" />
              <h3 className="text-sm font-sans">3. Uploaded Clothing Images</h3>
            </div>
            <p>
              When you upload clothing photos, images are processed and compressed on the client before upload. Photographs are stored in a private Supabase Storage bucket (<code className="font-mono text-xs bg-[#EFECE6] px-1 py-0.5 rounded text-[#1C1D1A]">clothing-images</code>) organized into isolated subdirectories indexed by your authenticated user ID (<code className="font-mono text-xs bg-[#EFECE6] px-1 py-0.5 rounded text-[#1C1D1A]">&lt;userId&gt;/&lt;filename&gt;</code>). Images are accessed via short-lived, time-limited signed URLs (valid for up to 24 hours).
            </p>
          </div>

          {/* Section 4: Data Isolation & RLS */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#1C1D1A] font-semibold">
              <Shield className="w-4 h-4 text-[#526B56]" />
              <h3 className="text-sm font-sans">4. Data Isolation & Access Control</h3>
            </div>
            <p>
              Database records in OutDrobe are isolated by authenticated user ID using PostgreSQL Row Level Security (RLS) policies. Only the authenticated user associated with a specific user ID can view, insert, modify, or delete their garments, outfits, calendar entries, and wear history. No public directory or social sharing of private user wardrobes exists.
            </p>
          </div>

          {/* Section 5: Demo Mode */}
          <div className="space-y-2">
            <h3 className="text-sm font-sans font-semibold text-[#1C1D1A]">5. Demo Mode Exploration</h3>
            <p>
              Exploring OutDrobe via the Live Demo Closet operates entirely in read-only memory using pre-populated sample data. No Supabase account is created, no cookies or tracking tokens are set, and no personal data is transmitted or retained during Demo Mode sessions.
            </p>
          </div>

          {/* Section 6: Contact & Maintainer */}
          <div className="space-y-2 pt-2 border-t border-[#E5E0D8]">
            <h3 className="text-sm font-sans font-semibold text-[#1C1D1A]">6. Project Contact & Inquiries</h3>
            <p>
              OutDrobe is maintained as an open-source project. If you have questions regarding data handling, repository code, or security considerations, please submit an inquiry or open an issue on the official GitHub repository:
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/marufur-rahman-reshat/OutDrobe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526B56] hover:text-[#435947] hover:underline"
              >
                <span>github.com/marufur-rahman-reshat/OutDrobe</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-[#73766E] pt-1">
              Note: Formal corporate entities, dedicated phone lines, or commercial tracking mechanisms are not specified for this open-source project.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E5E0D8] bg-[#FAF8F5] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[#1C1D1A] text-white hover:bg-[#31332E] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
