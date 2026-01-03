import { getEnvVar } from '@/common/get-env-var';


export const ETHERSCAN_API_KEY = getEnvVar('ETHERSCAN_API_KEY');
export const WALLET_PRIVATE_KEY = getEnvVar('WALLET_PRIVATE_KEY');
export const ETHEREUM_RPC_URL = getEnvVar('ETHEREUM_RPC_URL');
export const CHAIN_ID = 1; 

export const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';

export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const USDC_DECIMALS = 6;

