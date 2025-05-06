import React from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  points: number;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  source: string;
  description: string;
  createdAt: string;
}

interface LoyaltyTransactionsProps {
  transactions: Transaction[];
  className?: string;
}

export function LoyaltyTransactions({ transactions, className = '' }: LoyaltyTransactionsProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Points History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="px-4 py-4 sm:px-6 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {transaction.type === 'earn' || transaction.type === 'bonus' ? (
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  transaction.type === 'earn' || transaction.type === 'bonus'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'earn' || transaction.type === 'bonus' ? '+' : '-'}
                  {Math.abs(transaction.points)} points
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.source}
                </p>
              </div>
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}