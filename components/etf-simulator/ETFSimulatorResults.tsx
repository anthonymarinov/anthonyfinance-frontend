"use client";

import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PortfolioSimulatorResponse } from "@/types/PortfolioSimulatorTypes";

interface PortfolioSimulatorResultsProps {
  data: PortfolioSimulatorResponse;
}

export default function PortfolioSimulatorResults({ data }: PortfolioSimulatorResultsProps) {
  // Validate data structure
  if (!data || !data.dates || !Array.isArray(data.dates)) {
    return (
      <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error: Invalid data received from API</p>
        <p className="text-sm mt-1">Expected dates array but got: {JSON.stringify(data)}</p>
      </div>
    );
  }

  // Memoize chart data transformation to prevent recalculation on every render
  const chartData = useMemo(() => {
    // Sample data if there are too many points (keep every nth point for performance)
    const maxPoints = 100;
    const step = Math.ceil(data.dates.length / maxPoints);
    
    return data.dates
      .map((date, index) => ({
        date: new Date(date).toLocaleDateString(),
        total_value: data.total_values[index],
        share_price: data.share_prices[index],
        shares: data.shares[index],
        accumulated_dividends: data.accumulated_dividends[index],
      }))
      .filter((_, index) => index % step === 0 || index === data.dates.length - 1);
  }, [data]);

  return (
    <div className="mt-8 space-y-6">
      {/* Analytics Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Analytics Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Annualized Return</p>
            <p className="text-2xl font-bold text-blue-600">
              {(data.annualized_return * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Sharpe Ratio</p>
            <p className="text-2xl font-bold text-green-600">
              {data.sharpe_ratio.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Value Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Portfolio Value</h2>
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
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total_value" 
              stroke="#2563eb" 
              strokeWidth={2}
              name="Total Value ($)"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="accumulated_dividends" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Dividends ($)"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Share Price Chart */}
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
    </div>
  );
}
