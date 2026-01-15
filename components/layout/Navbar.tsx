"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import HelpModal from "./HelpModal";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
    <nav className="bg-primary border-b border-primary">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/icon.png" 
              alt="AntFinance Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-lg font-semibold text-primary">
              <span className="hidden sm:inline">AntFinance</span>
              <span className="sm:hidden">AF</span>
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Help button */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-2 rounded-lg bg-secondary border border-primary hover:bg-tertiary transition-all duration-200 hover:scale-105"
              aria-label="Help"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary border border-primary hover:bg-tertiary transition-all duration-200 hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
    <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
