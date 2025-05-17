import { Header } from "@/components/Header";
import { LpPriceCard } from "@/components/LpPriceCard";

export default function LpPricePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl gradient-bg">
        <LpPriceCard />
      </main>
    </div>
  );
}
