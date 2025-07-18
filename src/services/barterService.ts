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
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const listings = LocalStorageManager.getListings();
    const listing = listings.find((l: any) => l.id === data.listingId);
    if (!listing) throw new Error('Listing not found');

    const users = LocalStorageManager.getUsers();
    const owner = users.find((u: any) => u.id === listing.userId);

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

  async getMyRequests(userId: string): Promise<BarterRequest[]> {
    const requests = LocalStorageManager.getBarterRequests();
    return requests.filter((request: BarterRequest) => request.requesterId === userId);
  }

  async getRequestsForMyListings(userId: string): Promise<BarterRequest[]> {
    const requests = LocalStorageManager.getBarterRequests();
    return requests.filter((request: BarterRequest) => request.ownerId === userId);
  }

  async respondToRequest(requestId: string, accept: boolean): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const requests = LocalStorageManager.getBarterRequests();
    const requestIndex = requests.findIndex((r: BarterRequest) => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');

    const request = requests[requestIndex];
    
    if (currentUser.id === request.ownerId && request.status === 'pending') {
      if (accept) {
        request.status = 'owner_accepted';
        request.updatedAt = new Date().toISOString();
        
        const notification = {
          id: this.generateId(),
          title: 'Barter Request Accepted!',
          message: `${currentUser.name} accepted your barter request for "${request.listing.title}". Please confirm to proceed!`,
          type: 'barter_accepted',
          relatedId: requestId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        LocalStorageManager.addNotification(request.requesterId, notification);
      } else {
        request.status = 'rejected';
        request.updatedAt = new Date().toISOString();
        
        const notification = {
          id: this.generateId(),
          title: 'Barter Request Declined',
          message: `${currentUser.name} declined your barter request for "${request.listing.title}"`,
          type: 'barter_rejected',
          relatedId: requestId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        LocalStorageManager.addNotification(request.requesterId, notification);
      }
    } else if (currentUser.id === request.requesterId && request.status === 'owner_accepted') {
      if (accept) {
        request.status = 'both_accepted';
        request.ownerConfirmationCode = this.generateConfirmationCode();
        request.requesterConfirmationCode = this.generateConfirmationCode();
        request.updatedAt = new Date().toISOString();
        
        const notificationForOwner = {
          id: this.generateId(),
          title: 'Barter Confirmed - Chat Available!',
          message: `${currentUser.name} confirmed the barter for "${request.listing.title}". You can now chat to arrange the exchange!`,
          type: 'barter_accepted',
          relatedId: requestId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        
        LocalStorageManager.addNotification(request.ownerId, notificationForOwner);
      } else {
        request.status = 'rejected';
        request.updatedAt = new Date().toISOString();
      }
    }

    requests[requestIndex] = request;
    LocalStorageManager.setBarterRequests(requests);
    return request;
  }

  async sendChatMessage(requestId: string, content: string): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    const requests = LocalStorageManager.getBarterRequests();
    const requestIndex = requests.findIndex((r: BarterRequest) => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');
    
    const request = requests[requestIndex];
    
    if (request.status !== 'both_accepted' && request.status !== 'completed') {
      throw new Error('Chat is only available after both parties accept the barter');
    }
    
    if (currentUser.id !== request.ownerId && currentUser.id !== request.requesterId) {
      throw new Error('You are not authorized to chat in this barter');
    }
    
    const message = {
      id: this.generateId(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      timestamp: new Date().toISOString()
    };
    
    if (!request.chatMessages) request.chatMessages = [];
    request.chatMessages.push(message);
    
    requests[requestIndex] = request;
    LocalStorageManager.setBarterRequests(requests);
    
    return request;
  }

  async completeBarter(requestId: string, confirmationCode: string): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const requests = LocalStorageManager.getBarterRequests();
    const requestIndex = requests.findIndex((r: BarterRequest) => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');

    const request = requests[requestIndex];
    
    const isOwner = request.ownerId === currentUser.id;
    const isRequester = request.requesterId === currentUser.id;
    
    if (!isOwner && !isRequester) {
      throw new Error('You are not part of this barter');
    }

    const expectedCode = isOwner ? request.ownerConfirmationCode : request.requesterConfirmationCode;
    
    if (expectedCode !== confirmationCode) {
      throw new Error('Invalid confirmation code');
    }

    if (isOwner) {
      request.ownerCompleted = true;
    } else {
      request.requesterCompleted = true;
    }

    if (request.ownerCompleted && request.requesterCompleted) {
      request.status = 'completed';
      request.completedAt = new Date().toISOString();
      
      // Mark listing as inactive
      const listings = LocalStorageManager.getListings();
      const listingIndex = listings.findIndex((l: any) => l.id === request.listingId);
      if (listingIndex !== -1) {
        listings[listingIndex].isActive = false;
        LocalStorageManager.setListings(listings);
      }

      // Update trust scores
      const ownerStats = LocalStorageManager.getUserStats(request.ownerId);
      const requesterStats = LocalStorageManager.getUserStats(request.requesterId);
      
      ownerStats.completedExchanges++;
      requesterStats.completedExchanges++;
      
      LocalStorageManager.setUserStats(request.ownerId, ownerStats);
      LocalStorageManager.setUserStats(request.requesterId, requesterStats);
    }

    requests[requestIndex] = request;
    LocalStorageManager.setBarterRequests(requests);

    return request;
  }
}

export const barterService = new BarterService();