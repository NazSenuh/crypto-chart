'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from './AnimatedButton';
import { withdraw } from '@/app/actions/wallet';
import { isValidAddress } from '@/lib/ethereum-utils';
import NumberFlow from '@number-flow/react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  balanceUSD: number;
  balanceEth: number;
}

export const WithdrawModal = ({
  isOpen,
  onClose,
  onSuccess,
  balanceUSD,
  balanceEth,
}: WithdrawModalProps) => {
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const maxAmount = balanceEth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!isValidAddress(toAddress)) {
      setError('Invalid destination address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amountNum > maxAmount) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);

    try {
      const result = await withdraw(amountNum, toAddress);

      if (result.success && result.hash) {
        setTxHash(result.hash);
        onSuccess();
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setAmount('');
      setToAddress('');
      setTxHash(null);
      onClose();
    }
  };

  const handleMaxClick = () => {
    // Leave some for gas (approximately 0.001 ETH)
    const maxSend = Math.max(0, maxAmount - 0.001);
    setAmount(maxSend.toFixed(6));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Withdraw ETH
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {txHash ? (
              // Success state
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Withdrawal Sent!</h3>
                <p className="text-sm text-gray-500 mb-4">Your withdrawal has been submitted to the network.</p>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  View on Etherscan
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <div className="mt-6">
                  <AnimatedButton variant="primary" onClick={handleClose} className="w-full">
                    Close
                  </AnimatedButton>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                  <div className="text-2xl font-bold text-gray-900">
                    <NumberFlow
                      value={balanceUSD}
                      format={{ style: 'currency', currency: 'USD' }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Max: {maxAmount.toFixed(4)} ETH
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Address
                    </label>
                    <input
                      type="text"
                      value={toAddress}
                      onChange={(e) => setToAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ETH)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.0001"
                        min="0"
                        max={maxAmount}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all pr-16"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleMaxClick}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#F97316] hover:text-[#EA580C] transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Server-side Transaction</p>
                        <p className="text-xs text-blue-700 mt-1">
                          This transaction will be signed and sent by our server. Gas fees will be deducted from the withdrawal amount.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      className="text-red-500 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <AnimatedButton
                      variant="secondary"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </AnimatedButton>
                    <AnimatedButton
                      variant="primary"
                      type="submit"
                      disabled={
                        isLoading ||
                        !amount ||
                        !toAddress ||
                        parseFloat(amount) > maxAmount
                      }
                      className="flex-1"
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                      ) : (
                        'Withdraw'
                      )}
                    </AnimatedButton>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
