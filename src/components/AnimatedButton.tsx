'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit';
}

export const AnimatedButton = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    className = '',
    type = 'button',
}: AnimatedButtonProps) => {
    const baseStyles =
        'flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors duration-200';

    const variants = {
        primary:
            'bg-[#F97316] text-white hover:bg-[#EA580C] disabled:bg-gray-300 disabled:cursor-not-allowed',
        secondary:
            'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed',
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            whileDrag={{ scale: 1.05, rotate: 2 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17,
            }}
        >
            {children}
        </motion.button>
    );
};

