"use client";

import React, { useState } from "react";
import { PortfolioSimulatorInputData, PortfolioSimulatorResponse } from "@/types/PortfolioSimulatorTypes";
import PortfolioSimulatorResults from "./ETFSimulatorResults";

export default function PortfolioSimulatorInput() {
  // Use Next.js API route to proxy the request and avoid CORS
  const apiUrl = "/api/calculate";

  const [tickerInput, setTickerInput] = useState("");
  const [holdingInput, setHoldingInput] = useState("");
  
  const [formData, setFormData] = useState<PortfolioSimulatorInputData>({
    tickers: [],
    holdings: [],
    shares_outstanding: 1,
    starting_shares: 1,
    period: "1y",
    personal_contributions: 0,
    contribution_period: 0,
    include_dividends: true,
    is_drip_active: false,
    annual_risk_free_return: 4.5,
  });
  
  const [results, setResults] = useState<PortfolioSimulatorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const addTicker = () => {
    if (tickerInput && holdingInput) {
      setFormData(prev => ({
        ...prev,
        tickers: [...prev.tickers, tickerInput.toUpperCase()],
        holdings: [...prev.holdings, parseFloat(holdingInput) || 0]
      }));
      setTickerInput("");
      setHoldingInput("");
    }
  };

  const removeTicker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tickers: prev.tickers.filter((_, i) => i !== index),
      holdings: prev.holdings.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert percentage to decimal for backend
      const payload = {
        ...formData,
        annual_risk_free_return: formData.annual_risk_free_return / 100
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const data: PortfolioSimulatorResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-black p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-white">Finance Calculator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Portfolio Tickers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Holdings
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="Ticker (e.g., AAPL)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={holdingInput}
                onChange={(e) => setHoldingInput(e.target.value)}
                placeholder="Holdings (# of shares)"
                step="0.01"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTicker}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
            {formData.tickers.length > 0 && (
              <div className="space-y-1">
                {formData.tickers.map((ticker, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{ticker}: {formData.holdings[idx]}%</span>
                    <button
                      type="button"
                      onClick={() => removeTicker(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="starting_shares" className="block text-sm font-medium text-gray-700 mb-1">
                Starting Shares
              </label>
              <input
                type="number"
                id="starting_shares"
                name="starting_shares"
                value={formData.starting_shares}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="shares_outstanding" className="block text-sm font-medium text-gray-700 mb-1">
                Shares Outstanding
              </label>
              <input
                type="number"
                id="shares_outstanding"
                name="shares_outstanding"
                value={formData.shares_outstanding}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1mo">1 Month</option>
                <option value="3mo">3 Months</option>
                <option value="6mo">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="2y">2 Years</option>
                <option value="5y">5 Years</option>
                <option value="10y">10 Years</option>
              </select>
            </div>

            <div>
              <label htmlFor="annual_risk_free_return" className="block text-sm font-medium text-gray-700 mb-1">
                Risk-Free Rate (%)
              </label>
              <input
                type="number"
                id="annual_risk_free_return"
                name="annual_risk_free_return"
                value={formData.annual_risk_free_return}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="personal_contributions" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Contributions ($)
              </label>
              <input
                type="number"
                id="personal_contributions"
                name="personal_contributions"
                value={formData.personal_contributions}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="contribution_period" className="block text-sm font-medium text-gray-700 mb-1">
                Contribution Period (months)
              </label>
              <input
                type="number"
                id="contribution_period"
                name="contribution_period"
                value={formData.contribution_period}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="include_dividends"
                checked={formData.include_dividends}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Include Dividends</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_drip_active"
                checked={formData.is_drip_active}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">DRIP Active</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </form>
      </div>

      {results && <PortfolioSimulatorResults data={results} />}
    </div>
  );
}