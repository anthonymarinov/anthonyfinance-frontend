"use client";

import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PortfolioSimulatorResponse, BenchmarkData, AVAILABLE_BENCHMARKS } from "@/types/PortfolioSimulatorTypes";

interface PortfolioSimulatorResultsProps {
  data: PortfolioSimulatorResponse;
  benchmarks?: BenchmarkData[];
}

export default function PortfolioSimulatorResults({ data, benchmarks = [] }: PortfolioSimulatorResultsProps) {
  // Memoize chart data transformation to prevent recalculation on every render
  const chartData = useMemo(() => {
    // Return empty array if data is invalid
    if (!data || !data.dates || !Array.isArray(data.dates)) {
      return [];
    }
    // Backend already samples data to ~150 points, so we just need to merge
    // Pre-build date lookup maps for each benchmark (O(n) instead of O(n²))
    const benchmarkMaps = new Map<string, Map<string, number>>();
    benchmarks.forEach((benchmark) => {
      const dateMap = new Map<string, number>();
      benchmark.dates.forEach((d, idx) => {
        // Normalize date string for consistent matching
        const dateKey = new Date(d).toISOString().split('T')[0];
        dateMap.set(dateKey, benchmark.total_values[idx]);
      });
      benchmarkMaps.set(benchmark.ticker, dateMap);
    });
    
    return data.dates.map((date, index) => {
      const dateKey = new Date(date).toISOString().split('T')[0];
      const displayDate = new Date(date).toLocaleDateString();
      
      const dataPoint: Record<string, string | number> = {
        date: displayDate,
        total_value: data.total_values[index],
        share_price: data.share_prices[index],
        shares: data.shares[index],
        accumulated_dividends: data.accumulated_dividends[index],
      };

      // Add benchmark values using pre-built maps (O(1) lookup)
      benchmarks.forEach((benchmark) => {
        const dateMap = benchmarkMaps.get(benchmark.ticker);
        if (dateMap) {
          const value = dateMap.get(dateKey);
          if (value !== undefined) {
            dataPoint[`benchmark_${benchmark.ticker}`] = value;
          }
        }
      });

      return dataPoint;
    });
  }, [data, benchmarks]);

  // Validate data structure (after hooks to follow rules of hooks)
  if (!data || !data.dates || !Array.isArray(data.dates)) {
    return (
      <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error: Invalid data received from API</p>
        <p className="text-sm mt-1">Expected dates array but got: {JSON.stringify(data)}</p>
      </div>
    );
  }

  // Get benchmark color from AVAILABLE_BENCHMARKS
  const getBenchmarkColor = (ticker: string): string => {
    const benchmark = AVAILABLE_BENCHMARKS.find(b => b.ticker === ticker);
    return benchmark?.color || '#888888';
  };

  // Use values directly from API response
  const finalValue = data.final_value;
  const yearlyDividendIncome = data.projected_annual_dividend_income;

  return (
    <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
      {/* Analytics Summary */}
      <div className="card p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-primary">Analytics Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-secondary p-3 md:p-4 rounded-lg border border-primary">
            <p className="text-xs md:text-sm text-secondary">Annualized Return</p>
            <p className="text-lg md:text-2xl font-bold text-blue-400">
              {(data.annualized_return * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-secondary p-3 md:p-4 rounded-lg border border-primary">
            <p className="text-xs md:text-sm text-secondary">Sharpe Ratio</p>
            <p className="text-lg md:text-2xl font-bold text-green-400">
              {data.sharpe_ratio.toFixed(2)}
            </p>
          </div>
          <div className="bg-secondary p-3 md:p-4 rounded-lg border border-primary">
            <p className="text-xs md:text-sm text-secondary">Final Portfolio Value</p>
            <p className="text-lg md:text-2xl font-bold text-purple-400">
              ${finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-secondary p-3 md:p-4 rounded-lg border border-primary">
            <p className="text-xs md:text-sm text-secondary">Yearly Dividend Income</p>
            <p className="text-lg md:text-2xl font-bold text-yellow-400">
              ${yearlyDividendIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        {/* Benchmark Comparison Table */}
        {benchmarks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-primary">Benchmark Comparison</h3>
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full text-xs md:text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-3 px-2 text-secondary font-medium">Asset</th>
                    <th className="text-right py-3 px-3 text-secondary font-medium whitespace-nowrap">Annualized Return</th>
                    <th className="text-right py-3 px-3 text-secondary font-medium whitespace-nowrap">vs Portfolio</th>
                    <th className="text-right py-3 px-3 text-secondary font-medium whitespace-nowrap">Sharpe Ratio</th>
                    <th className="text-right py-3 px-3 text-secondary font-medium whitespace-nowrap">vs Portfolio</th>
                    <th className="text-right py-3 px-3 text-secondary font-medium whitespace-nowrap">Final Value</th>
                    <th className="text-right py-3 px-3 text-secondary font-medium whitespace-nowrap">vs Portfolio</th>
                    <th className="text-right py-3 px-3 text-secondary font-medium whitespace-nowrap">Yearly Dividends</th>
                    <th className="text-right py-3 px-3 text-secondary font-medium whitespace-nowrap">vs Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-secondary hover:bg-secondary transition-colors">
                    <td className="py-3 px-2 font-medium text-blue-400">Your Portfolio</td>
                    <td className="text-right py-3 px-3 text-primary">{(data.annualized_return * 100).toFixed(2)}%</td>
                    <td className="text-right py-3 px-3 text-secondary">—</td>
                    <td className="text-right py-3 px-3 text-primary">{data.sharpe_ratio.toFixed(2)}</td>
                    <td className="text-right py-3 px-3 text-secondary">—</td>
                    <td className="text-right py-3 px-3 text-primary">${finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="text-right py-3 px-3 text-secondary">—</td>
                    <td className="text-right py-3 px-3 text-primary">${yearlyDividendIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="text-right py-3 px-3 text-secondary">—</td>
                  </tr>
                  {benchmarks.map((benchmark) => {
                    const returnDifference = (data.annualized_return - benchmark.annualized_return) * 100;
                    const isReturnOutperforming = returnDifference > 0;
                    const sharpeDifference = data.sharpe_ratio - benchmark.sharpe_ratio;
                    const isSharpeOutperforming = sharpeDifference > 0;
                    const valueDifference = finalValue - benchmark.final_value;
                    const isValueOutperforming = valueDifference > 0;
                    const dividendDifference = yearlyDividendIncome - benchmark.projected_annual_dividend_income;
                    const isDividendOutperforming = dividendDifference > 0;
                    return (
                      <tr key={benchmark.ticker} className="border-b border-secondary hover:bg-secondary transition-colors">
                        <td className="py-3 px-2 font-medium" style={{ color: getBenchmarkColor(benchmark.ticker) }}>
                          {benchmark.ticker}
                        </td>
                        <td className="text-right py-3 px-3 text-primary">
                          {(benchmark.annualized_return * 100).toFixed(2)}%
                        </td>
                        <td className={`text-right py-3 px-3 font-medium ${isReturnOutperforming ? 'text-green-400' : 'text-red-400'}`}>
                          {isReturnOutperforming ? '+' : ''}{returnDifference.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-3 text-primary">
                          {benchmark.sharpe_ratio.toFixed(2)}
                        </td>
                        <td className={`text-right py-3 px-3 font-medium ${isSharpeOutperforming ? 'text-green-400' : 'text-red-400'}`}>
                          {isSharpeOutperforming ? '+' : ''}{sharpeDifference.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-3 text-primary">
                          ${benchmark.final_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right py-3 px-3 font-medium ${isValueOutperforming ? 'text-green-400' : 'text-red-400'}`}>
                          {isValueOutperforming ? '+' : ''}${valueDifference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="text-right py-3 px-3 text-primary">
                          ${benchmark.projected_annual_dividend_income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right py-3 px-3 font-medium ${isDividendOutperforming ? 'text-green-400' : 'text-red-400'}`}>
                          {isDividendOutperforming ? '+' : ''}${dividendDifference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Value Chart */}
      <div className="card p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-primary">Portfolio Value</h2>
        <div className="h-[280px] sm:h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 9, fill: 'var(--text-secondary)'}}
              angle={-45}
              textAnchor="end"
              height={50}
              interval="preserveStartEnd"
              stroke="var(--border-color)"
              tickMargin={5}
            />
            <YAxis 
              tick={{ fontSize: 9, fill: 'var(--text-secondary)'}}
              stroke="var(--border-color)"
              width={55}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: 'var(--text-primary)', marginBottom: '4px' }}
              formatter={(value) => typeof value === 'number' ? [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`] : value}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
              iconSize={10}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="total_value" 
              stroke="#2563eb" 
              strokeWidth={3}
              name="Portfolio"
              dot={false}
              isAnimationActive={true}
            />
            <Line 
              type="monotone" 
              dataKey="accumulated_dividends" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Dividends"
              dot={false}
              isAnimationActive={true}
            />
            {/* Benchmark Lines */}
            {benchmarks.map((benchmark) => (
              <Line
                key={benchmark.ticker}
                type="monotone"
                dataKey={`benchmark_${benchmark.ticker}`}
                stroke={getBenchmarkColor(benchmark.ticker)}
                strokeWidth={2}
                strokeDasharray="5 5"
                name={benchmark.ticker}
                dot={false}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Share Price Chart */}
      {/*
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Share Performance</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="share_price" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Share Price ($)"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="shares" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Shares Owned"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
       */}
    </div>
  );
}
