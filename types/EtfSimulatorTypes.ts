export interface EtfSimulatorInputData {
  tickers: string[];
  holdings: number[];
  shares_outstanding: number | string;
  starting_shares: number | string;
  period: string;
  personal_contributions: number | string;
  contribution_period: number | string;
  include_dividends: boolean;
  is_drip_active: boolean;
  annual_risk_free_return: number | string;
}

export interface EtfSimulatorResponse {
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
