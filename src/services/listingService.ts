import { LocalStorageManager } from '../lib/localStorage';
import { Listing, CreateListingData } from '../types/listing';

class ListingService {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async getCommunityListings(communityId: string): Promise<Listing[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const listings = LocalStorageManager.getListings();
    const users = LocalStorageManager.getUsers();
    
    const communityListings = listings
      .filter((listing: any) => listing.communityId === communityId && listing.isActive)
      .map((listing: any) => {
        const user = users.find((u: any) => u.id === listing.userId);
        return {
          ...listing,
          userName: user ? user.name : 'Unknown User'
        };
      });

    return communityListings;
  }

  async createListing(data: CreateListingData): Promise<Listing> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to create a listing');
    }

    const listing = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      category: data.category,
      estimatedValue: data.estimatedValue,
      availability: data.availability,
      images: data.images,
      userId: currentUser.id,
      userName: currentUser.name,
      communityId: data.communityId,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    LocalStorageManager.addListing(listing);
    return listing;
  }
}

export const listingService = new ListingService();