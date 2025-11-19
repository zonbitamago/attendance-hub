import { render, screen } from '@testing-library/react';
import { Heading } from '@/components/ui/heading';

describe('Heading', () => {
  describe('HTML elements', () => {
    it('renders h1 element for level 1', () => {
      render(<Heading level={1}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('renders h2 element for level 2', () => {
      render(<Heading level={2}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('renders h3 element for level 3', () => {
      render(<Heading level={3}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H3');
    });

    it('renders h4 element for level 4', () => {
      render(<Heading level={4}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H4');
    });

    it('renders h5 element for level 5', () => {
      render(<Heading level={5}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 5 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H5');
    });

    it('renders h6 element for level 6', () => {
      render(<Heading level={6}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 6 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H6');
    });
  });

  describe('Size classes', () => {
    it('applies correct size for h1', () => {
      render(<Heading level={1}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-3xl');
      expect(heading).toHaveClass('sm:text-4xl');
      expect(heading).toHaveClass('font-bold');
    });

    it('applies correct size for h2', () => {
      render(<Heading level={2}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-xl');
      expect(heading).toHaveClass('sm:text-2xl');
      expect(heading).toHaveClass('font-bold');
    });

    it('applies correct size for h3', () => {
      render(<Heading level={3}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveClass('text-lg');
      expect(heading).toHaveClass('font-semibold');
    });

    it('applies correct size for h4', () => {
      render(<Heading level={4}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveClass('text-base');
      expect(heading).toHaveClass('font-semibold');
    });

    it('applies correct size for h5', () => {
      render(<Heading level={5}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 5 });
      expect(heading).toHaveClass('text-sm');
      expect(heading).toHaveClass('font-semibold');
    });

    it('applies correct size for h6', () => {
      render(<Heading level={6}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 6 });
      expect(heading).toHaveClass('text-xs');
      expect(heading).toHaveClass('font-semibold');
    });
  });

  describe('Dark mode', () => {
    it('has dark mode classes', () => {
      render(<Heading level={1}>Title</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-gray-900');
      expect(heading).toHaveClass('dark:text-gray-100');
    });
  });

  describe('Custom styling', () => {
    it('accepts className prop', () => {
      render(<Heading level={1} className="custom-class">Title</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('custom-class');
    });
  });

  describe('Children', () => {
    it('renders text children', () => {
      render(<Heading level={1}>Page Title</Heading>);
      expect(screen.getByText('Page Title')).toBeInTheDocument();
    });

    it('renders complex children', () => {
      render(
        <Heading level={2}>
          <span>Complex</span> Title
        </Heading>
      );
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText(/Title/)).toBeInTheDocument();
    });
  });
});
