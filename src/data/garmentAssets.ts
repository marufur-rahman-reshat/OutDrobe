import heroWardrobeImg from '../assets/images/hero_minimalist_wardrobe_1793337999049.jpg';
import sageBlazerImg from '../assets/images/garment_sage_blazer_1793338000869.jpg';
import ivoryKnitImg from '../assets/images/garment_ivory_knit_1793338002653.jpg';
import charcoalTrousersImg from '../assets/images/garment_charcoal_trousers_1793338002929.jpg';
import camelTrenchImg from '../assets/images/garment_camel_trench_1793338004744.jpg';
import leatherLoafersImg from '../assets/images/garment_leather_loafers_1793338004498.jpg';

export const HERO_WARDROBE_IMAGE = heroWardrobeImg;

export interface PresetAssetOption {
  key: string;
  label: string;
  category: string;
  src?: string;
  svgIllustration?: 'poplin_shirt' | 'ecru_denim' | 'leather_tote' | 'moss_tee';
  backdropHex: string;
}

export const GARMENT_PRESET_ASSETS: Record<string, PresetAssetOption> = {
  sage_blazer: {
    key: 'sage_blazer',
    label: 'Sage Tailored Blazer',
    category: 'Outerwear',
    src: sageBlazerImg,
    backdropHex: '#EFECE6',
  },
  ivory_knit: {
    key: 'ivory_knit',
    label: 'Ivory Merino Crewneck',
    category: 'Tops',
    src: ivoryKnitImg,
    backdropHex: '#EFECE6',
  },
  charcoal_trousers: {
    key: 'charcoal_trousers',
    label: 'Charcoal Pleated Trousers',
    category: 'Bottoms',
    src: charcoalTrousersImg,
    backdropHex: '#EFECE6',
  },
  camel_trench: {
    key: 'camel_trench',
    label: 'Warm Oat Trench Coat',
    category: 'Outerwear',
    src: camelTrenchImg,
    backdropHex: '#F2EFE9',
  },
  leather_loafers: {
    key: 'leather_loafers',
    label: 'Espresso Penny Loafers',
    category: 'Footwear',
    src: leatherLoafersImg,
    backdropHex: '#EAE5DC',
  },
  poplin_shirt: {
    key: 'poplin_shirt',
    label: 'Chalk Poplin Shirt',
    category: 'Tops',
    svgIllustration: 'poplin_shirt',
    backdropHex: '#F0EDE6',
  },
  ecru_denim: {
    key: 'ecru_denim',
    label: 'Natural Ecru Straight Denim',
    category: 'Bottoms',
    svgIllustration: 'ecru_denim',
    backdropHex: '#EDE9DF',
  },
  leather_tote: {
    key: 'leather_tote',
    label: 'Architectural Leather Tote',
    category: 'Accessories',
    svgIllustration: 'leather_tote',
    backdropHex: '#ECE9E1',
  },
  moss_tee: {
    key: 'moss_tee',
    label: 'Muted Moss Mock-Neck Tee',
    category: 'Tops',
    svgIllustration: 'moss_tee',
    backdropHex: '#EBF0EC',
  },
};

export const COLOR_SWATCH_OPTIONS = [
  { label: 'Soft Sage', hex: '#7A8F7C' },
  { label: 'Muted Moss', hex: '#596A5B' },
  { label: 'Warm Ivory', hex: '#EFECE4' },
  { label: 'Chalk White', hex: '#F7F6F2' },
  { label: 'Natural Ecru', hex: '#E5DEC9' },
  { label: 'Warm Oat', hex: '#CBB799' },
  { label: 'Olive Umber', hex: '#4A4F41' },
  { label: 'Espresso', hex: '#3B2820' },
  { label: 'Deep Charcoal', hex: '#2C2E2B' },
  { label: 'Midnight Navy', hex: '#232B38' },
];
