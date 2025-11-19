import { render, screen, fireEvent } from '@testing-library/react';
import { Message } from '@/components/ui/message';

describe('Message', () => {
  describe('Message types', () => {
    it('renders error message with icon', () => {
      const { container } = render(<Message type="error">Error occurred</Message>);
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('bg-red-50');
      expect(message).toHaveClass('border-red-200');
      // Check for icon
      const icon = message.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders success message with icon', () => {
      const { container } = render(<Message type="success">Success!</Message>);
      expect(screen.getByText('Success!')).toBeInTheDocument();
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('bg-green-50');
      expect(message).toHaveClass('border-green-200');
    });

    it('renders warning message with icon', () => {
      const { container } = render(<Message type="warning">Warning</Message>);
      expect(screen.getByText('Warning')).toBeInTheDocument();
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('bg-yellow-50');
      expect(message).toHaveClass('border-yellow-200');
    });

    it('renders info message with icon', () => {
      const { container } = render(<Message type="info">Info</Message>);
      expect(screen.getByText('Info')).toBeInTheDocument();
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('bg-blue-50');
      expect(message).toHaveClass('border-blue-200');
    });

    it('renders text with correct colors for each type', () => {
      const { container: errorContainer } = render(<Message type="error">Error</Message>);
      expect(errorContainer.querySelector('.text-red-600')).toBeInTheDocument();

      const { container: successContainer } = render(<Message type="success">Success</Message>);
      expect(successContainer.querySelector('.text-green-700')).toBeInTheDocument();

      const { container: warningContainer } = render(<Message type="warning">Warning</Message>);
      expect(warningContainer.querySelector('.text-yellow-700')).toBeInTheDocument();

      const { container: infoContainer } = render(<Message type="info">Info</Message>);
      expect(infoContainer.querySelector('.text-blue-700')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="alert" attribute', () => {
      render(<Message type="error">Alert message</Message>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live="polite" attribute', () => {
      const { container } = render(<Message type="success">Message</Message>);
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Close button', () => {
    it('renders close button when onClose is provided', () => {
      const handleClose = jest.fn();
      render(<Message type="info" onClose={handleClose}>Closeable</Message>);
      const closeButton = screen.getByRole('button', { name: /閉じる/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(<Message type="info" onClose={handleClose}>Closeable</Message>);
      fireEvent.click(screen.getByRole('button', { name: /閉じる/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render close button when onClose is not provided', () => {
      render(<Message type="info">No close</Message>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Dark mode', () => {
    it('has dark mode classes for error', () => {
      const { container } = render(<Message type="error">Dark error</Message>);
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('dark:bg-red-900/20');
      expect(message).toHaveClass('dark:border-red-800');
    });

    it('has dark mode classes for success', () => {
      const { container } = render(<Message type="success">Dark success</Message>);
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('dark:bg-green-900/20');
      expect(message).toHaveClass('dark:border-green-800');
    });

    it('has dark mode classes for warning', () => {
      const { container } = render(<Message type="warning">Dark warning</Message>);
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('dark:bg-yellow-900/20');
      expect(message).toHaveClass('dark:border-yellow-800');
    });

    it('has dark mode classes for info', () => {
      const { container } = render(<Message type="info">Dark info</Message>);
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('dark:bg-blue-900/20');
      expect(message).toHaveClass('dark:border-blue-800');
    });

    it('has dark mode text colors', () => {
      const { container } = render(<Message type="error">Dark text</Message>);
      expect(container.querySelector('.dark\\:text-red-400')).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('accepts className prop', () => {
      const { container } = render(<Message type="info" className="custom-class">Custom</Message>);
      const message = container.firstChild as HTMLElement;
      expect(message).toHaveClass('custom-class');
    });
  });
});
