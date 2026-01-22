import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortfolioSimulatorInput from '@/components/portfolio-simulator/PortfolioSimulatorInput';

// Mock the PortfolioSimulatorResults component
jest.mock('@/components/portfolio-simulator/PortfolioSimulatorResults', () => {
  return function MockPortfolioSimulatorResults({ data, benchmarks }: { data: unknown; benchmarks: unknown[] }) {
    return (
      <div data-testid="portfolio-results">
        <span data-testid="results-data">{JSON.stringify(data)}</span>
        <span data-testid="benchmarks-count">{benchmarks?.length || 0}</span>
      </div>
    );
  };
});

describe('PortfolioSimulatorInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('renders the form with all input fields', () => {
      render(<PortfolioSimulatorInput />);
      
      expect(screen.getByText('Portfolio Simulator')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ticker (e.g., AAPL)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Allocation (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Starting Portfolio Value ($)')).toBeInTheDocument();
      expect(screen.getByLabelText('Time Period')).toBeInTheDocument();
      expect(screen.getByLabelText('Risk-Free Rate (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Personal Contributions ($)')).toBeInTheDocument();
      expect(screen.getByLabelText('Contribution Period (market days)')).toBeInTheDocument();
      expect(screen.getByText('Include Dividends')).toBeInTheDocument();
      expect(screen.getByText('DRIP Active')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument();
    });

    it('renders all benchmark options', () => {
      render(<PortfolioSimulatorInput />);
      
      expect(screen.getByText('SPY')).toBeInTheDocument();
      expect(screen.getByText('SCHG')).toBeInTheDocument();
      expect(screen.getByText('QQQ')).toBeInTheDocument();
      expect(screen.getByText('VTI')).toBeInTheDocument();
      expect(screen.getByText('SCHD')).toBeInTheDocument();
    });
  });

  describe('Adding and Removing Tickers', () => {
    it('adds a ticker with allocation when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'AAPL');
      await user.type(allocationInput, '50');
      await user.click(addButton);
      
      expect(screen.getByText('AAPL: 50%')).toBeInTheDocument();
    });

    it('converts ticker to uppercase', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'msft');
      await user.type(allocationInput, '30');
      await user.click(addButton);
      
      expect(screen.getByText('MSFT: 30%')).toBeInTheDocument();
    });

    it('clears input fields after adding a ticker', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)') as HTMLInputElement;
      const allocationInput = screen.getByPlaceholderText('Allocation (%)') as HTMLInputElement;
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'AAPL');
      await user.type(allocationInput, '50');
      await user.click(addButton);
      
      expect(tickerInput.value).toBe('');
      expect(allocationInput.value).toBe('');
    });

    it('removes a ticker when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      // Add a ticker first
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'AAPL');
      await user.type(allocationInput, '50');
      await user.click(addButton);
      
      expect(screen.getByText('AAPL: 50%')).toBeInTheDocument();
      
      // Remove the ticker
      const removeButton = screen.getByTitle('Remove ticker');
      await user.click(removeButton);
      
      expect(screen.queryByText('AAPL: 50%')).not.toBeInTheDocument();
    });

    it('adds multiple tickers correctly', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      // Add first ticker
      await user.type(tickerInput, 'AAPL');
      await user.type(allocationInput, '50');
      await user.click(addButton);
      
      // Add second ticker
      await user.type(tickerInput, 'MSFT');
      await user.type(allocationInput, '30');
      await user.click(addButton);
      
      // Add third ticker
      await user.type(tickerInput, 'GOOGL');
      await user.type(allocationInput, '20');
      await user.click(addButton);
      
      expect(screen.getByText('AAPL: 50%')).toBeInTheDocument();
      expect(screen.getByText('MSFT: 30%')).toBeInTheDocument();
      expect(screen.getByText('GOOGL: 20%')).toBeInTheDocument();
    });
  });

  describe('Editing Allocation', () => {
    it('allows editing allocation by clicking on ticker', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      // Add a ticker
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'AAPL');
      await user.type(allocationInput, '50');
      await user.click(addButton);
      
      // Click to edit
      const tickerDisplay = screen.getByText('AAPL: 50%');
      await user.click(tickerDisplay);
      
      // Should show edit input
      const editInput = screen.getByDisplayValue('50');
      expect(editInput).toBeInTheDocument();
    });
  });

  describe('Form Input Changes', () => {
    it('updates starting value when changed', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      const startingValueInput = screen.getByLabelText('Starting Portfolio Value ($)') as HTMLInputElement;
      await user.clear(startingValueInput);
      await user.type(startingValueInput, '25000');
      
      expect(startingValueInput.value).toBe('25000');
    });

    it('updates time period when changed', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      const periodSelect = screen.getByLabelText('Time Period') as HTMLSelectElement;
      await user.selectOptions(periodSelect, '5y');
      
      expect(periodSelect.value).toBe('5y');
    });

    it('toggles Include Dividends checkbox', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      const checkbox = screen.getByRole('checkbox', { name: /include dividends/i }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true); // Default is true
      
      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it('toggles DRIP Active checkbox', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      const checkbox = screen.getByRole('checkbox', { name: /drip active/i }) as HTMLInputElement;
      expect(checkbox.checked).toBe(false); // Default is false
      
      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Benchmark Selection', () => {
    it('toggles benchmark selection when clicked', async () => {
      const user = userEvent.setup();
      render(<PortfolioSimulatorInput />);
      
      // Find SPY checkbox
      const spyCheckbox = screen.getAllByRole('checkbox').find(
        (checkbox) => checkbox.closest('label')?.textContent?.includes('SPY')
      ) as HTMLInputElement;
      
      expect(spyCheckbox.checked).toBe(false);
      
      await user.click(spyCheckbox);
      expect(spyCheckbox.checked).toBe(true);
      
      await user.click(spyCheckbox);
      expect(spyCheckbox.checked).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('submits form and displays results on success', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        dates: ['2024-01-01', '2024-01-02'],
        share_prices: [100, 105],
        shares: [100, 100],
        total_values: [10000, 10500],
        accumulated_dividends: [0, 50],
        annualized_return: 0.15,
        sharpe_ratio: 1.2,
        final_value: 10500,
        projected_annual_dividend_income: 200,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<PortfolioSimulatorInput />);
      
      // Add a ticker
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'AAPL');
      await user.type(allocationInput, '100');
      await user.click(addButton);
      
      // Submit form
      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByTestId('portfolio-results')).toBeInTheDocument();
      });
    });

    it('displays error message on API failure', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      render(<PortfolioSimulatorInput />);
      
      // Add a ticker
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'AAPL');
      await user.type(allocationInput, '100');
      await user.click(addButton);
      
      // Submit form
      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);
      
      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/failed to fetch data from api/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Make fetch hang
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<PortfolioSimulatorInput />);
      
      // Add a ticker
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'AAPL');
      await user.type(allocationInput, '100');
      await user.click(addButton);
      
      // Submit form
      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);
      
      // Check loading state
      expect(screen.getByText(/calculating/i)).toBeInTheDocument();
    });

    it('sends correct payload to API', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          dates: [],
          share_prices: [],
          shares: [],
          total_values: [],
          accumulated_dividends: [],
          annualized_return: 0,
          sharpe_ratio: 0,
          final_value: 0,
          projected_annual_dividend_income: 0,
        }),
      });

      render(<PortfolioSimulatorInput />);
      
      // Add a ticker
      const tickerInput = screen.getByPlaceholderText('Ticker (e.g., AAPL)');
      const allocationInput = screen.getByPlaceholderText('Allocation (%)');
      const addButton = screen.getByTitle('Add ticker');
      
      await user.type(tickerInput, 'VTI');
      await user.type(allocationInput, '100');
      await user.click(addButton);
      
      // Submit form
      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/calculate',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('"tickers":["VTI"]'),
          })
        );
      });
    });
  });
});
