import { describe, it, expect } from 'vitest';
import { UI_STRINGS, getUiStrings } from '../utils/uiTranslations';

describe('UI Localization & Telugu/English Switching', () => {
  it('should return English strings by default or when en is requested', () => {
    const en = getUiStrings('en');
    expect(en.nav.home).toBe('Home');
    expect(en.nav.create).toBe('Create Care Plan');
    expect(en.home.heroTitle).toContain('Understand Your Care');
    expect(en.wizard.step1Title).toContain('Step 1');
  });

  it('should return natural Telugu strings when te is requested', () => {
    const te = getUiStrings('te');
    expect(te.nav.home).toBe('హోమ్');
    expect(te.nav.create).toBe('కేర్ ప్లాన్ తయారు చేయండి');
    expect(te.home.heroTitle).toContain('మీ చికిత్సను అర్థం చేసుకోండి');
    expect(te.wizard.step1Title).toContain('దశ 1');
  });

  it('should have complete symmetry between English and Telugu dictionary structures', () => {
    const checkSymmetry = (objEn: any, objTe: any, path = '') => {
      for (const key of Object.keys(objEn)) {
        const currentPath = path ? `${path}.${key}` : key;
        expect(objTe[key], `Missing Telugu translation for: ${currentPath}`).toBeDefined();
        if (typeof objEn[key] === 'object' && objEn[key] !== null) {
          checkSymmetry(objEn[key], objTe[key], currentPath);
        } else {
          expect(typeof objTe[key]).toBe('string');
          expect(objTe[key].length, `Empty string for: ${currentPath}`).toBeGreaterThan(0);
        }
      }
    };

    checkSymmetry(UI_STRINGS.en, UI_STRINGS.te);
  });

  it('should preserve clinical safety entities in Telugu strings', () => {
    const te = getUiStrings('te');
    // Check that abbreviations like PDF, TXT, JSON, etc. are properly represented
    expect(te.wizard.supportedFormats).toContain('PDF, TXT');
    expect(te.common.downloadJson).toContain('JSON');
    expect(te.common.downloadPdf).toContain('PDF');
  });
});
