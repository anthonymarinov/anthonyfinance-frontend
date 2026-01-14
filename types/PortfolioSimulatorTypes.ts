export interface PortfolioSimulatorInputData {
  tickers: string[];
  allocations: number[];
  starting_value: number;
  period: string;
  personal_contributions: number;
  contribution_period: number;
  include_dividends: boolean;
  is_drip_active: boolean;
  annual_risk_free_return: number;
}

export interface PortfolioSimulatorResponse {
  dates: string[];
  share_prices: number[];
  shares: number[];
  total_values: number[];
  accumulated_dividends: number[];
  annualized_return: number;
  sharpe_ratio: number;
}
