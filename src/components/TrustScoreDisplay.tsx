import React, { useState, useEffect } from 'react';
import { Shield, Star, CheckCircle, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { trustScoreService, TrustScoreBreakdown } from '../services/trustScoreService';

interface TrustScoreDisplayProps {
  userId: string;
  showBreakdown?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function TrustScoreDisplay({ userId, showBreakdown = false, size = 'medium' }: TrustScoreDisplayProps) {
  const [trustScore, setTrustScore] = useState<TrustScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadTrustScore();
  }, [userId]);

  const loadTrustScore = async () => {
    try {
      const score = await trustScoreService.calculateTrustScore(userId);
      setTrustScore(score);
    } catch (error) {
      console.error('Error loading trust score:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-green-500 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 50) return 'text-red-500 bg-red-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrustScoreLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={16} />;
    if (score >= 60) return <Star size={16} />;
    return <AlertTriangle size={16} />;
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!trustScore) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Shield size={16} />
        <span className="text-sm">No score</span>
      </div>
    );
  }

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className="relative">
      <div 
        className={`flex items-center space-x-2 cursor-pointer ${sizeClasses[size]}`}
        onClick={() => showBreakdown && setShowDetails(!showDetails)}
      >
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrustScoreColor(trustScore.total)}`}>
          {getScoreIcon(trustScore.total)}
          <span className="font-medium">{trustScore.total}</span>
        </div>
        <span className="text-gray-600">{getTrustScoreLevel(trustScore.total)}</span>
        {showBreakdown && (
          <Info size={14} className="text-gray-400" />
        )}
      </div>

      {showDetails && showBreakdown && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-80">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>Trust Score Breakdown</span>
              </h4>
              <span className={`font-bold ${getTrustScoreColor(trustScore.total).split(' ')[0]}`}>
                {trustScore.total}/100
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verification (20%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${trustScore.verification}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{trustScore.verification}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Endorsements (25%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${trustScore.endorsement}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{trustScore.endorsement}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reputation (30%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${trustScore.reputation}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{trustScore.reputation}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disputes (10%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${100 - trustScore.dispute}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{trustScore.dispute}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Behavior (15%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${trustScore.behavior}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{trustScore.behavior}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Trust scores are updated based on your activity and community feedback.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}