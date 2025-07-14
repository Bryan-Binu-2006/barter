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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const communities = LocalStorageManager.getCommunities();
    
    // Filter communities where user is a member
    const userCommunities = communities.filter((community: any) => {
      const members = LocalStorageManager.getCommunityMembers(community.id);
      return members.some((member: any) => member.id === currentUser.id);
    });

    return userCommunities.map((community: any) => ({
      id: community.id,
      name: community.name,
      location: community.location,
      description: community.description,
      code: community.code,
      createdAt: community.createdAt,
      createdBy: community.createdBy,
      memberCount: LocalStorageManager.getCommunityMembers(community.id).length
    }));
  }

  async createCommunity(data: CreateCommunityData): Promise<Community> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const community = {
      id: this.generateId(),
      name: data.name,
      location: data.location,
      description: data.description,
      code: this.generateCommunityCode(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    };

    // Add community
    LocalStorageManager.addCommunity(community);

    // Add creator as admin member
    const creatorMember = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      joinedAt: new Date().toISOString(),
      isAdmin: true,
      isOnline: true
    };

    LocalStorageManager.addCommunityMember(community.id, creatorMember);

    return {
      ...community,
      memberCount: 1
    };
  }

  async joinCommunity(code: string): Promise<Community> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const communities = LocalStorageManager.getCommunities();
    const community = communities.find((c: any) => c.code === code.toUpperCase());

    if (!community) {
      throw new Error('Community not found. Please check the code and try again.');
    }

    // Check if already a member
    const members = LocalStorageManager.getCommunityMembers(community.id);
    const existingMember = members.find((member: any) => member.id === currentUser.id);

    if (existingMember) {
      throw new Error('You are already a member of this community.');
    }

    // Add user as member
    const newMember = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      joinedAt: new Date().toISOString(),
      isAdmin: false,
      isOnline: true
    };

    LocalStorageManager.addCommunityMember(community.id, newMember);

    return {
      ...community,
      memberCount: LocalStorageManager.getCommunityMembers(community.id).length
    };
  }

  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return LocalStorageManager.getCommunityMembers(communityId);
  }

  async sendCommunityMessage(communityId: string, content: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const message = {
      id: this.generateId(),
      content: content,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    LocalStorageManager.addMessage(communityId, message);
  }

  async getCommunityMessages(communityId: string): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return LocalStorageManager.getMessages(communityId);
  }
}

export const communityService = new CommunityService();