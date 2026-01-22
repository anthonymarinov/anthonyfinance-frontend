import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock components to simplify testing
jest.mock('@/components/layout/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar</nav>;
  };
});

jest.mock('@/components/layout/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

jest.mock('@/components/portfolio-simulator/PortfolioSimulatorInput', () => {
  return function MockPortfolioSimulatorInput() {
    return <div data-testid="portfolio-simulator">Portfolio Simulator</div>;
  };
});

describe('Home Page', () => {
  describe('Layout', () => {
    it('renders the page', () => {
      render(<Home />);
      
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('portfolio-simulator')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('has correct structure with navbar at top', () => {
      render(<Home />);
      
      const navbar = screen.getByTestId('navbar');
      const main = screen.getByRole('main');
      const footer = screen.getByTestId('footer');
      
      expect(navbar).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });

    it('renders main content in main element', () => {
      render(<Home />);
      
      const main = screen.getByRole('main');
      const portfolioSimulator = screen.getByTestId('portfolio-simulator');
      
      expect(main).toContainElement(portfolioSimulator);
    });
  });

  describe('Styling', () => {
    it('has min-h-screen class on container', () => {
      const { container } = render(<Home />);
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.className).toContain('min-h-screen');
    });

    it('has flex column layout', () => {
      const { container } = render(<Home />);
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.className).toContain('flex');
      expect(mainContainer.className).toContain('flex-col');
    });
  });
});
