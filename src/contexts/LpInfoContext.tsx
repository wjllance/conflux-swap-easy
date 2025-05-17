import { createContext, useContext, useState, ReactNode } from "react";

interface LpInfo {
  price: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  lastPrice?: string;
  priceChange?: number;
}

interface LpInfoContextType {
  lpInfos: { [key: string]: LpInfo };
  setLpInfos: (infos: { [key: string]: LpInfo }) => void;
  updateLpInfo: (address: string, info: LpInfo) => void;
}

const LpInfoContext = createContext<LpInfoContextType | undefined>(undefined);

export function LpInfoProvider({ children }: { children: ReactNode }) {
  const [lpInfos, setLpInfos] = useState<{ [key: string]: LpInfo }>({});

  const updateLpInfo = (address: string, info: LpInfo) => {
    setLpInfos((prev) => ({
      ...prev,
      [address]: info,
    }));
  };

  return (
    <LpInfoContext.Provider value={{ lpInfos, setLpInfos, updateLpInfo }}>
      {children}
    </LpInfoContext.Provider>
  );
}

export function useLpInfo() {
  const context = useContext(LpInfoContext);
  if (context === undefined) {
    throw new Error("useLpInfo must be used within a LpInfoProvider");
  }
  return context;
}
