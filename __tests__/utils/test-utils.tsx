import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/components/ui/theme-provider';

// ThemeProviderでラップするカスタムrender関数
export function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider defaultTheme="system">
      {ui}
    </ThemeProvider>
  );
}

// matchMediaモックのセットアップ
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

// documentElementのクラスをクリア
export function clearDocumentClasses() {
  document.documentElement.classList.remove('light', 'dark');
}
