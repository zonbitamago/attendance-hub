import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  describe('Basic rendering', () => {
    it('renders with required props', () => {
      render(<Input id="test" name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'test');
      expect(input).toHaveAttribute('name', 'test');
    });

    it('renders with placeholder', () => {
      render(<Input id="test" name="test" placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('renders with value', () => {
      render(<Input id="test" name="test" value="test value" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test value');
    });

    it('handles change events', () => {
      const handleChange = jest.fn();
      render(<Input id="test" name="test" onChange={handleChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders with different types', () => {
      const { rerender } = render(<Input id="test" name="test" type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

      rerender(<Input id="test" name="test" type="password" />);
      // password type doesn't have textbox role
      expect(document.querySelector('input')).toHaveAttribute('type', 'password');
    });

    it('applies base styles', () => {
      render(<Input id="test" name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-2');
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('rounded-md');
    });
  });

  describe('Error state', () => {
    it('displays error message', () => {
      render(<Input id="test" name="test" error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('applies error styles to input', () => {
      render(<Input id="test" name="test" error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('sets aria-invalid when error exists', () => {
      render(<Input id="test" name="test" error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('connects error message with aria-describedby', () => {
      render(<Input id="test" name="test" error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-error');
      expect(screen.getByText('Error message')).toHaveAttribute('id', 'test-error');
    });

    it('does not show error styles when no error', () => {
      render(<Input id="test" name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-red-500');
      expect(input).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('Accessibility', () => {
    it('accepts aria-label prop', () => {
      render(<Input id="test" name="test" ariaLabel="Search input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search input');
    });

    it('can be required', () => {
      render(<Input id="test" name="test" required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('can be disabled', () => {
      render(<Input id="test" name="test" disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('has focus ring styles', () => {
      render(<Input id="test" name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:outline-none');
      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-blue-500');
    });
  });

  describe('Custom styling', () => {
    it('accepts className prop', () => {
      render(<Input id="test" name="test" className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });
  });
});
