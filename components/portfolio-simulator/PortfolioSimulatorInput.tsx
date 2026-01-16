"use client";

import React, { useState, useRef, useEffect } from "react";
import { PortfolioSimulatorInputData, PortfolioSimulatorResponse, BenchmarkData, AVAILABLE_BENCHMARKS } from "@/types/PortfolioSimulatorTypes";
import PortfolioSimulatorResults from "./PortfolioSimulatorResults";

// Helper function to fetch with timeout (important for mobile)
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 60000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default function PortfolioSimulatorInput() {
  // Use Next.js API route to proxy the request and avoid CORS
  const apiUrl = "/api/calculate";

  const [tickerInput, setTickerInput] = useState("");
  const [allocationInput, setAllocationInput] = useState("");
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAllocationValue, setEditAllocationValue] = useState("");
  
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
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if component is mounted and to abort pending requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggleBenchmark = (ticker: string) => {
    setSelectedBenchmarks(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
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

  const startEditAllocation = (index: number) => {
    setEditingIndex(index);
    setEditAllocationValue(formData.allocations[index].toString());
  };

  const saveEditAllocation = () => {
    if (editingIndex !== null) {
      const newAllocation = parseFloat(editAllocationValue) || 0;
      setFormData(prev => ({
        ...prev,
        allocations: prev.allocations.map((alloc, i) => 
          i === editingIndex ? newAllocation : alloc
        )
      }));
      setEditingIndex(null);
      setEditAllocationValue("");
    }
  };

  const cancelEditAllocation = () => {
    setEditingIndex(null);
    setEditAllocationValue("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditAllocation();
    } else if (e.key === 'Escape') {
      cancelEditAllocation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Abort any pending requests from previous submission
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setLoadingProgress("Calculating portfolio...");
    setError(null);
    setBenchmarkResults([]);
    setResults(null);

    try {
      // Convert values to numbers and percentage to decimal for backend
      const startingValue = Number(formData.starting_value) || 0;
      const personalContributions = Number(formData.personal_contributions) || 0;
      const contributionPeriod = Number(formData.contribution_period) || 0;
      const riskFreeRate = Number(formData.annual_risk_free_return) || 0;

      const payload = {
        tickers: formData.tickers,
        allocations: formData.allocations,
        starting_value: startingValue,
        period: formData.period,
        personal_contributions: personalContributions,
        contribution_period: contributionPeriod,
        include_dividends: formData.include_dividends,
        is_drip_active: formData.is_drip_active,
        annual_risk_free_return: riskFreeRate / 100,
        max_data_points: 150  // Limit data points from backend for performance
      };

      const response = await fetchWithTimeout(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }, 90000); // 90 second timeout for main request

      if (!response.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const data: PortfolioSimulatorResponse = await response.json();
      
      // Check if component is still mounted and request wasn't aborted
      if (!isMountedRef.current) return;
      
      setResults(data);

      // Fetch benchmark data SEQUENTIALLY to reduce memory pressure on mobile
      // This is slower but much more reliable on iOS Safari
      if (selectedBenchmarks.length > 0) {
        const benchmarkDataArray: BenchmarkData[] = [];
        
        for (let i = 0; i < selectedBenchmarks.length; i++) {
          const ticker = selectedBenchmarks[i];
          
          // Check if we should abort
          if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
            break;
          }
          
          setLoadingProgress(`Loading benchmark ${i + 1}/${selectedBenchmarks.length}: ${ticker}...`);
          
          // Yield to browser between requests - use requestAnimationFrame for smoother UI
          // This prevents the UI from freezing and helps mobile Safari stay responsive
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 50);
            });
          });
          
          try {
            const benchmarkPayload = {
              tickers: [ticker],
              allocations: [100],
              starting_value: startingValue,
              period: formData.period,
              personal_contributions: personalContributions,
              contribution_period: contributionPeriod,
              include_dividends: formData.include_dividends,
              is_drip_active: formData.is_drip_active,
              annual_risk_free_return: riskFreeRate / 100,
              max_data_points: 150  // Limit data points from backend for performance
            };

            const benchmarkResponse = await fetchWithTimeout(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(benchmarkPayload),
            }, 60000); // 60 second timeout per benchmark

            if (!benchmarkResponse.ok) {
              console.error(`Failed to fetch benchmark data for ${ticker}`);
              continue;
            }

            const benchmarkData: PortfolioSimulatorResponse = await benchmarkResponse.json();
            
            if (!isMountedRef.current) return;

            const benchmark: BenchmarkData = {
              ticker,
              dates: benchmarkData.dates,
              total_values: benchmarkData.total_values,
              annualized_return: benchmarkData.annualized_return,
              sharpe_ratio: benchmarkData.sharpe_ratio,
              final_value: benchmarkData.final_value,
              projected_annual_dividend_income: benchmarkData.projected_annual_dividend_income,
            };
            
            benchmarkDataArray.push(benchmark);
            
            // Update results incrementally so user sees progress
            setBenchmarkResults([...benchmarkDataArray]);
            
          } catch (benchmarkError) {
            // Log but continue with other benchmarks
            console.error(`Error fetching benchmark ${ticker}:`, benchmarkError);
          }
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      // Don't show error if it was an intentional abort
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      // Provide more helpful error message for timeout
      if (errorMessage.includes('abort') || errorMessage.includes('timeout')) {
        setError('Request timed out. Try selecting fewer benchmarks or a shorter time period.');
      } else {
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setLoadingProgress("");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6">
      <div className="card p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-primary">Portfolio Simulator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Portfolio Tickers */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Portfolio Holdings
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="Ticker (e.g., AAPL)"
                className="input-field flex-1"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={allocationInput}
                  onChange={(e) => setAllocationInput(e.target.value)}
                  placeholder="Allocation (%)"
                  className="input-field flex-1 sm:w-32"
                />
                <button
                  type="button"
                  onClick={addTicker}
                  className="btn-secondary p-2 flex-shrink-0"
                  title="Add ticker"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            {formData.tickers.length > 0 && (
              <div className="space-y-1">
                {formData.tickers.map((ticker, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-tertiary p-2 rounded-lg">
                    {editingIndex === idx ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-primary font-medium">{ticker}:</span>
                        <input
                          type="number"
                          value={editAllocationValue}
                          onChange={(e) => setEditAllocationValue(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="input-field w-20 py-1 px-2 text-sm"
                          autoFocus
                        />
                        <span className="text-primary">%</span>
                        <button
                          type="button"
                          onClick={saveEditAllocation}
                          className="p-1 text-green-500 hover:text-green-600 transition-colors"
                          title="Save"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditAllocation}
                          className="p-1 text-secondary hover:text-red-500 transition-colors"
                          title="Cancel"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <span 
                          className="text-primary font-medium cursor-pointer hover:text-blue-500 transition-colors"
                          onClick={() => startEditAllocation(idx)}
                          title="Click to edit allocation"
                        >
                          {ticker}: {formData.allocations[idx]}%
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditAllocation(idx)}
                            className="p-1 text-secondary hover:text-blue-500 transition-colors"
                            title="Edit allocation"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTicker(idx)}
                            className="p-1 text-secondary hover:text-red-500 transition-colors"
                            title="Remove ticker"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="starting_value" className="block text-sm font-medium text-primary mb-1">
              Starting Portfolio Value ($)
            </label>
            <input
              type="number"
              id="starting_value"
              name="starting_value"
              value={formData.starting_value}
              onChange={handleInputChange}
              className="input-field w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-primary mb-1">
                Time Period
              </label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="input-field w-full"
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
              <label htmlFor="annual_risk_free_return" className="block text-sm font-medium text-primary mb-1">
                Risk-Free Rate (%)
              </label>
              <input
                type="number"
                id="annual_risk_free_return"
                name="annual_risk_free_return"
                value={formData.annual_risk_free_return}
                onChange={handleInputChange}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="personal_contributions" className="block text-sm font-medium text-primary mb-1">
                Personal Contributions ($)
              </label>
              <input
                type="number"
                id="personal_contributions"
                name="personal_contributions"
                value={formData.personal_contributions}
                onChange={handleInputChange}
                className="input-field w-full"
              />
            </div>

            <div>
              <label htmlFor="contribution_period" className="block text-sm font-medium text-primary mb-1">
                Contribution Period (market days)
              </label>
              <input
                type="number"
                id="contribution_period"
                name="contribution_period"
                value={formData.contribution_period}
                onChange={handleInputChange}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="include_dividends"
                checked={formData.include_dividends}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 rounded accent-blue-500"
              />
              <span className="text-sm text-primary">Include Dividends</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_drip_active"
                checked={formData.is_drip_active}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 rounded accent-blue-500"
              />
              <span className="text-sm text-primary">DRIP Active</span>
            </label>
          </div>

          {/* Benchmark Comparison */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Compare Against Benchmarks
            </label>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {AVAILABLE_BENCHMARKS.map((benchmark) => (
                <label 
                  key={benchmark.ticker}
                  className="flex items-center bg-tertiary px-3 py-2 rounded-lg cursor-pointer hover:bg-secondary transition-colors border border-transparent hover:border-primary"
                >
                  <input
                    type="checkbox"
                    checked={selectedBenchmarks.includes(benchmark.ticker)}
                    onChange={() => toggleBenchmark(benchmark.ticker)}
                    className="mr-2 h-4 w-4 rounded"
                    style={{ accentColor: benchmark.color }}
                  />
                  <span className="text-sm">
                    <span className="font-semibold" style={{ color: benchmark.color }}>{benchmark.ticker}</span>
                    <span className="text-secondary ml-1 hidden sm:inline">({benchmark.name})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">{loadingProgress || 'Calculating...'}</span>
              </span>
            ) : 'Calculate'}
          </button>
        </form>
      </div>

      {results && <PortfolioSimulatorResults data={results} benchmarks={benchmarkResults} />}
    </div>
  );
}