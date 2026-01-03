'use server';

import {
  getBalance,
  getTransactions,
  getEthPrice,
  weiToEth,
  getUSDCBalance,
  usdcToNumber,
} from '@/lib/etherscan';
import {
  sendTransactionFromServer,
  getServerWalletAddress,
  getServerWalletBalance,
} from '@/lib/ethereum';
import { serverCache } from '@/lib/cache';
import {
  WalletData,
  ProfitLossData,
  PricePoint,
  TimePeriod,
  TransactionResult,
} from '@/types';
import { format } from 'date-fns';
import { isValidAddress } from '@/lib/ethereum-utils';

const getTimestampForPeriod = (period: TimePeriod): number => {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  switch (period) {
    case '1H':
      return now - hour;
    case '6H':
      return now - 6 * hour;
    case '1D':
      return now - day;
    case '1W':
      return now - 7 * day;
    case '1M':
      return now - 30 * day;
    case 'All':
      return 0; 
    default:
      return now - day;
  }
};

const fetchWalletDataInternal = async (address: string): Promise<WalletData> => {
  // Послідовні запити з затримкою, щоб не перевищити rate limit (3-5 запитів/сек)
  const balanceWei = await getBalance(address);
  await new Promise(resolve => setTimeout(resolve, 350)); // ~2.8 запитів/сек
  
  const ethPrice = await getEthPrice();
  await new Promise(resolve => setTimeout(resolve, 350));
  
  const transactions = await getTransactions(address);
  await new Promise(resolve => setTimeout(resolve, 350));
  
  const usdcBalanceWei = await getUSDCBalance(address).catch(() => '0');

  const balanceEth = weiToEth(balanceWei);
  const balanceUSD = balanceEth * ethPrice;
  
  const usdcBalance = usdcToNumber(usdcBalanceWei);
  const usdcBalanceUSD = usdcBalance;

  const portfolioValue = balanceUSD;
  
  const portfolioValueWithUSDC = balanceUSD + usdcBalanceUSD;

  const oneDayAgo = Date.now() / 1000 - 24 * 60 * 60;
  const recentTxs = transactions.filter(
    (tx) => parseInt(tx.timeStamp) > oneDayAgo
  );

  let change24h = 0;
  recentTxs.forEach((tx) => {
    const value = weiToEth(tx.value);
    if (tx.type === 'in') {
      change24h += value;
    } else {
      change24h -= value;
    }
  });

  const change24hUSD = change24h * ethPrice;
  const previousBalance = balanceEth - change24h;
  let changePercent24h = 0;
  if (previousBalance > 0) {
    changePercent24h = (change24h / previousBalance) * 100;
  } else if (change24h > 0) {
    changePercent24h = 100;
  }

  const earliestTx = transactions[transactions.length - 1];
  const joinedDate = earliestTx
    ? format(new Date(parseInt(earliestTx.timeStamp) * 1000), 'MMM yyyy')
    : format(new Date(), 'MMM yyyy');

  return {
    address,
    balance: balanceEth.toFixed(4),
    balanceUSD,
    portfolioValue,
    portfolioValueWithUSDC,
    change24h: change24hUSD,
    changePercent24h,
    joinedDate: `Joined ${joinedDate}`,
  };
};

export const getWalletData = async (walletAddress: string): Promise<WalletData> => {
  if (!walletAddress || !isValidAddress(walletAddress)) {
    return {
      address: walletAddress || '',
      balance: '0',
      balanceUSD: 0,
      portfolioValue: 0,
      portfolioValueWithUSDC: 0,
      change24h: 0,
      changePercent24h: 0,
      joinedDate: 'Not connected',
    };
  }

  const address = walletAddress;

  const cached = serverCache.get<WalletData>(address, 'walletData');
  if (cached) {
    return cached;
  }

  try {
    const walletData = await fetchWalletDataInternal(address);
    serverCache.set(address, 'walletData', walletData);
    return walletData;
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return {
      address,
      balance: '0',
      balanceUSD: 0,
      portfolioValue: 0,
      portfolioValueWithUSDC: 0,
      change24h: 0,
      changePercent24h: 0,
      joinedDate: 'Joined JAN 2026',
    };
  }
};

