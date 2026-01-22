import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Test component to access theme context
function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage = {};
    
    // Mock localStorage
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockLocalStorage[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockLocalStorage[key] = value;
    });
    
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ThemeProvider', () => {
    it('renders children correctly', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Child Content</div>
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('provides default dark theme', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('loads theme from localStorage', async () => {
      mockLocalStorage['theme'] = 'light';
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      // Theme loads in useEffect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(Storage.prototype.getItem).toHaveBeenCalledWith('theme');
    });

    it('sets data-theme attribute on document', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      const toggleButton = screen.getByTestId('toggle-button');
      await userEvent.click(toggleButton);
      
      // After toggle, theme should change
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('toggles from dark to light', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      
      const toggleButton = screen.getByTestId('toggle-button');
      await userEvent.click(toggleButton);
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('toggles from light to dark', async () => {
      mockLocalStorage['theme'] = 'light';
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      // Wait for initial theme to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      const toggleButton = screen.getByTestId('toggle-button');
      await userEvent.click(toggleButton);
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('saves theme to localStorage on toggle', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      const toggleButton = screen.getByTestId('toggle-button');
      await userEvent.click(toggleButton);
      
      expect(Storage.prototype.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('useTheme hook', () => {
    it('throws error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<TestComponent />)).toThrow(
        'useTheme must be used within a ThemeProvider'
      );
      
      consoleSpy.mockRestore();
    });

    it('returns theme and toggleTheme function', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('current-theme')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-button')).toBeInTheDocument();
    });
  });
});
