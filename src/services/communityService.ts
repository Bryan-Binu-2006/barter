import { LocalStorageManager } from '../lib/localStorage';
import { Community, CreateCommunityData, CommunityMember } from '../types/community';

class CommunityService {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateCommunityCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getUserCommunities(): Promise<Community[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const communities = LocalStorageManager.getCommunities();
    
    const userCommunities = communities.filter((community: any) => {
      const members = LocalStorageManager.getCommunityMembers(community.id);
      return members.some((member: any) => member.id === currentUser.id);
    });

    return userCommunities.map((community: any) => ({
      ...community,
      memberCount: LocalStorageManager.getCommunityMembers(community.id).length
    }));
  }

  async createCommunity(data: CreateCommunityData): Promise<Community> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const community = {
      id: this.generateId(),
      name: data.name,
      location: data.location,
      description: data.description,
      code: this.generateCommunityCode(),
      createdBy: currentUser.id,
      createdAt: new Date().toISOString()
    };

    LocalStorageManager.addCommunity(community);

    const creatorMember = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      joinedAt: new Date().toISOString(),
      isAdmin: true
    };

    LocalStorageManager.addCommunityMember(community.id, creatorMember);

    return {
      ...community,
      memberCount: 1
    };
  }

  async joinCommunity(code: string): Promise<Community> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const communities = LocalStorageManager.getCommunities();
    const community = communities.find((c: any) => c.code === code.toUpperCase());

    if (!community) {
      throw new Error('Community not found. Please check the code and try again.');
    }

    const members = LocalStorageManager.getCommunityMembers(community.id);
    const existingMember = members.find((member: any) => member.id === currentUser.id);

    if (existingMember) {
      throw new Error('You are already a member of this community.');
    }

    const newMember = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      joinedAt: new Date().toISOString(),
      isAdmin: false
    };

    LocalStorageManager.addCommunityMember(community.id, newMember);

    return {
      ...community,
      memberCount: LocalStorageManager.getCommunityMembers(community.id).length
    };
  }

  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return LocalStorageManager.getCommunityMembers(communityId);
  }
}

export const communityService = new CommunityService();