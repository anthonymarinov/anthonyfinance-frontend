import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HelpModal from '@/components/layout/HelpModal';

describe('HelpModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('does not render when isOpen is false', () => {
      render(<HelpModal isOpen={false} onClose={mockOnClose} />);
      
      expect(screen.queryByText('How to Use AntFinance')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('How to Use AntFinance')).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    beforeEach(() => {
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
    });

    it('displays the modal title', () => {
      expect(screen.getByText('How to Use AntFinance')).toBeInTheDocument();
    });

    it('displays Portfolio Simulator Guide subtitle', () => {
      expect(screen.getByText('Portfolio Simulator Guide')).toBeInTheDocument();
    });

    it('displays What is AntFinance section', () => {
      expect(screen.getByText('What is AntFinance?')).toBeInTheDocument();
    });

    it('displays Getting Started section', () => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });

    it('shows logo in header', () => {
      expect(screen.getByAltText('AntFinance Logo')).toBeInTheDocument();
    });

    it('shows close button', () => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('Close');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      // Find backdrop by its class
      const backdrop = document.querySelector('.backdrop-blur-sm');
      expect(backdrop).toBeInTheDocument();
      
      if (backdrop) {
        await user.click(backdrop);
      }
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for other key presses', () => {
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'a' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll', () => {
    it('disables body scroll when modal opens', () => {
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal closes', () => {
      const { unmount } = render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Accessibility', () => {
    it('has accessible close button', () => {
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });
  });

  describe('Help Content', () => {
    beforeEach(() => {
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
    });

    it('explains what the tool does', () => {
      expect(
        screen.getByText(/portfolio simulator that uses/i)
      ).toBeInTheDocument();
    });

    it('mentions historical market data', () => {
      expect(
        screen.getByText(/real historical market data/i)
      ).toBeInTheDocument();
    });

    it('provides instructions for adding holdings', () => {
      expect(
        screen.getByText(/add holdings/i)
      ).toBeInTheDocument();
    });

    it('provides instructions for setting starting value', () => {
      expect(
        screen.getByText(/set starting value/i)
      ).toBeInTheDocument();
    });
  });
});
