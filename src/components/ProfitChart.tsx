'use client';

import { useState, useCallback } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import { PricePoint, TimePeriod } from '@/types';

interface ProfitChartProps {
    data: PricePoint[];
    onHoverValue: (value: number | null, date: string | null) => void;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: PricePoint }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100"
            >
                <p className="text-xs text-gray-500">{data.date}</p>
                <p className="text-sm font-semibold text-gray-900">
                    ${data.value.toLocaleString()}
                </p>
                <p
                    className={`text-xs ${data.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                    {data.profit >= 0 ? '+' : ''}${data.profit.toLocaleString()}
                </p>
            </motion.div>
        );
    }
    return null;
};

export const ProfitChart = ({ data, onHoverValue }: ProfitChartProps) => {
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = useCallback(
        (nextState: unknown) => {
            const state = nextState as { activePayload?: Array<{ payload: PricePoint }> } | null;
            if (state?.activePayload?.[0]) {
                const point = state.activePayload[0].payload;
                onHoverValue(point.profit, point.date);
                setIsHovering(true);
            }
        },
        [onHoverValue]
    );

    const handleMouseLeave = useCallback(() => {
        onHoverValue(null, null);
        setIsHovering(false);
    }, [onHoverValue]);

    if (!data || data.length === 0) {
        return (
            <div className="h-32 flex items-center justify-center text-gray-400">
                No data available
            </div>
        );
    }

    const lastProfit = data[data.length - 1]?.profit || 0;
    const isPositive = lastProfit >= 0;
    const gradientId = isPositive ? 'profitGradient' : 'lossGradient';
    const lineColor = isPositive ? '#F97316' : '#EF4444';
    const gradientStart = isPositive
        ? 'rgba(249, 115, 22, 0.3)'
        : 'rgba(239, 68, 68, 0.3)';
    const gradientEnd = isPositive
        ? 'rgba(249, 115, 22, 0)'
        : 'rgba(239, 68, 68, 0)';

    return (
        <motion.div
            className="h-32 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={gradientStart} />
                            <stop offset="100%" stopColor={gradientEnd} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                            stroke: lineColor,
                            strokeWidth: 1,
                            strokeDasharray: '4 4',
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={lineColor}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        animationDuration={1000}
                        animationEasing="ease-out"
                    />
                </AreaChart>
            </ResponsiveContainer>

            <AnimatePresence>
                {isHovering && (
                    <motion.div
                        className="absolute bottom-2 right-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="w-2 h-2 bg-[#F97316] rounded-full animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface ChartValueDisplayProps {
    value: number | null;
    date: string | null;
    defaultValue: number;
    period: TimePeriod;
}

const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
        case '1H':
            return 'Past Hour';
        case '6H':
            return 'Past 6 Hours';
        case '1D':
            return 'Past Day';
        case '1W':
            return 'Past Week';
        case '1M':
            return 'Past Month';
        case 'All':
            return 'All Time';
        default:
            return 'Past Day';
    }
};

export const ChartValueDisplay = ({
    value,
    date,
    defaultValue,
    period,
}: ChartValueDisplayProps) => {
    const displayValue = value !== null ? value : defaultValue;
    const isPositive = displayValue >= 0;
    const defaultLabel = getPeriodLabel(period);

    return (
        <div>
            <motion.div
                className={`text-3xl font-bold ${isPositive ? 'text-gray-900' : 'text-red-500'}`}
                key={displayValue}
                initial={{ opacity: 0.5, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {isPositive ? '+' : ''}
                <NumberFlow
                    value={displayValue}
                    format={{
                        style: 'currency',
                        currency: 'USD',
                        signDisplay: 'never',
                    }}
                />
            </motion.div>
            <AnimatePresence mode="wait">
                <motion.p
                    key={date || 'default'}
                    className="text-sm text-gray-400 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    {date || defaultLabel}
                </motion.p>
            </AnimatePresence>
        </div>
    );
};

