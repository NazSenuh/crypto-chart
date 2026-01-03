'use server';

import { ethers } from 'ethers';
import { TransactionResult } from '@/types';

const getWalletPrivateKey = (): string => {
  const key = process.env.WALLET_PRIVATE_KEY;
  if (!key) {
    throw new Error('WALLET_PRIVATE_KEY is not defined');
  }
  return key;
};

const getEthereumRpcUrl = (): string => {
  const url = process.env.ETHEREUM_RPC_URL;
  if (!url) {
    throw new Error('ETHEREUM_RPC_URL is not defined');
  }
  return url;
};

const getProvider = (): ethers.JsonRpcProvider => 
  new ethers.JsonRpcProvider(getEthereumRpcUrl());

const getServerWallet = (): ethers.Wallet => {
  const provider = getProvider();
  return new ethers.Wallet(getWalletPrivateKey(), provider);
};

export const getServerWalletAddress = async (): Promise<string> => {
  try {
    const wallet = new ethers.Wallet(getWalletPrivateKey());
    return wallet.address;
  } catch {
    return '';
  }
};

export const sendTransactionFromServer = async (
  toAddress: string,
  amountEth: number
): Promise<TransactionResult> => {
  try {
    const wallet = getServerWallet();
    const amountWei = ethers.parseEther(amountEth.toString());

    const balance = await wallet.provider?.getBalance(wallet.address);
    if (!balance || balance < amountWei) {
      return {
        success: false,
        error: 'Insufficient balance in server wallet',
      };
    }

    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: amountWei,
    });

    const receipt = await tx.wait();

    if (!receipt) {
      return {
        success: false,
        error: 'Transaction failed - no receipt',
      };
    }

    return {
      success: true,
      hash: receipt.hash,
    };
  } catch (error: unknown) {
    const err = error as { message: string };
    console.log('Server transaction error:', error);
    return {
      success: false,
      error: err.message || 'Transaction failed',
    };
  }
};

export const getServerWalletBalance = async (): Promise<string> => {
  const wallet = getServerWallet();
  const balance = await wallet.provider?.getBalance(wallet.address);
  return balance ? ethers.formatEther(balance) : '0';
};

export const estimateGas = async (
  toAddress: string,
  amountEth: number
): Promise<{ gasLimit: bigint; gasPrice: bigint; totalCostEth: number }> => {
  const provider = getProvider();
  const amountWei = ethers.parseEther(amountEth.toString());

  const gasLimit = await provider.estimateGas({
    to: toAddress,
    value: amountWei,
  });

  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || BigInt(0);

  const totalCostWei = gasLimit * gasPrice;
  const totalCostEth = parseFloat(ethers.formatEther(totalCostWei));

  return {
    gasLimit,
    gasPrice,
    totalCostEth,
  };
};


