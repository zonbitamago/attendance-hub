import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeProvider } from '@/components/ui/theme-provider';

describe('ThemeToggle', () => {
  // モック localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      clear: () => {
        store = {};
      },
    };
  })();

  // モック matchMedia
  const matchMediaMock = (matches: boolean) =>
    jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();

    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock(false),
      writable: true,
    });

    document.documentElement.classList.remove('light', 'dark');
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider defaultTheme="system">
        {ui}
      </ThemeProvider>
    );
  };

  it('renders three theme buttons', () => {
    renderWithProvider(<ThemeToggle />);

    expect(screen.getByTitle('ライトモード')).toBeInTheDocument();
    expect(screen.getByTitle('ダークモード')).toBeInTheDocument();
    expect(screen.getByTitle('システム設定')).toBeInTheDocument();
  });

  it('has correct aria-labels for accessibility', () => {
    renderWithProvider(<ThemeToggle />);

    expect(screen.getByLabelText('ライトモードに切り替え')).toBeInTheDocument();
    expect(screen.getByLabelText('ダークモードに切り替え')).toBeInTheDocument();
    expect(screen.getByLabelText('システム設定に従う')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithProvider(<ThemeToggle className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('changes to light theme when light button is clicked', () => {
    renderWithProvider(<ThemeToggle />);

    fireEvent.click(screen.getByTitle('ライトモード'));

    expect(localStorageMock.setItem).toHaveBeenCalledWith('attendance-hub-theme', 'light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('changes to dark theme when dark button is clicked', () => {
    renderWithProvider(<ThemeToggle />);

    fireEvent.click(screen.getByTitle('ダークモード'));

    expect(localStorageMock.setItem).toHaveBeenCalledWith('attendance-hub-theme', 'dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('changes to system theme when system button is clicked', () => {
    renderWithProvider(<ThemeToggle />);

    // まずダークに変更
    fireEvent.click(screen.getByTitle('ダークモード'));
    // システムに戻す
    fireEvent.click(screen.getByTitle('システム設定'));

    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('attendance-hub-theme', 'system');
  });

  it('highlights the active theme button', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>
    );

    const darkButton = screen.getByTitle('ダークモード');
    expect(darkButton).toHaveClass('bg-blue-100');
  });

  it('renders SVG icons', () => {
    const { container } = renderWithProvider(<ThemeToggle />);

    const svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(3);
  });
});
