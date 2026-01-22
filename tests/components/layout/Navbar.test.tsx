import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '@/components/layout/Navbar';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock HelpModal to simplify testing
jest.mock('@/components/layout/HelpModal', () => {
  return function MockHelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    return (
      <div data-testid="help-modal">
        <button onClick={onClose} data-testid="close-modal">Close</button>
      </div>
    );
  };
});

const renderNavbar = () => {
  return render(
    <ThemeProvider>
      <Navbar />
    </ThemeProvider>
  );
};

describe('Navbar', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage = {};
    
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockLocalStorage[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockLocalStorage[key] = value;
    });
    
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the logo', () => {
      renderNavbar();
      
      expect(screen.getByAltText('AntFinance Logo')).toBeInTheDocument();
    });

    it('renders the brand name', () => {
      renderNavbar();
      
      expect(screen.getByText('AntFinance')).toBeInTheDocument();
    });

    it('renders help button', () => {
      renderNavbar();
      
      expect(screen.getByLabelText('Help')).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      renderNavbar();
      
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    it('renders mobile-friendly brand abbreviation', () => {
      renderNavbar();
      
      expect(screen.getByText('AF')).toBeInTheDocument();
    });
  });

  describe('Help Modal', () => {
    it('opens help modal when help button is clicked', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      const helpButton = screen.getByLabelText('Help');
      await user.click(helpButton);
      
      expect(screen.getByTestId('help-modal')).toBeInTheDocument();
    });

    it('closes help modal when close button is clicked', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      // Open modal
      const helpButton = screen.getByLabelText('Help');
      await user.click(helpButton);
      expect(screen.getByTestId('help-modal')).toBeInTheDocument();
      
      // Close modal
      const closeButton = screen.getByTestId('close-modal');
      await user.click(closeButton);
      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('toggles theme when theme button is clicked', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      const themeButton = screen.getByLabelText('Toggle theme');
      
      // Initial state is dark
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      
      await user.click(themeButton);
      
      // After click, theme should be light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('shows sun icon in dark mode', () => {
      renderNavbar();
      
      const themeButton = screen.getByLabelText('Toggle theme');
      // In dark mode, we show sun icon (to switch to light)
      const svg = themeButton.querySelector('svg');
      expect(svg).toHaveClass('text-yellow-400');
    });
  });

  describe('Accessibility', () => {
    it('has accessible help button', () => {
      renderNavbar();
      
      const helpButton = screen.getByLabelText('Help');
      expect(helpButton).toHaveAttribute('aria-label', 'Help');
    });

    it('has accessible theme toggle button', () => {
      renderNavbar();
      
      const themeButton = screen.getByLabelText('Toggle theme');
      expect(themeButton).toHaveAttribute('aria-label', 'Toggle theme');
    });
  });
});
