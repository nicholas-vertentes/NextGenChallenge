export type Holding = {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  quantity: number;
  price: number;
  costBasisPerShare: number;
  marketValue: number;
  gainLoss: number;
  dayChangeAmount: number;
  dayChangePercent: number;
  weightPercent: number;
};

export type PortfolioSummary = {
  portfolioId: string;
  accountId: string;
  clientId: string;
  label: string;
  currency: string;
  totalMarketValue: number;
  dayChangeAmount: number;
  dayChangePercent: number;
  totalReturnSinceInception: number;
};

export type AllocationEntry = {
  assetClass: string;
  value: number;
};

export type PerformancePoint = {
  date: string;
  marketValue: number;
};

export type PortfolioResponse = {
  asOf: string;
  portfolio: PortfolioSummary;
  holdings: Holding[];
  allocation: AllocationEntry[];
  performanceHistory: PerformancePoint[];
};
