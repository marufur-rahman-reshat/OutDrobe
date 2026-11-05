import React, { useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { HERO_WARDROBE_IMAGE, GARMENT_PRESET_ASSETS } from '../../data/garmentAssets';
import { GarmentImage } from '../common/GarmentImage';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { ThemeSelector } from '../common/ThemeSelector';
import { LanguageSelector } from '../common/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenWardrobe: () => void;
  onExploreDemoCloset: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenWardrobe,
  onExploreDemoCloset,
}) => {
  const { t } = useLanguage();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const showcaseItems = [
    {
      key: 'sage_blazer',
      name: 'Tailored Linen-Wool Blazer',
      meta: 'Outerwear · Soft Sage · $25.45 / wear',
    },
    {
      key: 'ivory_knit',
      name: 'Fine-Gauge Merino Crewneck',
      meta: 'Tops · Warm Ivory · $9.06 / wear',
    },
    {
      key: 'charcoal_trousers',
      name: 'Wide-Leg Pleated Wool Trousers',
      meta: 'Bottoms · Deep Charcoal · $10.26 / wear',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1D1A] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-6 py-4">
          <a
            href="#top"
            className="font-editorial text-2xl font-semibold tracking-tight text-[#1C1D1A] whitespace-nowrap shrink-0"
          >
            OutDrobe
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C5E58]">
            <a
              href="#workflow"
              className="hover:text-[#1C1D1A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t('landing.footerFeatures', 'Workflow')}
            </a>
            <a
              href="#capsule"
              className="hover:text-[#1C1D1A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t('landing.capsuleEyebrow', 'Capsule View')}
            </a>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="hover:text-[#1C1D1A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('common.signIn', 'Sign In')}
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSelector />
            <ThemeSelector />
            <button
              type="button"
              onClick={onOpenWardrobe}
              className="px-3.5 sm:px-4 py-2 text-xs font-medium text-white bg-[#526B56] hover:bg-[#435947] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              {t('common.openWardrobe', 'Open Wardrobe')}
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Section 1: Editorial Hero Split */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <p className="text-xs font-medium text-[#526B56] mb-3">
                {t('landing.eyebrow', 'The Pocket Wardrobe · Personal Closet Studio')}
              </p>
              <h1
                className="font-editorial font-medium text-[#1C1D1A] leading-[1.08] tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 4.2vw, 3.85rem)', textWrap: 'balance' }}
              >
                {t('landing.heroTitle', 'Dress with quiet clarity every single morning.')}
              </h1>
              <p className="mt-5 text-base text-[#5C5E58] leading-relaxed max-w-xl">
                {t(
                  'landing.heroSubtitle',
                  'Catalog the garments you already own, compose balanced multi-layer outfits, schedule your week on a calm visual calendar, and understand true cost-per-wear.'
                )}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreDemoCloset}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-[#1C1D1A] text-white hover:bg-[#31332E] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                >
                  {t('landing.exploreDemoCta', 'Explore Live Demo Closet')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 flex">
              <div className="w-full rounded-2xl overflow-hidden border border-[#E5E0D8] bg-[#EFECE6]">
                <img
                  src={HERO_WARDROBE_IMAGE}
                  alt="Minimalist oak garment rack with neutral linen shirts, soft sage wool coat, and charcoal tailored trousers in a sunlit room"
                  referrerPolicy="no-referrer"
                  className="w-full h-full min-h-[320px] lg:h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Full-width 4-column proof & workflow metric row */}
          <div className="mt-12 pt-10 border-t border-[#E5E0D8] grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
                {t('landing.metricSpeed', 'Under 60s')}
              </p>
              <p className="mt-1 text-sm text-[#5C5E58]">
                {t(
                  'landing.metricSpeedDesc',
                  'Morning outfit selection when scheduled on your weekly lookbook calendar'
                )}
              </p>
            </div>
            <div>
              <p className="font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
                {t('landing.metricPrivacy', '100% Private')}
              </p>
              <p className="mt-1 text-sm text-[#5C5E58]">
                {t(
                  'landing.metricPrivacyDesc',
                  'User-scoped data model isolating garments, photos, and wear logs by account UID'
                )}
              </p>
            </div>
            <div>
              <p className="font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
                {t('landing.metricLayers', '5 Layers')}
              </p>
              <p className="mt-1 text-sm text-[#5C5E58]">
                {t(
                  'landing.metricLayersDesc',
                  'Visual Outfit Builder supporting Outerwear, Tops, Bottoms, Footwear, and Accessories'
                )}
              </p>
            </div>
            <div>
              <p className="font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
                {t('landing.metricValue', 'Real Cost / Wear')}
              </p>
              <p className="mt-1 text-sm text-[#5C5E58]">
                {t(
                  'landing.metricValueDesc',
                  'Automatic wear-counter updates reveal your highest-value wardrobe staples'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Mechanism-to-Outcome Workflow / Features */}
        <section id="features" className="bg-[#F2EFE9] border-y border-[#E5E0D8] py-20 relative">
          <span id="workflow" className="absolute -top-16" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-[#526B56] mb-2">
                {t('landing.workflowEyebrow', 'How OutDrobe Works')}
              </p>
              <h2
                className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]"
                style={{ textWrap: 'balance' }}
              >
                {t(
                  'landing.workflowTitle',
                  'From scattered hangers to an intentional personal archive.'
                )}
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-6">
                <p className="font-mono-tabular text-xs text-[#526B56] mb-3">
                  {t('landing.workflowStep1Tag', '01. Digitize & Organize')}
                </p>
                <h3 className="font-sans text-lg font-semibold text-[#1C1D1A]">
                  {t('landing.workflowStep1Title', 'Upload clothing with clean attributes')}
                </h3>
                <p className="mt-2 text-sm text-[#5C5E58] leading-relaxed">
                  {t(
                    'landing.workflowStep1Desc',
                    'Photograph your pieces or test with studio presets. Filter effortlessly by category, season, fabric, and color harmony without digging through drawers.'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-6">
                <p className="font-mono-tabular text-xs text-[#526B56] mb-3">
                  {t('landing.workflowStep2Tag', '02. Compose & Favorite')}
                </p>
                <h3 className="font-sans text-lg font-semibold text-[#1C1D1A]">
                  {t('landing.workflowStep2Title', 'Build outfits side-by-side before dressing')}
                </h3>
                <p className="mt-2 text-sm text-[#5C5E58] leading-relaxed">
                  {t(
                    'landing.workflowStep2Desc',
                    'Pair outerwear, tops, trousers, and shoes on an editorial canvas. Save favorite combinations for campus lectures, studio reviews, or weekend travel.'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-6">
                <p className="font-mono-tabular text-xs text-[#526B56] mb-3">
                  {t('landing.workflowStep3Tag', '03. Plan & Track Rotation')}
                </p>
                <h3 className="font-sans text-lg font-semibold text-[#1C1D1A]">
                  {t('landing.workflowStep3Title', 'Schedule your calendar & uncover sleepers')}
                </h3>
                <p className="mt-2 text-sm text-[#5C5E58] leading-relaxed">
                  {t(
                    'landing.workflowStep3Desc',
                    'Assign outfits to upcoming dates, log daily wears in one click, and let smart suggestions revive unworn garments sitting at the back of your closet.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Curated Capsule Preview */}
        <section id="capsule" className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-medium text-[#526B56] mb-2">
                {t('landing.capsuleEyebrow', 'Inside the Wardrobe')}
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
                {t('landing.capsuleTitle', 'Calm, editorial garment cards')}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#526B56] hover:text-[#354938] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('landing.capsuleCta', 'Create your own closet')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {showcaseItems.map((item) => {
              const asset = GARMENT_PRESET_ASSETS[item.key];
              return (
                <div
                  key={item.key}
                  className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden flex flex-col shadow-xs"
                >
                  <div className="aspect-[3/4] w-full">
                    <GarmentImage
                      imageKey={item.key}
                      alt={item.name}
                      colorHex={asset?.backdropHex}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-sans text-base font-semibold text-[#1C1D1A]">{item.name}</h3>
                    <p className="mt-1 text-xs text-[#73766E] font-mono-tabular">{item.meta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E0D8] bg-[#FAF8F5] pt-14 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12">
            {/* Brand Section */}
            <div className="md:col-span-6 lg:col-span-6 space-y-3">
              <div className="space-y-1">
                <span className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight text-[#1C1D1A]">
                  OutDrobe
                </span>
                <p className="font-mono text-[10px] tracking-widest uppercase font-semibold text-[#526B56]">
                  {t('common.tagline', 'THE POCKET WARDROBE')}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-[#5C5E58] leading-relaxed max-w-sm">
                {t(
                  'landing.footerDescription',
                  'Your wardrobe, thoughtfully organized. Discover your style, plan your outfits, and make everyday dressing simpler.'
                )}
              </p>
            </div>

            {/* Explore Section */}
            <div className="md:col-span-3 lg:col-span-3 space-y-3">
              <h4 className="font-sans text-xs uppercase tracking-wider font-semibold text-[#1C1D1A]">
                {t('landing.footerExplore', 'Explore')}
              </h4>
              <ul className="space-y-2 text-xs text-[#5C5E58]">
                <li>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-[#526B56] transition-colors py-0.5 cursor-pointer text-left"
                  >
                    {t('landing.footerHome', 'Home')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('features') || document.getElementById('workflow');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-[#526B56] transition-colors py-0.5 cursor-pointer text-left"
                  >
                    {t('landing.footerFeatures', 'Features')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onExploreDemoCloset}
                    className="hover:text-[#526B56] transition-colors py-0.5 cursor-pointer text-left"
                  >
                    {t('landing.footerLiveDemo', 'Live Demo')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenWardrobe}
                    className="hover:text-[#526B56] transition-colors py-0.5 cursor-pointer text-left"
                  >
                    {t('landing.footerOpenWardrobe', 'Open Wardrobe')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Project Section */}
            <div className="md:col-span-3 lg:col-span-3 space-y-3">
              <h4 className="font-sans text-xs uppercase tracking-wider font-semibold text-[#1C1D1A]">
                {t('landing.footerProject', 'Project')}
              </h4>
              <ul className="space-y-2 text-xs text-[#5C5E58]">
                <li>
                  <a
                    href="https://github.com/marufur-rahman-reshat/OutDrobe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#526B56] transition-colors py-0.5"
                  >
                    <span>{t('landing.footerGithub', 'GitHub Repository')}</span>
                    <ExternalLink className="w-3 h-3 text-[#73766E]" />
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="hover:text-[#526B56] transition-colors py-0.5 cursor-pointer text-left"
                  >
                    {t('landing.footerPrivacy', 'Privacy Policy')}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Section */}
          <div className="pt-8 border-t border-[#EFECE6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#73766E]">
            <p>{t('landing.footerCopyright', '© 2026 OutDrobe. All rights reserved.')}</p>
            <p className="text-right">
              {t('landing.footerTagline', 'Designed with care for your everyday style.')}
            </p>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </div>
  );
};