const fetchProfitLossInternal = async (address: string, period: TimePeriod): Promise<ProfitLossData> => {
  const fromTimestamp = getTimestampForPeriod(period);
  const toTimestamp = Date.now();

  // Послідовні запити з затримкою, щоб не перевищити rate limit
  const balanceWei = await getBalance(address);
  await new Promise(resolve => setTimeout(resolve, 350));
  
  const ethPrice = await getEthPrice();
  await new Promise(resolve => setTimeout(resolve, 350));
  
  const transactions = await getTransactions(address);

  const currentBalance = weiToEth(balanceWei);
  const currentValueUSD = currentBalance * ethPrice;

  const fromTimestampSec = fromTimestamp / 1000;
  const relevantTxs = period === 'All' 
    ? transactions 
    : transactions.filter((tx) => parseInt(tx.timeStamp) >= fromTimestampSec);

  let netChangeEth = 0;
  relevantTxs.forEach((tx) => {
    const value = weiToEth(tx.value);
    if (tx.type === 'in') {
      netChangeEth += value;
    } else {
      netChangeEth -= value;
    }
  });

  const startBalance = currentBalance - netChangeEth;
  const startValueUSD = startBalance * ethPrice;
  const totalProfitUSD = netChangeEth * ethPrice;
  const percentChange = startValueUSD > 0 ? (totalProfitUSD / startValueUSD) * 100 : 0;

  const chartData: PricePoint[] = [];
  let runningBalance = startBalance;

  const maxChartPoints = period === 'All' ? 200 : Infinity;
  const sortedTxs = relevantTxs.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));
  
  let txsToProcess = sortedTxs;
  if (sortedTxs.length > maxChartPoints) {
    const step = Math.floor(sortedTxs.length / maxChartPoints);
    txsToProcess = sortedTxs.filter((_, index) => index % step === 0 || index === sortedTxs.length - 1);
  }

  const startChartTimestamp = period === 'All' && sortedTxs.length > 0
    ? parseInt(sortedTxs[0].timeStamp) * 1000
    : fromTimestamp;
  
  chartData.push({
    timestamp: startChartTimestamp,
    date: format(new Date(startChartTimestamp), 'MMM dd, yyyy'),
    value: Math.round(startBalance * ethPrice * 100) / 100,
    profit: 0,
  });

  txsToProcess.forEach((tx) => {
    const value = weiToEth(tx.value);
    if (tx.type === 'in') {
      runningBalance += value;
    } else {
      runningBalance -= value;
    }

    const valueUSD = runningBalance * ethPrice;
    const profitUSD = (runningBalance - startBalance) * ethPrice;

    chartData.push({
      timestamp: parseInt(tx.timeStamp) * 1000,
      date: format(new Date(parseInt(tx.timeStamp) * 1000), 'MMM dd, HH:mm'),
      value: Math.round(valueUSD * 100) / 100,
      profit: Math.round(profitUSD * 100) / 100,
    });
  });

  chartData.push({
    timestamp: toTimestamp,
    date: format(new Date(toTimestamp), 'MMM dd, HH:mm'),
    value: Math.round(currentValueUSD * 100) / 100,
    profit: Math.round(totalProfitUSD * 100) / 100,
  });

  return {
    currentValue: Math.round(currentValueUSD * 100) / 100,
    totalProfit: Math.round(totalProfitUSD * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100,
    period,
    chartData,
  };
};

export const getProfitLoss = async (walletAddress: string, period: TimePeriod): Promise<ProfitLossData> => {
  if (!walletAddress || !isValidAddress(walletAddress)) {
    return {
      currentValue: 0,
      totalProfit: 0,
      percentChange: 0,
      period,
      chartData: [],
    };
  }

  const address = walletAddress;

  const cached = serverCache.get<ProfitLossData>(address, 'profitLoss', period);
  if (cached) {
    return cached;
  }

  try {
    const profitLossData = await fetchProfitLossInternal(address, period);
    serverCache.set(address, 'profitLoss', profitLossData, period);
    return profitLossData;
  } catch (error) {
    console.error('Error fetching profit/loss:', error);
    return {
      currentValue: 0,
      totalProfit: 0,
      percentChange: 0,
      period,
      chartData: [],
    };
  }
};

export const refreshData = async (walletAddress: string): Promise<void> => {
  if (walletAddress && isValidAddress(walletAddress)) {
    serverCache.invalidate(walletAddress);
  }
};

export const getCentralizedWalletBalance = async (): Promise<{
  balanceEth: string;
  balanceUSD: number;
}> => {
  try {
    const balanceEth = await getServerWalletBalance();
    const ethPrice = await getEthPrice();
    return {
      balanceEth,
      balanceUSD: parseFloat(balanceEth) * ethPrice,
    };
  } catch {
    return { balanceEth: '0', balanceUSD: 0 };
  }
};

export const withdraw = async (
  amount: number,
  toAddress: string
): Promise<TransactionResult> => {
  if (!isValidAddress(toAddress)) {
    return {
      success: false,
      error: 'Invalid destination address',
    };
  }

  if (amount <= 0) {
    return {
      success: false,
      error: 'Amount must be greater than 0',
    };
  }

  try {
    const balanceEth = await getServerWalletBalance();
    if (parseFloat(balanceEth) < amount) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${balanceEth} ETH`,
      };
    }

    const result = await sendTransactionFromServer(toAddress, amount);

    if (result.success) {
      const serverAddress = await getServerWalletAddress();
      serverCache.invalidate(serverAddress);
    }

    return result;
  } catch (error) {
    console.error('Withdraw error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
};
