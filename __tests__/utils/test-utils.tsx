import React from 'react';
import { render } from '@testing-library/react';

// カスタムrender関数（ThemeProvider不要、通常のrenderと同じ）
export function renderWithTheme(ui: React.ReactElement) {
  return render(ui);
}

// matchMediaモックのセットアップ（ダークモード削除後も残す、一部のテストで使用）
export function setupMatchMediaMock(prefersDark = false) {
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation((query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
    writable: true,
  });
}

// documentElementのクラスをクリア（ダークモード削除後は何もしない）
export function clearDocumentClasses() {
  // ダークモード削除後は何もしない（後方互換性のために残す）
}
