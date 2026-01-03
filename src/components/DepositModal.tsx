'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from './AnimatedButton';
import { getServerWalletAddress } from '@/lib/ethereum';
import NumberFlow from '@number-flow/react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
}

export const DepositModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance,
}: DepositModalProps) => {
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const isLoading = isOpen && !hasLoaded;

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const fetchAddress = async () => {
      try {
        const address = await getServerWalletAddress();
        if (!cancelled) {
          setDepositAddress(address);
          setHasLoaded(true);
        }
      } catch (error) {
        console.log('Error getting deposit address:', error);
        if (!cancelled) {
          setHasLoaded(true);
        }
      }
    };

    fetchAddress();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleCopy = async () => {
    if (depositAddress) {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCopied(false);
    setHasLoaded(false);
    setDepositAddress('');
    onClose();
  };

  const handleDone = () => {
    onSuccess();
    handleClose();
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
                Deposit ETH
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

            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Current Balance</p>
              <div className="text-2xl font-bold text-gray-900">
                <NumberFlow
                  value={currentBalance}
                  format={{ style: 'currency', currency: 'USD' }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Send ETH to this address
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Transfer ETH from your wallet (MetaMask, etc.) to the address below
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <motion.div
                    className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Deposit Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                      {depositAddress}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="flex-shrink-0 p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {copied && (
                    <motion.p
                      className="text-xs text-green-500 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Address copied to clipboard!
                    </motion.p>
                  )}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Important</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Only send ETH on Ethereum Mainnet. Sending other tokens or using wrong network may result in loss of funds.
                    </p>
                  </div>
                </div>
              </div>

              {depositAddress && (
                <a
                  href={`https://etherscan.io/address/${depositAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm text-orange-500 hover:text-orange-600 transition-colors"
                >
                  View on Etherscan →
                </a>
              )}

              <div className="pt-2">
                <AnimatedButton
                  variant="primary"
                  onClick={handleDone}
                  className="w-full"
                >
                  Done
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
