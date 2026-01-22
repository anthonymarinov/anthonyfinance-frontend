import React from 'react';
import { render, screen } from '@testing-library/react';
import PortfolioSimulatorResults from '@/components/portfolio-simulator/PortfolioSimulatorResults';
import { PortfolioSimulatorResponse, BenchmarkData } from '@/types/PortfolioSimulatorTypes';

// Mock recharts to avoid canvas/SVG rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('PortfolioSimulatorResults', () => {
  const mockData: PortfolioSimulatorResponse = {
    dates: ['2024-01-01', '2024-01-15', '2024-02-01'],
    share_prices: [100, 105, 110],
    shares: [100, 100, 100],
    total_values: [10000, 10500, 11000],
    accumulated_dividends: [0, 25, 50],
    annualized_return: 0.1523,
    sharpe_ratio: 1.25,
    final_value: 11000,
    projected_annual_dividend_income: 200,
  };

  const mockBenchmarks: BenchmarkData[] = [
    {
      ticker: 'SPY',
      dates: ['2024-01-01', '2024-01-15', '2024-02-01'],
      total_values: [10000, 10300, 10600],
      annualized_return: 0.12,
      sharpe_ratio: 1.1,
      final_value: 10600,
      projected_annual_dividend_income: 150,
    },
    {
      ticker: 'QQQ',
      dates: ['2024-01-01', '2024-01-15', '2024-02-01'],
      total_values: [10000, 10400, 10800],
      annualized_return: 0.14,
      sharpe_ratio: 0.95,
      final_value: 10800,
      projected_annual_dividend_income: 100,
    },
  ];

  describe('Rendering', () => {
    it('renders analytics summary section', () => {
      render(<PortfolioSimulatorResults data={mockData} />);
      
      expect(screen.getByText('Analytics Summary')).toBeInTheDocument();
    });

    it('displays correct annualized return', () => {
      render(<PortfolioSimulatorResults data={mockData} />);
      
      // 0.1523 * 100 = 15.23%
      expect(screen.getByText('15.23%')).toBeInTheDocument();
    });

    it('displays correct sharpe ratio', () => {
      render(<PortfolioSimulatorResults data={mockData} />);
      
      expect(screen.getByText('1.25')).toBeInTheDocument();
    });

    it('displays correct final portfolio value', () => {
      render(<PortfolioSimulatorResults data={mockData} />);
      
      expect(screen.getByText('$11,000.00')).toBeInTheDocument();
    });

    it('displays correct yearly dividend income', () => {
      render(<PortfolioSimulatorResults data={mockData} />);
      
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });

    it('renders chart section', () => {
      render(<PortfolioSimulatorResults data={mockData} />);
      
      expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error for invalid data', () => {
      const invalidData = null as unknown as PortfolioSimulatorResponse;
      render(<PortfolioSimulatorResults data={invalidData} />);
      
      expect(screen.getByText(/error: invalid data received from api/i)).toBeInTheDocument();
    });

    it('displays error when dates is not an array', () => {
      const invalidData = {
        ...mockData,
        dates: null,
      } as unknown as PortfolioSimulatorResponse;
      
      render(<PortfolioSimulatorResults data={invalidData} />);
      
      expect(screen.getByText(/error: invalid data received from api/i)).toBeInTheDocument();
    });
  });

  describe('Benchmark Comparison', () => {
    it('does not show benchmark table when no benchmarks provided', () => {
      render(<PortfolioSimulatorResults data={mockData} benchmarks={[]} />);
      
      expect(screen.queryByText('Benchmark Comparison')).not.toBeInTheDocument();
    });

    it('shows benchmark comparison table when benchmarks provided', () => {
      render(<PortfolioSimulatorResults data={mockData} benchmarks={mockBenchmarks} />);
      
      expect(screen.getByText('Benchmark Comparison')).toBeInTheDocument();
    });

    it('displays your portfolio row in benchmark table', () => {
      render(<PortfolioSimulatorResults data={mockData} benchmarks={mockBenchmarks} />);
      
      expect(screen.getByText('Your Portfolio')).toBeInTheDocument();
    });

    it('displays benchmark tickers in table', () => {
      render(<PortfolioSimulatorResults data={mockData} benchmarks={mockBenchmarks} />);
      
      // Look for the ticker in the table rows
      const rows = screen.getAllByRole('row');
      const spyRow = rows.find(row => row.textContent?.includes('SPY'));
      const qqqRow = rows.find(row => row.textContent?.includes('QQQ'));
      
      expect(spyRow).toBeTruthy();
      expect(qqqRow).toBeTruthy();
    });

    it('shows positive difference when outperforming benchmark', () => {
      render(<PortfolioSimulatorResults data={mockData} benchmarks={mockBenchmarks} />);
      
      // Portfolio return (15.23%) - SPY return (12%) = +3.23%
      // Check for positive indicators
      const positiveValues = screen.getAllByText(/^\+/);
      expect(positiveValues.length).toBeGreaterThan(0);
    });

    it('calculates correct return difference vs benchmark', () => {
      render(<PortfolioSimulatorResults data={mockData} benchmarks={mockBenchmarks} />);
      
      // Portfolio return: 15.23%, SPY return: 12%
      // Difference: 15.23 - 12 = 3.23%
      expect(screen.getByText('+3.23%')).toBeInTheDocument();
    });

    it('calculates correct final value difference vs benchmark', () => {
      render(<PortfolioSimulatorResults data={mockData} benchmarks={mockBenchmarks} />);
      
      // Portfolio: $11,000, SPY: $10,600
      // Difference: $400
      expect(screen.getByText('+$400.00')).toBeInTheDocument();
    });
  });

  describe('Labels and Headers', () => {
    it('displays all summary card labels', () => {
      render(<PortfolioSimulatorResults data={mockData} />);
      
      expect(screen.getByText('Annualized Return')).toBeInTheDocument();
      expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
      expect(screen.getByText('Final Portfolio Value')).toBeInTheDocument();
      expect(screen.getByText('Yearly Dividend Income')).toBeInTheDocument();
    });

    it('displays benchmark table headers', () => {
      render(<PortfolioSimulatorResults data={mockData} benchmarks={mockBenchmarks} />);
      
      expect(screen.getByText('Asset')).toBeInTheDocument();
      // Use getAllByText since 'Annualized Return' appears in both summary and table
      expect(screen.getAllByText('Annualized Return').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('vs Portfolio').length).toBeGreaterThan(0);
    });
  });
});
