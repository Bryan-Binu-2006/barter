import { LocalStorageManager } from '../lib/localStorage';
import { BarterRequest, CreateBarterRequestData } from '../types/barter';

class BarterService {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  async createBarterRequest(data: CreateBarterRequestData): Promise<BarterRequest> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    // Get listing details
    const listings: any[] = LocalStorageManager.getListings();
    const listing = Array.isArray(listings) ? listings.find((l: any) => l && l.id === data.listingId) : undefined;
    if (!listing) {
      throw new Error('Listing not found');
    }

    // Get owner details
    const users: any[] = (typeof window !== 'undefined' && window.localStorage.getItem('users')) ? JSON.parse(window.localStorage.getItem('users')!) : [];
    const owner = Array.isArray(users) ? users.find((u: any) => u && u.id === listing.userId) : undefined;

    const request: BarterRequest = {
      id: this.generateId(),
      listingId: data.listingId,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      ownerId: listing.userId,
      ownerName: owner ? owner.name : 'Unknown',
      offerDescription: data.offerDescription,
      status: 'pending',
      createdAt: new Date().toISOString(),
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        estimatedValue: listing.estimatedValue
      },
      ownerAccepted: false,
      requesterAccepted: false,
      chatMessages: []
    };

    LocalStorageManager.addBarterRequest(request);

    // Create notification for owner
    const notification = {
      id: this.generateId(),
      title: 'New Barter Request',
      message: `${currentUser.name} wants to barter for your "${listing.title}"`,
      type: 'barter_request',
      relatedId: request.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    LocalStorageManager.addNotification(listing.userId, notification);

    return request;
  }

  async getMyRequests(): Promise<BarterRequest[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const requests = LocalStorageManager.getBarterRequests();
    return requests.filter((r: BarterRequest) => r.requesterId === currentUser.id);
  }

  async getRequestsForMyListings(): Promise<BarterRequest[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const requests = LocalStorageManager.getBarterRequests();
    return requests.filter((r: BarterRequest) => r.ownerId === currentUser.id);
  }

  async respondToRequest(requestId: string, accept: boolean): Promise<BarterRequest> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const requests = LocalStorageManager.getBarterRequests();
    const requestIndex = requests.findIndex((r: BarterRequest) => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }
    const request = requests[requestIndex];
    let updatedRequest = { ...request };
    let notification;

    // Owner accepts
    if (currentUser.id === request.ownerId && !request.ownerAccepted && accept) {
      updatedRequest.ownerAccepted = true;
      updatedRequest.status = 'owner_accepted';
      notification = {
        id: this.generateId(),
        title: 'Barter Request Accepted by Owner',
        message: `${currentUser.name} accepted your barter request for "${request.listing.title}". Please confirm to proceed!`,
        type: 'barter_owner_accepted',
        relatedId: requestId,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      LocalStorageManager.addNotification(request.requesterId, notification);
    }
    // Requester accepts after owner
    else if (currentUser.id === request.requesterId && request.ownerAccepted && !request.requesterAccepted && accept) {
      updatedRequest.requesterAccepted = true;
      updatedRequest.status = 'both_accepted';
      updatedRequest.confirmationCode = this.generateConfirmationCode();
      notification = {
        id: this.generateId(),
        title: 'Barter Confirmed!',
        message: `${currentUser.name} confirmed the barter for "${request.listing.title}". Confirmation code generated!`,
        type: 'barter_both_accepted',
        relatedId: requestId,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      LocalStorageManager.addNotification(request.ownerId, notification);
      LocalStorageManager.addNotification(request.requesterId, notification);
      // Mark listing as inactive
      const listings = LocalStorageManager.getListings();
      const listingIndex = listings.findIndex((l: any) => l.id === request.listingId);
      if (listingIndex !== -1) {
        listings[listingIndex].isActive = false;
        LocalStorageManager.setListings(listings);
      }
      // Add to transaction history for both users
      const transaction = {
        id: this.generateId(),
        barterId: request.id,
        listing: request.listing,
        withUserId: request.ownerId === currentUser.id ? request.requesterId : request.ownerId,
        withUserName: request.ownerId === currentUser.id ? request.requesterName : request.ownerName,
        offerDescription: request.offerDescription,
        date: new Date().toISOString(),
        status: 'completed',
        confirmationCode: updatedRequest.confirmationCode
      };
      // Owner
      const ownerTransactions = LocalStorageManager.getItem(`transactions_${request.ownerId}`, []);
      ownerTransactions.push(transaction);
      LocalStorageManager.setItem(`transactions_${request.ownerId}`, ownerTransactions);
      // Requester
      const requesterTransactions = LocalStorageManager.getItem(`transactions_${request.requesterId}`, []);
      requesterTransactions.push(transaction);
      LocalStorageManager.setItem(`transactions_${request.requesterId}`, requesterTransactions);
    }
    // Either party rejects
    else if (!accept) {
      updatedRequest.status = 'rejected';
      notification = {
        id: this.generateId(),
        title: 'Barter Request Declined',
        message: `${currentUser.name} declined the barter request for "${request.listing.title}"`,
        type: 'barter_rejected',
        relatedId: requestId,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      LocalStorageManager.addNotification(request.ownerId, notification);
      LocalStorageManager.addNotification(request.requesterId, notification);
    }
    updatedRequest.updatedAt = new Date().toISOString();
    requests[requestIndex] = updatedRequest;
    LocalStorageManager.setBarterRequests(requests);
    return updatedRequest;
  }

  async completeBarter(requestId: string, confirmationCode: string): Promise<BarterRequest> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const requests = LocalStorageManager.getBarterRequests();
    const requestIndex = requests.findIndex((r: BarterRequest) => 
      r.id === requestId && 
      r.confirmationCode === confirmationCode &&
      (r.requesterId === currentUser.id || r.ownerId === currentUser.id)
    );

    if (requestIndex === -1) {
      throw new Error('Invalid confirmation code or request not found');
    }

    requests[requestIndex] = {
      ...requests[requestIndex],
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    LocalStorageManager.setBarterRequests(requests);

    // Mark listing as inactive
    const listings: any[] = LocalStorageManager.getListings();
    const listingIndex = listings.findIndex((l: any) => l.id === requests[requestIndex].listingId);
    if (listingIndex !== -1) {
      listings[listingIndex].isActive = false;
      LocalStorageManager.setListings(listings);
    }

    return requests[requestIndex];
  }

  async sendBarterChatMessage(requestId: string, content: string): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    const requests = LocalStorageManager.getBarterRequests();
    const requestIndex = requests.findIndex((r: BarterRequest) => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');
    const message = {
      id: this.generateId(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      timestamp: new Date().toISOString()
    };
    requests[requestIndex].chatMessages = requests[requestIndex].chatMessages || [];
    requests[requestIndex].chatMessages.push(message);
    LocalStorageManager.setBarterRequests(requests);
    return requests[requestIndex];
  }
}

export const barterService = new BarterService();