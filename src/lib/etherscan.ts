import {
  EtherscanBalanceResponse,
  EtherscanTxListResponse,
  EtherscanPriceResponse,
  EtherscanTokenBalanceResponse,
  EtherscanTokenTxResponse,
  Transaction,
  TokenTransaction,
} from '@/types';
import {
  ETHERSCAN_API_KEY,
  ETHERSCAN_API_URL,
  CHAIN_ID,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from './consts';
import { fetchWithRetry } from '@/common/fetch-with-retry';

export const getBalance = async (address: string): Promise<string> => {
  const url = `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;

  const data = await fetchWithRetry<EtherscanBalanceResponse>(url, { next: { revalidate: 60 } } as RequestInit);

  return data.result;
};

export const getTransactions = async (
  address: string,
  startBlock: number = 0,
  endBlock: string = 'latest',
  sort: 'asc' | 'desc' = 'desc'
): Promise<Transaction[]> => {
  const url = `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=1000&sort=${sort}&apikey=${ETHERSCAN_API_KEY}`;

  const data = await fetchWithRetry<EtherscanTxListResponse>(url, { next: { revalidate: 60 } } as RequestInit);

  if (data.status !== '1') {
    throw new Error(`EtherScan API Error: ${data.message}`);
  }

  const transactions = data.result || [];
  
  return transactions.map((tx) => ({
    ...tx,
    type: tx.to.toLowerCase() === address.toLowerCase() ? 'in' : 'out',
  }));
};

export const getEthPrice = async (): Promise<number> => {
  const url = `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}`;

  const data = await fetchWithRetry<EtherscanPriceResponse>(url, { next: { revalidate: 60 } } as RequestInit);

  if (data.status !== '1') {
    throw new Error(`EtherScan API Error: ${data.message}`);
  }

  return parseFloat(data.result.ethusd);
};

export const weiToEth = (wei: string): number => parseFloat(wei) / 1e18;

export const ethToWei = (eth: number): string => (eth * 1e18).toString();

export const getUSDCBalance = async (address: string): Promise<string> => {
  const url = `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${USDC_ADDRESS}&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;

  const data = await fetchWithRetry<EtherscanTokenBalanceResponse>(url, { next: { revalidate: 60 } } as RequestInit);

  if (data.status !== '1') {
    throw new Error(`EtherScan API Error: ${data.message}`);
  }

  return data.result;
};

export const getUSDCTransactions = async (
  address: string,
  startBlock: number = 0,
  endBlock: string = 'latest',
  sort: 'asc' | 'desc' = 'desc'
): Promise<TokenTransaction[]> => {
  const url = `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=tokentx&contractaddress=${USDC_ADDRESS}&address=${address}&page=1&offset=1000&startblock=${startBlock}&endblock=${endBlock}&sort=${sort}&apikey=${ETHERSCAN_API_KEY}`;

  const data = await fetchWithRetry<EtherscanTokenTxResponse>(url, { next: { revalidate: 60 } } as RequestInit);

  if (data.status !== '1') {
    throw new Error(`EtherScan API Error: ${data.message}`);
  }

  return data.result || [];
};

export const usdcToNumber = (usdc: string): number => parseFloat(usdc) / Math.pow(10, USDC_DECIMALS);

