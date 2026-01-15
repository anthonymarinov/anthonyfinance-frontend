import PortfolioSimulatorInput from "@/components/portfolio-simulator/PortfolioSimulatorInput";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-primary flex flex-col transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 py-6 md:py-8">
        <PortfolioSimulatorInput />
      </main>

      <Footer />
    </div>
  );
}
