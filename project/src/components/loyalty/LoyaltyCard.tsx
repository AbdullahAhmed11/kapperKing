import React from 'react';
import { Star, Gift, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LoyaltyCardProps {
  clientName: string;
  points: number;
  pointsValue: number;
  lastActivity?: string;
  className?: string;
}

export function LoyaltyCard({ clientName, points, pointsValue, lastActivity, className = '' }: LoyaltyCardProps) {
  return (
    <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <Star className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-medium">{clientName}</h3>
          <p className="text-indigo-100">Loyalty Member</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{points}</div>
          <p className="text-indigo-100">Points</p>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-indigo-400/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Gift className="h-4 w-4 mr-2" />
            <span>Value: {formatCurrency(pointsValue)}</span>
          </div>
          {lastActivity && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Last Activity: {lastActivity}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}