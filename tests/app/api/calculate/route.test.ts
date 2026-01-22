/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/calculate/route';

// Mock fetch globally for this test file
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Calculate API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST handler', () => {
    it('proxies request to backend API', async () => {
      const mockPayload = {
        tickers: ['AAPL', 'MSFT'],
        allocations: [50, 50],
        starting_value: 10000,
        period: '1y',
        personal_contributions: 0,
        contribution_period: 0,
        include_dividends: true,
        is_drip_active: false,
        annual_risk_free_return: 0.045,
      };

      const mockResponse = {
        dates: ['2024-01-01'],
        total_values: [10000],
        share_prices: [100],
        shares: [100],
        accumulated_dividends: [0],
        annualized_return: 0.1,
        sharpe_ratio: 1.0,
        final_value: 11000,
        projected_annual_dividend_income: 200,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/calculate', {
        method: 'POST',
        body: JSON.stringify(mockPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.finance.anthonymarinov.com/tools/portfolio-simulator',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockPayload),
        })
      );

      expect(data).toEqual(mockResponse);
    });

    it('returns backend error on failed response', async () => {
      const mockPayload = { tickers: ['INVALID'] };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid ticker',
      });

      const request = new NextRequest('http://localhost:3000/api/calculate', {
        method: 'POST',
        body: JSON.stringify(mockPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Backend error');
    });

    it('returns 500 error on network failure', async () => {
      const mockPayload = { tickers: ['AAPL'] };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/calculate', {
        method: 'POST',
        body: JSON.stringify(mockPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to connect to backend API');
    });

    it('passes request body correctly to backend', async () => {
      const mockPayload = {
        tickers: ['VTI'],
        allocations: [100],
        starting_value: 25000,
        period: '5y',
        personal_contributions: 500,
        contribution_period: 20,
        include_dividends: true,
        is_drip_active: true,
        annual_risk_free_return: 0.04,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const request = new NextRequest('http://localhost:3000/api/calculate', {
        method: 'POST',
        body: JSON.stringify(mockPayload),
      });

      await POST(request);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toEqual(mockPayload);
    });
  });
});
