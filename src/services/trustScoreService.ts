import { LocalStorageManager } from '../lib/localStorage';

export interface TrustScoreBreakdown {
  verification: number;
  endorsement: number;
  reputation: number;
  dispute: number;
  behavior: number;
  total: number;
}

class TrustScoreService {
  async calculateTrustScore(userId: string): Promise<TrustScoreBreakdown> {
    const stats = LocalStorageManager.getUserStats(userId);

    // Calculate individual components (0-100 scale)
    const verification = this.calculateVerificationScore(stats.verifications);
    const endorsement = Math.min((stats.endorsements / 10) * 100, 100);
    const reputation = stats.ratingCount > 0 ? (stats.totalRating / stats.ratingCount / 5) * 100 : 80;
    const dispute = Math.max(0, 100 - (stats.disputes * 10));
    const behavior = Math.max(70, 100 - (stats.ruleViolations * 5));

    // Calculate weighted total
    const total = Math.round(
      (verification * 0.20 +
       endorsement * 0.25 +
       reputation * 0.30 +
       dispute * 0.10 +
       behavior * 0.15)
    );

    return {
      verification: Math.round(verification),
      endorsement: Math.round(endorsement),
      reputation: Math.round(reputation),
      dispute: Math.round(dispute),
      behavior: Math.round(behavior),
      total: Math.max(60, Math.min(100, total))
    };
  }

  private calculateVerificationScore(verifications: any): number {
    const { email, phone, id, address } = verifications;
    return (Number(email) + Number(phone) + Number(id) + Number(address)) / 4 * 100;
  }

  async addRating(userId: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const stats = LocalStorageManager.getUserStats(userId);
    stats.totalRating += rating;
    stats.ratingCount += 1;
    
    LocalStorageManager.setUserStats(userId, stats);
  }
}

export const trustScoreService = new TrustScoreService();