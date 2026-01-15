export interface PortfolioSimulatorInputData {
  tickers: string[];
  allocations: number[];
  starting_value: number | string;
  period: string;
  personal_contributions: number | string;
  contribution_period: number | string;
  include_dividends: boolean;
  is_drip_active: boolean;
  annual_risk_free_return: number | string;
}

export interface PortfolioSimulatorResponse {
  dates: string[];
  share_prices: number[];
  shares: number[];
  total_values: number[];
  accumulated_dividends: number[];
  annualized_return: number;
  sharpe_ratio: number;
  final_value: number;
  projected_annual_dividend_income: number;
}

export interface BenchmarkETF {
  ticker: string;
  name: string;
  color: string;
}

export interface BenchmarkData {
  ticker: string;
  dates: string[];
  total_values: number[];
  annualized_return: number;
  sharpe_ratio: number;
  final_value: number;
  projected_annual_dividend_income: number;
}

export const AVAILABLE_BENCHMARKS: BenchmarkETF[] = [
  { ticker: 'SPY', name: 'S&P 500', color: '#ef4444' },
  { ticker: 'SCHG', name: 'Schwab US Large-Cap Growth', color: '#f97316' },
  { ticker: 'QQQ', name: 'Nasdaq 100', color: '#eab308' },
  { ticker: 'VTI', name: 'Total Stock Market', color: '#22c55e' },
  { ticker: 'SCHD', name: 'Schwab US Dividend Equity', color: '#a855f7' },
];
