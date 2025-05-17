
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) return "0.00";
  
  if (num > 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  
  if (num > 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  
  if (num < 0.00001) {
    return "< 0.00001";
  }
  
  return num.toFixed(5).replace(/\.?0+$/, "");
}
