import {
  PortfolioSimulatorInputData,
  PortfolioSimulatorResponse,
  BenchmarkETF,
  BenchmarkData,
  AVAILABLE_BENCHMARKS,
} from '@/types/PortfolioSimulatorTypes';

describe('PortfolioSimulatorTypes', () => {
  describe('PortfolioSimulatorInputData', () => {
    it('should have correct structure', () => {
      const inputData: PortfolioSimulatorInputData = {
        tickers: ['AAPL', 'MSFT'],
        allocations: [50, 50],
        starting_value: 10000,
        period: '1y',
        personal_contributions: 500,
        contribution_period: 20,
        include_dividends: true,
        is_drip_active: false,
        annual_risk_free_return: 4.5,
      };

      expect(inputData.tickers).toEqual(['AAPL', 'MSFT']);
      expect(inputData.allocations).toEqual([50, 50]);
      expect(inputData.starting_value).toBe(10000);
      expect(inputData.period).toBe('1y');
      expect(inputData.personal_contributions).toBe(500);
      expect(inputData.contribution_period).toBe(20);
      expect(inputData.include_dividends).toBe(true);
      expect(inputData.is_drip_active).toBe(false);
      expect(inputData.annual_risk_free_return).toBe(4.5);
    });

    it('accepts string values for numeric fields', () => {
      const inputData: PortfolioSimulatorInputData = {
        tickers: ['VTI'],
        allocations: [100],
        starting_value: '15000',
        period: '5y',
        personal_contributions: '200',
        contribution_period: '10',
        include_dividends: true,
        is_drip_active: true,
        annual_risk_free_return: '3.5',
      };

      expect(inputData.starting_value).toBe('15000');
      expect(inputData.personal_contributions).toBe('200');
    });
  });

  describe('PortfolioSimulatorResponse', () => {
    it('should have correct structure', () => {
      const response: PortfolioSimulatorResponse = {
        dates: ['2024-01-01', '2024-01-02'],
        share_prices: [100, 105],
        shares: [100, 100],
        total_values: [10000, 10500],
        accumulated_dividends: [0, 25],
        annualized_return: 0.15,
        sharpe_ratio: 1.2,
        final_value: 10500,
        projected_annual_dividend_income: 200,
      };

      expect(response.dates).toHaveLength(2);
      expect(response.share_prices).toHaveLength(2);
      expect(response.shares).toHaveLength(2);
      expect(response.total_values).toHaveLength(2);
      expect(response.accumulated_dividends).toHaveLength(2);
      expect(response.annualized_return).toBe(0.15);
      expect(response.sharpe_ratio).toBe(1.2);
      expect(response.final_value).toBe(10500);
      expect(response.projected_annual_dividend_income).toBe(200);
    });
  });

  describe('BenchmarkETF', () => {
    it('should have correct structure', () => {
      const benchmark: BenchmarkETF = {
        ticker: 'SPY',
        name: 'S&P 500',
        color: '#ef4444',
      };

      expect(benchmark.ticker).toBe('SPY');
      expect(benchmark.name).toBe('S&P 500');
      expect(benchmark.color).toBe('#ef4444');
    });
  });

  describe('BenchmarkData', () => {
    it('should have correct structure', () => {
      const benchmarkData: BenchmarkData = {
        ticker: 'SPY',
        dates: ['2024-01-01', '2024-01-02'],
        total_values: [10000, 10300],
        annualized_return: 0.12,
        sharpe_ratio: 1.1,
        final_value: 10300,
        projected_annual_dividend_income: 150,
      };

      expect(benchmarkData.ticker).toBe('SPY');
      expect(benchmarkData.dates).toHaveLength(2);
      expect(benchmarkData.total_values).toHaveLength(2);
      expect(benchmarkData.annualized_return).toBe(0.12);
      expect(benchmarkData.sharpe_ratio).toBe(1.1);
      expect(benchmarkData.final_value).toBe(10300);
      expect(benchmarkData.projected_annual_dividend_income).toBe(150);
    });
  });

  describe('AVAILABLE_BENCHMARKS', () => {
    it('should contain expected benchmarks', () => {
      expect(AVAILABLE_BENCHMARKS).toHaveLength(5);
      
      const tickers = AVAILABLE_BENCHMARKS.map(b => b.ticker);
      expect(tickers).toContain('SPY');
      expect(tickers).toContain('SCHG');
      expect(tickers).toContain('QQQ');
      expect(tickers).toContain('VTI');
      expect(tickers).toContain('SCHD');
    });

    it('should have unique colors for each benchmark', () => {
      const colors = AVAILABLE_BENCHMARKS.map(b => b.color);
      const uniqueColors = new Set(colors);
      
      expect(uniqueColors.size).toBe(AVAILABLE_BENCHMARKS.length);
    });

    it('should have non-empty names for each benchmark', () => {
      AVAILABLE_BENCHMARKS.forEach(benchmark => {
        expect(benchmark.name).toBeTruthy();
        expect(benchmark.name.length).toBeGreaterThan(0);
      });
    });

    it('SPY benchmark should be S&P 500', () => {
      const spy = AVAILABLE_BENCHMARKS.find(b => b.ticker === 'SPY');
      expect(spy).toBeDefined();
      expect(spy?.name).toBe('S&P 500');
    });
  });
});
