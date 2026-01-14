"use client";

import React, { useState } from "react";
import { PortfolioSimulatorInputData, PortfolioSimulatorResponse } from "@/types/PortfolioSimulatorTypes";
import PortfolioSimulatorResults from "./PortfolioSimulatorResults";

export default function PortfolioSimulatorInput() {
  // Use Next.js API route to proxy the request and avoid CORS
  const apiUrl = "/api/calculate";

  const [tickerInput, setTickerInput] = useState("");
  const [allocationInput, setAllocationInput] = useState("");
  
  const [formData, setFormData] = useState<PortfolioSimulatorInputData>({
    tickers: [],
    allocations: [],
    starting_value: 10000,
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
    if (tickerInput && allocationInput) {
      setFormData(prev => ({
        ...prev,
        tickers: [...prev.tickers, tickerInput.toUpperCase()],
        allocations: [...prev.allocations, parseFloat(allocationInput) || 0]
      }));
      setTickerInput("");
      setAllocationInput("");
    }
  };

  const removeTicker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tickers: prev.tickers.filter((_, i) => i !== index),
      allocations: prev.allocations.filter((_, i) => i !== index)
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
        <h1 className="text-3xl font-bold mb-6 text-white">Portfolio Simulator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Portfolio Tickers */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Portfolio Holdings
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="Ticker (e.g., AAPL)"
                className="flex-1 px-4 py-2 border border-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={allocationInput}
                onChange={(e) => setAllocationInput(e.target.value)}
                placeholder="Allocation (%)"
                step="0.01"
                className="flex-1 px-4 py-2 border border-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTicker}
                className="p-2 bg-black text-white border-1 border-white rounded-md hover:bg-gray-700 transition-colors"
                title="Add ticker"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {formData.tickers.length > 0 && (
              <div className="space-y-1">
                {formData.tickers.map((ticker, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                    <span>{ticker}: {formData.allocations[idx]}%</span>
                    <button
                      type="button"
                      onClick={() => removeTicker(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove ticker"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="starting_value" className="block text-sm font-medium text-white mb-1">
              Starting Portfolio Value ($)
            </label>
            <input
              type="number"
              id="starting_value"
              name="starting_value"
              value={formData.starting_value}
              onChange={handleInputChange}
              step="100"
              className="w-full px-4 py-2 border border-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-white mb-1">
                Time Period
              </label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-black border border-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1mo">1 Month</option>
                <option value="3mo">3 Months</option>
                <option value="6mo">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="2y">2 Years</option>
                <option value="5y">5 Years</option>
                <option value="10y">10 Years</option>
                <option value="15y">15 Years</option>
                <option value="20y">20 Years</option>
              </select>
            </div>

            <div>
              <label htmlFor="annual_risk_free_return" className="block text-sm font-medium text-white mb-1">
                Risk-Free Rate (%)
              </label>
              <input
                type="number"
                id="annual_risk_free_return"
                name="annual_risk_free_return"
                value={formData.annual_risk_free_return}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-4 py-2 border border-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="personal_contributions" className="block text-sm font-medium text-white mb-1">
                Personal Contributions ($)
              </label>
              <input
                type="number"
                id="personal_contributions"
                name="personal_contributions"
                value={formData.personal_contributions}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="contribution_period" className="block text-sm font-medium text-white mb-1">
                Contribution Period (months)
              </label>
              <input
                type="number"
                id="contribution_period"
                name="contribution_period"
                value={formData.contribution_period}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <span className="text-sm text-white">Include Dividends</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_drip_active"
                checked={formData.is_drip_active}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-white">DRIP Active</span>
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