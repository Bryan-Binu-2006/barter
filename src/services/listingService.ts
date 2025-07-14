import { LocalStorageManager } from '../lib/localStorage';
import { Listing, CreateListingData } from '../types/listing';

class ListingService {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async getCommunityListings(communityId: string): Promise<Listing[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const listings = LocalStorageManager.getListings();
    
    // Filter listings for this community and add user names
    const communityListings = listings
      .filter((listing: any) => listing.communityId === communityId && listing.isActive)
      .map((listing: any) => {
        // Get user name from users
        const users = LocalStorageManager.getItem('users', []);
        const user = users.find((u: any) => u.id === listing.userId);
        
        return {
          ...listing,
          userName: user ? user.name : 'Unknown User'
        };
      });

    return communityListings;
  }

  async createListing(data: CreateListingData): Promise<Listing> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

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
      createdAt: new Date().toISOString(),
      isActive: true
    };

    LocalStorageManager.addListing(listing);

    return listing;
  }

  async updateListing(id: string, data: Partial<CreateListingData>): Promise<Listing> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const listings = LocalStorageManager.getListings();
    const listingIndex = listings.findIndex((l: any) => l.id === id);

    if (listingIndex === -1) {
      throw new Error('Listing not found');
    }

    const updatedListing = {
      ...listings[listingIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    listings[listingIndex] = updatedListing;
    LocalStorageManager.setListings(listings);

    return updatedListing;
  }

  async deleteListing(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const listings = LocalStorageManager.getListings();
    const listingIndex = listings.findIndex((l: any) => l.id === id);

    if (listingIndex !== -1) {
      listings[listingIndex].isActive = false;
      LocalStorageManager.setListings(listings);
    }
  }
}

export const listingService = new ListingService();