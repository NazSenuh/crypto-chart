'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ProfitChart, ChartValueDisplay } from './ProfitChart';
import { getProfitLoss } from '@/app/actions/wallet';
import { ProfitLossData, TimePeriod } from '@/types';

const TIME_PERIODS: TimePeriod[] = ['1H', '6H', '1D', '1W', '1M', 'All'];

interface ProfitLossCardProps {
    walletAddress: string;
    initialData?: ProfitLossData;
}

export const ProfitLossCard = ({ walletAddress, initialData }: ProfitLossCardProps) => {
    const [data, setData] = useState<ProfitLossData | null>(initialData || null);
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6H');
    const [isLoading, setIsLoading] = useState(!initialData);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [hoverDate, setHoverDate] = useState<string | null>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        if (!walletAddress) return;

        console.log('[ProfitLossCard] useEffect triggered for period:', selectedPeriod);
        const currentRequestId = ++requestIdRef.current;
        setIsLoading(true);

        const fetchData = async () => {
            try {
                console.log('[ProfitLossCard] Fetching data for period:', selectedPeriod);
                const profitLossData = await getProfitLoss(walletAddress, selectedPeriod);
                // Only update if this is still the latest request
                if (currentRequestId === requestIdRef.current) {
                    console.log('[ProfitLossCard] Data received for period:', selectedPeriod);
                    setData(profitLossData);
                }
            } catch (error) {
                if (currentRequestId === requestIdRef.current) {
                    console.error('Error fetching profit/loss data:', error);
                }
            } finally {
                if (currentRequestId === requestIdRef.current) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [selectedPeriod, walletAddress]);

    const handleRefresh = async () => {
        if (!walletAddress) return;
        const currentRequestId = ++requestIdRef.current;
        setIsLoading(true);
        try {
            const profitLossData = await getProfitLoss(walletAddress, selectedPeriod);
            if (currentRequestId === requestIdRef.current) {
                setData(profitLossData);
            }
        } catch (error) {
            if (currentRequestId === requestIdRef.current) {
                console.error('Error fetching profit/loss data:', error);
            }
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    };

    const handlePeriodChange = (period: TimePeriod) => {
        console.log('[ProfitLossCard] Period changed to:', period);
        setSelectedPeriod(period);
        setHoverValue(null);
        setHoverDate(null);
    };

    const handleHoverValue = (value: number | null, date: string | null) => {
        setHoverValue(value);
        setHoverDate(date);
    };

    if (isLoading && !data) {
        return (
            <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md min-h-[400px] flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="animate-pulse space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-6 w-8 bg-gray-200 rounded" />
                            ))}
                        </div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded" />
                    <div className="h-32 bg-gray-200 rounded flex-1" />
                </div>
            </motion.div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <motion.span
                        className="text-sm font-medium text-gray-600"
                        whileHover={{ scale: 1.02 }}
                    >
                        ● Profit/Loss
                    </motion.span>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleRefresh}
                        className="text-gray-400 hover:text-gray-600"
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </motion.button>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 relative z-10">
                    {TIME_PERIODS.map((period) => (
                        <button
                            key={period}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[ProfitLossCard] Button clicked:', period);
                                handlePeriodChange(period);
                            }}
                            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors min-w-[32px] relative z-10 ${selectedPeriod === period
                                ? 'bg-[#BBF7D0] text-green-800'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Value Display */}
            <div className="mb-4">
                <ChartValueDisplay
                    value={hoverValue}
                    date={hoverDate}
                    defaultValue={data.totalProfit}
                    period={selectedPeriod}
                />
            </div>

            {/* Chart */}
            <div className="relative">
                {isLoading && (
                    <motion.div
                        className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                    </motion.div>
                )}
                <ProfitChart data={data.chartData} onHoverValue={handleHoverValue} />
            </div>

            {/* Decorative Element */}
            <motion.div
                className="absolute top-4 right-4 opacity-10 pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <svg
                    className="w-16 h-16 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
            </motion.div>
        </motion.div>
    );
};
