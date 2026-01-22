import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';

describe('Footer', () => {
  describe('Rendering', () => {
    it('renders the footer component', () => {
      render(<Footer />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('renders the logo', () => {
      render(<Footer />);
      
      expect(screen.getByAltText('AntFinance Logo')).toBeInTheDocument();
    });

    it('renders the brand name', () => {
      render(<Footer />);
      
      expect(screen.getByText('AntFinance')).toBeInTheDocument();
    });

    it('renders tagline', () => {
      render(<Footer />);
      
      expect(
        screen.getByText('Simulate and analyze your investment portfolio')
      ).toBeInTheDocument();
    });

    it('renders disclaimer', () => {
      render(<Footer />);
      
      expect(
        screen.getByText(/this tool is for educational and informational purposes only/i)
      ).toBeInTheDocument();
    });

    it('renders copyright notice', () => {
      render(<Footer />);
      
      // Copyright with current year
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} AntFinance`)).toBeInTheDocument();
    });
  });

  describe('Dynamic Content', () => {
    it('displays current year in copyright', () => {
      // Mock Date to ensure consistent testing
      const mockDate = new Date('2026-01-21');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      render(<Footer />);
      
      expect(screen.getByText('© 2026 AntFinance')).toBeInTheDocument();
      
      jest.restoreAllMocks();
    });
  });

  describe('Structure', () => {
    it('contains footer element', () => {
      render(<Footer />);
      
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('has proper sections', () => {
      render(<Footer />);
      
      // Check for tagline section
      expect(
        screen.getByText('Simulate and analyze your investment portfolio')
      ).toBeInTheDocument();
      
      // Check for disclaimer section
      expect(
        screen.getByText(/disclaimer/i)
      ).toBeInTheDocument();
    });
  });
});
