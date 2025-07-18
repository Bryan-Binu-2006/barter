import { LocalStorageManager } from '../lib/localStorage';
import { User } from '../types/auth';

export interface ProfileUpdateData {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bio?: string;
}

class ProfileService {
  async completeProfile(userId: string, profileData: ProfileUpdateData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const users = LocalStorageManager.getUsers();
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...users[userIndex],
      ...profileData,
      isProfileComplete: true,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    LocalStorageManager.setUsers(users);
    LocalStorageManager.setCurrentUser(updatedUser);

    // Update trust score verifications
    const stats = LocalStorageManager.getUserStats(userId);
    if (profileData.phone) stats.verifications.phone = true;
    if (profileData.address && profileData.city) stats.verifications.address = true;
    LocalStorageManager.setUserStats(userId, stats);

    return updatedUser;
  }

  async isProfileComplete(userId: string): Promise<boolean> {
    const users = LocalStorageManager.getUsers();
    const user = users.find((u: any) => u.id === userId);
    return user?.isProfileComplete || false;
  }
}

export const profileService = new ProfileService();