
import { Header } from "@/components/Header";
import { SwapCard } from "@/components/SwapCard";

export default function SwapPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl gradient-bg">
        <SwapCard />
      </main>
    </div>
  );
}
