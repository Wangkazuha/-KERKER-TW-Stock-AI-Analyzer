
export interface StockData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  updateTime: string;
  marketCap?: string;
  peRatio?: string; // Price-to-Earnings
  pbRatio?: string; // Price-to-Book
  dividendYield?: string;
  sector?: string;
  
  // Removed manual priceHistory array as we use TradingView widget
  
  // Financials
  eps?: string;
  
  // New metrics requested for charts
  // 12 Months of Revenue
  revenueHistory: Array<{
    date: string; // e.g. "2023/10"
    revenue: number; // Amount (usually in Billions or Millions)
    mom: string; // Month over Month %
    yoy: string; // Year over Year %
  }>;

  // 8 Quarters of Margins
  marginHistory: Array<{
    quarter: string; // e.g. "23Q4"
    operatingMargin: number; // %
    netProfitMargin: number; // %
  }>;
  
  // Analysis
  aiSummary: string;
  
  // News
  news: Array<{
    title: string;
    source: string;
    date: string;
    url: string;
  }>;
  
  // Sources utilized by Grounding
  sourceUrls: Array<{ title: string; uri: string }>;
}

export interface SearchState {
  query: string;
  loading: boolean;
  error: string | null;
  data: StockData | null;
}
