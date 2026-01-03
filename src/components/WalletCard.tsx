'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import { AnimatedButton } from './AnimatedButton';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import { getWalletData } from '@/app/actions/wallet';
import { WalletData } from '@/types';
import { formatAddress } from '@/lib/ethereum-utils';

interface WalletCardProps {
    serverAddress: string;
}

export const WalletCard = ({ serverAddress }: WalletCardProps) => {
    const [data, setData] = useState<WalletData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!serverAddress) return;

        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            const walletData = await getWalletData(serverAddress);
            setData(walletData);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [serverAddress]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData(true);
    };

    const handleTransactionSuccess = () => {
        fetchData(true);
    };

    if (isLoading) {
        return (
            <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md min-h-[400px] flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="animate-pulse space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 rounded" />
                                <div className="h-3 w-20 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                    </div>
                    <div className="h-10 w-40 bg-gray-200 rounded" />
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 rounded-xl" />
                        <div className="h-16 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="flex gap-3 mt-auto">
                        <div className="h-12 flex-1 bg-gray-200 rounded-xl" />
                        <div className="h-12 flex-1 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </motion.div>
        );
    }

    if (!data || !serverAddress) {
        return (
            <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration Error</h3>
                    <p className="text-sm text-gray-500">
                        Server wallet is not configured. Please set WALLET_PRIVATE_KEY in environment variables.
                    </p>
                </div>
            </motion.div>
        );
    }

    const isPositive = data.change24h >= 0;

    return (
        <>
            <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                            </svg>
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">My Wallet</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                    title="Refresh"
                                >
                                    <motion.svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        animate={isRefreshing ? { rotate: 360 } : {}}
                                        transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </motion.svg>
                                </motion.button>
                            </div>
                            <p className="text-sm text-gray-500">{data.joinedDate}</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                            <div>
                                <p className="text-gray-400 text-xs">Portfolio (not USDC)</p>
                                <p className="font-semibold text-gray-900">
                                    <NumberFlow
                                        value={data.portfolioValue}
                                        format={{
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2,
                                        }}
                                    />
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">USDC + Portfolio</p>
                                <p className="font-semibold text-gray-900">
                                    <NumberFlow
                                        value={data.portfolioValueWithUSDC}
                                        format={{
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2,
                                        }}
                                    />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                            <NumberFlow
                                value={parseFloat(data.balance)}
                                format={{ minimumFractionDigits: 4, maximumFractionDigits: 4 }}
                            />
                        </span>
                        <span className="text-2xl font-semibold text-gray-500">ETH</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}
                        >
                            {isPositive ? '+' : ''}
                            <NumberFlow
                                value={data.change24h}
                                format={{
                                    style: 'currency',
                                    currency: 'USD',
                                    signDisplay: 'never',
                                }}
                            />
                        </span>
                        <span
                            className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}
                        >
                            {isPositive ? '+' : ''}
                            <NumberFlow
                                value={data.changePercent24h}
                                format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                            />
                            %
                        </span>
                        <span className="text-sm text-gray-400">Today</span>
                    </div>
                </div>

                <div className="mb-6">
                    <a
                        href={`https://etherscan.io/address/${data.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
                    >
                        {formatAddress(data.address)}
                        <svg className="w-3 h-3 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <AnimatedButton
                        variant="primary"
                        onClick={() => setIsDepositOpen(true)}
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                        Deposit
                    </AnimatedButton>
                    <AnimatedButton
                        variant="secondary"
                        onClick={() => setIsWithdrawOpen(true)}
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                        </svg>
                        Withdraw
                    </AnimatedButton>
                </div>
            </motion.div>

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                onSuccess={handleTransactionSuccess}
                currentBalance={data.balanceUSD}
            />

            <WithdrawModal
                isOpen={isWithdrawOpen}
                onClose={() => setIsWithdrawOpen(false)}
                onSuccess={handleTransactionSuccess}
                balanceUSD={data.balanceUSD}
                balanceEth={parseFloat(data.balance)}
            />
        </>
    );
};
