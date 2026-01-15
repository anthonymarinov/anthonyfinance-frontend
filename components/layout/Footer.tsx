"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-primary mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <img 
                src="/icon.png" 
                alt="AntFinance Logo" 
                className="w-6 h-6 rounded-md"
              />
              <span className="font-semibold text-primary">AntFinance</span>
            </div>
            <p className="text-sm text-secondary text-center md:text-left">
              Simulate and analyze your investment portfolio
            </p>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted">
            © {currentYear} AntFinance
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t border-secondary">
          <p className="text-xs text-muted text-center">
            Disclaimer: This tool is for educational and informational purposes only. 
            Past performance does not guarantee future results. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
