import React, { useState, useEffect } from 'react';
import { Shield, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { trustScoreService, TrustScoreBreakdown } from '../services/trustScoreService';

interface TrustScoreDisplayProps {
  userId: string;
  showBreakdown?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function TrustScoreDisplay({ userId, showBreakdown = false, size = 'medium' }: TrustScoreDisplayProps) {
  const [trustScore, setTrustScore] = useState<TrustScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

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
    return 'text-red-500 bg-red-100';
  };

  const getTrustScoreLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
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
    <div className={`flex items-center space-x-2 ${sizeClasses[size]}`}>
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrustScoreColor(trustScore.total)}`}>
        {getScoreIcon(trustScore.total)}
        <span className="font-medium">{trustScore.total}</span>
      </div>
      <span className="text-gray-600">{getTrustScoreLevel(trustScore.total)}</span>
    </div>
  );
}