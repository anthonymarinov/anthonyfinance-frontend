"use client";

import { useEffect } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-primary border border-primary rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-primary">
          <div className="flex items-center gap-3">
            <img 
              src="/icon.png" 
              alt="AntFinance Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <h2 className="text-xl font-bold text-primary">How to Use AntFinance</h2>
              <p className="text-sm text-secondary">Portfolio Simulator Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="space-y-6">
            {/* What is this */}
            <section>
              <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                What is AntFinance?
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                AntFinance is a portfolio simulator that uses <strong>real historical market data</strong> to show you how your investment portfolio would have performed over a selected time period. Compare your strategy against popular benchmark ETFs like SPY, QQQ, and more.
              </p>
            </section>

            {/* Getting Started */}
            <section>
              <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Getting Started
              </h3>
              <div className="space-y-3 text-sm text-secondary">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-muted">a</span>
                  </div>
                  <p><strong className="text-primary">Add Holdings:</strong> Enter stock/ETF ticker symbols (e.g., AAPL, MSFT, VTI) and their allocation percentages. Allocations should total 100%.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-muted">b</span>
                  </div>
                  <p><strong className="text-primary">Set Starting Value:</strong> Enter how much money you&apos;re starting with (e.g., $10,000).</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-muted">c</span>
                  </div>
                  <p><strong className="text-primary">Choose Time Period:</strong> Select how far back to simulate (1 month to 20 years).</p>
                </div>
              </div>
            </section>

            {/* Advanced Options */}
            <section>
              <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Advanced Options
              </h3>
              <div className="space-y-3 text-sm text-secondary">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p><strong className="text-primary">Personal Contributions:</strong> Simulate regular investments. Enter the amount and frequency in market days (e.g., $500 every 21 days ≈ monthly).</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p><strong className="text-primary">Include Dividends:</strong> Factor in dividend payments from your holdings.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p><strong className="text-primary">DRIP Active:</strong> Dividend Reinvestment Plan — automatically reinvest dividends to buy more shares.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p><strong className="text-primary">Risk-Free Rate:</strong> Used for Sharpe ratio calculation (default 4.5% reflects current treasury yields).</p>
                </div>
              </div>
            </section>

            {/* Understanding Results */}
            <section>
              <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Understanding Your Results
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-secondary border border-primary">
                  <p className="font-medium text-blue-400">Annualized Return</p>
                  <p className="text-secondary text-xs mt-1">Your average yearly return, properly adjusted for contributions using Time-Weighted Return.</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary border border-primary">
                  <p className="font-medium text-green-400">Sharpe Ratio</p>
                  <p className="text-secondary text-xs mt-1">Risk-adjusted return. Higher is better. Above 1.0 is good, above 2.0 is excellent.</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary border border-primary">
                  <p className="font-medium text-purple-400">Final Value</p>
                  <p className="text-secondary text-xs mt-1">Total portfolio value at the end of the simulation period.</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary border border-primary">
                  <p className="font-medium text-yellow-400">Yearly Dividends</p>
                  <p className="text-secondary text-xs mt-1">Projected annual dividend income based on your final holdings.</p>
                </div>
              </div>
            </section>

            {/* Tips */}
            <section className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pro Tips
              </h3>
              <ul className="text-xs text-secondary space-y-1">
                <li>• Compare against benchmarks like SPY (S&P 500) to see if you&apos;re beating the market</li>
                <li>• Green values in the comparison table mean you outperformed that benchmark</li>
                <li>• Use longer time periods (5-10+ years) for more meaningful results</li>
                <li>• Market days ≈ 252 per year, 21 per month</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
