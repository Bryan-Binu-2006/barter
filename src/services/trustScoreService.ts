import { LocalStorageManager } from '../lib/localStorage';

export interface UserStats {
  completedExchanges: number;
  totalRating: number;
  ratingCount: number;
  disputes: number;
  endorsements: number;
  verifications: {
    email: boolean;
    phone: boolean;
    id: boolean;
    address: boolean;
  };
  behaviorScore: number;
  lastLogin: string;
  responseRate: number;
  ruleViolations: number;
}

export interface TrustScoreBreakdown {
  verification: number;
  endorsement: number;
  reputation: number;
  dispute: number;
  behavior: number;
  total: number;
}

class TrustScoreService {
  // Weights for trust score calculation
  private readonly WEIGHTS = {
    verification: 0.20,
    endorsement: 0.25,
    reputation: 0.30,
    dispute: 0.10,
    behavior: 0.15
  };

  private readonly MAX_ENDORSEMENTS_EXPECTED = 10;

  async getUserStats(userId: string): Promise<UserStats> {
    const defaultStats: UserStats = {
      completedExchanges: 0,
      totalRating: 0,
      ratingCount: 0,
      disputes: 0,
      endorsements: 0,
      verifications: { email: true, phone: false, id: false, address: false }, // Email verified by default
      behaviorScore: 0.9, // Start higher for new users
      lastLogin: new Date().toISOString(),
      responseRate: 1.0,
      ruleViolations: 0
    };

    return LocalStorageManager.getItem(`user_stats_${userId}`, defaultStats);
  }

  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
    const currentStats = await this.getUserStats(userId);
    const updatedStats = { ...currentStats, ...stats };
    LocalStorageManager.setItem(`user_stats_${userId}`, updatedStats);
  }

  private calculateVerificationScore(verifications: UserStats['verifications']): number {
    const { email, phone, id, address } = verifications;
    return (Number(email) + Number(phone) + Number(id) + Number(address)) / 4;
  }

  private calculateEndorsementScore(endorsements: number): number {
    return Math.min(endorsements / this.MAX_ENDORSEMENTS_EXPECTED, 1.0);
  }

  private calculateReputationScore(totalRating: number, ratingCount: number): number {
    if (ratingCount === 0) return 0.8; // Higher neutral score for new users (80%)
    return (totalRating / ratingCount) / 5.0;
  }

  private calculateDisputeFactor(disputes: number, completedExchanges: number): number {
    if (completedExchanges === 0) return 1.0; // No penalty for new users
    return Math.max(0, 1 - (disputes / completedExchanges));
  }

  private calculateBehaviorScore(
    responseRate: number,
    ruleViolations: number,
    completedExchanges: number
  ): number {
    // Response rate component (0-1)
    const responseComponent = Math.max(0, Math.min(1, responseRate));
    
    // Rule adherence component (0-1) - less punishing
    const ruleAdherenceComponent = Math.max(0.5, 1 - (ruleViolations * 0.05)); // Reduced penalty
    
    // Activity component (0-1) - based on completed exchanges
    const activityComponent = Math.min(1, completedExchanges / 5); // Easier to achieve
    
    return (responseComponent + ruleAdherenceComponent + activityComponent) / 3;
  }

  async calculateTrustScore(userId: string): Promise<TrustScoreBreakdown> {
    const stats = await this.getUserStats(userId);

    // Calculate individual components (0-1 scale)
    const verification = this.calculateVerificationScore(stats.verifications);
    const endorsement = this.calculateEndorsementScore(stats.endorsements);
    const reputation = this.calculateReputationScore(stats.totalRating, stats.ratingCount);
    const dispute = this.calculateDisputeFactor(stats.disputes, stats.completedExchanges);
    const behavior = this.calculateBehaviorScore(
      stats.responseRate,
      stats.ruleViolations,
      stats.completedExchanges
    );

    // Calculate weighted total (0-100 scale)
    const total = Math.round(
      (this.WEIGHTS.verification * verification +
       this.WEIGHTS.endorsement * endorsement +
       this.WEIGHTS.reputation * reputation +
       this.WEIGHTS.dispute * dispute +
       this.WEIGHTS.behavior * behavior) * 100
    );

    return {
      verification: Math.round(verification * 100),
      endorsement: Math.round(endorsement * 100),
      reputation: Math.round(reputation * 100),
      dispute: Math.round(dispute * 100),
      behavior: Math.round(behavior * 100),
      total: Math.max(0, Math.min(100, total)) // Ensure 0-100 range
    };
  }

  async addRating(userId: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const stats = await this.getUserStats(userId);
    stats.totalRating += rating;
    stats.ratingCount += 1;
    
    await this.updateUserStats(userId, stats);
  }

  async addEndorsement(userId: string): Promise<void> {
    const stats = await this.getUserStats(userId);
    stats.endorsements += 1;
    
    await this.updateUserStats(userId, stats);
  }

  async reportDispute(userId: string): Promise<void> {
    const stats = await this.getUserStats(userId);
    stats.disputes += 1;
    
    await this.updateUserStats(userId, stats);
  }

  async updateVerification(
    userId: string, 
    verificationType: keyof UserStats['verifications'], 
    verified: boolean
  ): Promise<void> {
    const stats = await this.getUserStats(userId);
    stats.verifications[verificationType] = verified;
    
    await this.updateUserStats(userId, stats);
  }

  async updateResponseRate(userId: string, responseRate: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    stats.responseRate = Math.max(0, Math.min(1, responseRate));
    
    await this.updateUserStats(userId, stats);
  }

  async recordRuleViolation(userId: string): Promise<void> {
    const stats = await this.getUserStats(userId);
    stats.ruleViolations += 1;
    
    await this.updateUserStats(userId, stats);
  }

  async getTrustScoreLevel(score: number): Promise<string> {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  }

  async getTrustScoreColor(score: number): Promise<string> {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 50) return 'text-red-500';
    return 'text-red-600';
  }

  // Bulk update trust scores (can be called periodically)
  async refreshAllTrustScores(): Promise<void> {
    const users = LocalStorageManager.getItem('users', []);
    
    for (const user of users) {
      const trustScore = await this.calculateTrustScore(user.id);
      LocalStorageManager.setItem(`trust_score_${user.id}`, trustScore);
    }
  }
}

export const trustScoreService = new TrustScoreService();