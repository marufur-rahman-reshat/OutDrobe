import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ARCHITECTURE_BLUEPRINT } from '../../data/architectureSpec';
import { useLanguage } from '../../context/LanguageContext';

interface BlueprintViewProps {
  isPublicPreview?: boolean;
  onBack?: () => void;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({
  isPublicPreview = false,
  onBack,
}) => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string>('all');

  const visibleSections =
    activeId === 'all'
      ? ARCHITECTURE_BLUEPRINT
      : ARCHITECTURE_BLUEPRINT.filter((s) => s.id === activeId);

  return (
    <div className={isPublicPreview ? 'max-w-6xl mx-auto px-6 py-10 space-y-8' : 'space-y-8'}>
      {isPublicPreview && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C5E58] hover:text-[#1C1D1A] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('blueprint.backToHome', 'Back to OutDrobe Home')}
        </button>
      )}

      <div className="pb-6 border-b border-[#E5E0D8]">
        <p className="text-xs font-medium text-[#526B56] mb-1">
          {t(
            'blueprint.blueprintEyebrow',
            'Full-Stack Software Architecture & Beginner Engineering Guide'
          )}
        </p>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
          {t('blueprint.blueprintTitle', 'OutDrobe System Blueprint (Tasks 01–10)')}
        </h1>
        <p className="mt-2 text-sm text-[#5C5E58] max-w-3xl leading-relaxed">
          {t(
            'blueprint.blueprintSubtitle',
            'Complete technical specification covering requirements analysis, React + Node.js + Firebase architecture, scalable folder organization, Cloud Firestore schemas, security rules, development milestones, and verification plans.'
          )}
        </p>
      </div>

      {/* Section Jump Bar */}
      <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveId('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeId === 'all'
              ? 'bg-white text-[#1C1D1A] shadow-xs'
              : 'text-[#5C5E58] hover:text-[#1C1D1A]'
          }`}
        >
          {t('blueprint.allSections', 'All 10 Sections')}
        </button>
        {ARCHITECTURE_BLUEPRINT.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveId(sec.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeId === sec.id
                ? 'bg-white text-[#1C1D1A] shadow-xs'
                : 'text-[#5C5E58] hover:text-[#1C1D1A]'
            }`}
          >
            {sec.number}. {sec.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Specification Cards */}
      <div className="space-y-6">
        {visibleSections.map((section) => (
          <section
            key={section.id}
            className="bg-white border border-[#E5E0D8] rounded-xl p-6 sm:p-8 space-y-4"
          >
            <div>
              <p className="font-mono-tabular text-xs font-medium text-[#526B56]">
                {t('blueprint.sectionPrefix', 'Section')} {section.number}
              </p>
              <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#1C1D1A] mt-0.5">
                {section.number}. {section.title}
              </h2>
              <p className="mt-2 text-sm text-[#5C5E58] leading-relaxed">{section.summary}</p>
            </div>

            <ul className="space-y-2.5 pt-2">
              {section.keyPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-[#1C1D1A] leading-relaxed flex gap-3">
                  <span className="font-mono-tabular text-xs text-[#526B56] mt-0.5 shrink-0">
                    {idx + 1}.
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {section.codeSnippet && (
              <div className="pt-3">
                <p className="text-xs font-medium text-[#73766E] mb-2">
                  {section.codeSnippet.caption}
                </p>
                <pre className="p-4 rounded-lg bg-[#1C1D1A] text-[#FAF8F5] text-xs font-mono-tabular overflow-x-auto leading-relaxed">
                  <code>{section.codeSnippet.code}</code>
                </pre>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};
