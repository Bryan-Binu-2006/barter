import { LocalStorageManager } from '../lib/localStorage';
import { trustScoreService } from './trustScoreService';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bio: string;
  profilePicture: string;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bio?: string;
  profilePicture?: string;
}

class ProfileService {
  async completeProfile(userId: string, profileData: any): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = LocalStorageManager.getItem('users', []);
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...users[userIndex],
      fullName: profileData.fullName,
      phone: profileData.phone,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zipCode: profileData.zipCode,
      bio: profileData.bio,
      profilePicture: profileData.profilePicture,
      isProfileComplete: true,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    LocalStorageManager.setItem('users', users);

    // Update current user in localStorage
    LocalStorageManager.setCurrentUser(updatedUser);

    // Update trust score verifications
    await trustScoreService.updateVerification(userId, 'phone', !!profileData.phone);
    await trustScoreService.updateVerification(userId, 'address', !!(profileData.address && profileData.city));

    return updatedUser;
  }

  async updateProfile(userId: string, updates: ProfileUpdateData): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const users = LocalStorageManager.getItem('users', []);
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    LocalStorageManager.setItem('users', users);

    // Update current user in localStorage
    LocalStorageManager.setCurrentUser(updatedUser);

    // Update trust score verifications if relevant fields changed
    if (updates.phone !== undefined) {
      await trustScoreService.updateVerification(userId, 'phone', !!updates.phone);
    }
    if (updates.address !== undefined || updates.city !== undefined) {
      await trustScoreService.updateVerification(userId, 'address', !!(updatedUser.address && updatedUser.city));
    }

    return updatedUser;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const users = LocalStorageManager.getItem('users', []);
    const user = users.find((u: any) => u.id === userId);
    return user || null;
  }

  async isProfileComplete(userId: string): Promise<boolean> {
    const user = await this.getUserProfile(userId);
    return user?.isProfileComplete || false;
  }
}

export const profileService = new ProfileService();