import { ethers } from 'ethers';

export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

