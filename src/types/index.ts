export interface WalletData {
  address: string;
  balance: string;
  balanceUSD: number;
  portfolioValue: number; 
  portfolioValueWithUSDC: number; 
  change24h: number;
  changePercent24h: number;
  joinedDate: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  type: 'in' | 'out';
  contractAddress?: string;
}

export interface PricePoint {
  timestamp: number;
  date: string;
  value: number;
  profit: number;
}

export interface ProfitLossData {
  currentValue: number;
  totalProfit: number;
  percentChange: number;
  period: TimePeriod;
  chartData: PricePoint[];
}

export type TimePeriod = '1H' | '6H' | '1D' | '1W' | '1M' | 'All';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  publicKey: string;
}

export interface EtherscanBalanceResponse {
  status: string;
  message: string;
  result: string;
}

export interface EtherscanTxListResponse {
  status: string;
  message: string;
  result: Transaction[];
}

export interface EtherscanPriceResponse {
  status: string;
  message: string;
  result: {
    ethbtc: string;
    ethbtc_timestamp: string;
    ethusd: string;
    ethusd_timestamp: string;
  };
}

export interface EtherscanTokenBalanceResponse {
  status: string;
  message: string;
  result: string;
}

export interface EtherscanTokenTxResponse {
  status: string;
  message: string;
  result: TokenTransaction[];
}

export interface TokenTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

