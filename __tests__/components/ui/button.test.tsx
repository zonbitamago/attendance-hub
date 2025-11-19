import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  describe('Primary variant', () => {
    it('renders with primary variant by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders with explicit primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button).toHaveClass('bg-blue-600');
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders with type button by default', () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('renders with type submit when specified', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variants', () => {
    it('renders secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-100');
      expect(button).toHaveClass('text-gray-700');
      expect(button).toHaveClass('border-gray-300');
    });

    it('renders danger variant correctly', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-50');
      expect(button).toHaveClass('text-red-600');
      expect(button).toHaveClass('border-red-200');
    });

    it('renders ghost variant correctly', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-blue-600');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1');
      expect(button).toHaveClass('text-sm');
    });

    it('renders medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('renders large size correctly', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-base');
    });
  });

  describe('Disabled state', () => {
    it('renders disabled state correctly', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Dark mode', () => {
    it('has dark mode classes for primary variant', () => {
      render(<Button variant="primary">Primary Dark</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:bg-blue-500');
      expect(button).toHaveClass('dark:hover:bg-blue-600');
    });

    it('has dark mode classes for secondary variant', () => {
      render(<Button variant="secondary">Secondary Dark</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:bg-gray-700');
      expect(button).toHaveClass('dark:text-gray-200');
    });

    it('has dark mode classes for danger variant', () => {
      render(<Button variant="danger">Danger Dark</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:bg-red-900/20');
      expect(button).toHaveClass('dark:text-red-400');
    });

    it('has dark mode classes for ghost variant', () => {
      render(<Button variant="ghost">Ghost Dark</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:text-blue-400');
      expect(button).toHaveClass('dark:hover:bg-blue-900/20');
    });
  });

  describe('Accessibility', () => {
    it('has focus ring styles', () => {
      render(<Button>Focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-blue-500');
    });

    it('accepts className prop', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });
});
