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

  // Get requests made by the user
  async getMyRequests(userId: string): Promise<BarterRequest[]> {
    const requests = LocalStorageManager.getBarterRequests();
    return Promise.resolve(
      requests
        .filter(request => request.requesterId === userId)
        .map(request => ({
          ...request,
          listingTitle: LocalStorageManager.getListings()
            .find(l => l.id === request.listingId)?.title || 'Unknown Listing'
        }))
    );
  }

  // Get requests for user's listings
  async getRequestsForMyListings(userId: string): Promise<BarterRequest[]> {
    const requests = LocalStorageManager.getBarterRequests();
    return Promise.resolve(
      requests
        .filter(request => request.ownerId === userId)
        .map(request => ({
          ...request,
          listingTitle: LocalStorageManager.getListings()
            .find(l => l.id === request.listingId)?.title || 'Unknown Listing'
        }))
    );
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

    // STEP 1: Owner responds to initial request
    if (currentUser.id === request.ownerId && request.status === 'pending') {
      if (accept) {
        updatedRequest.ownerAccepted = true;
        updatedRequest.status = 'owner_accepted';
        updatedRequest.updatedAt = new Date().toISOString();
        
        notification = {
          id: this.generateId(),
          title: 'Barter Request Accepted!',
          message: `${currentUser.name} accepted your barter request for "${request.listing.title}". Please confirm to proceed!`,
          type: 'barter_owner_accepted',
          relatedId: requestId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        LocalStorageManager.addNotification(request.requesterId, notification);
      } else {
        updatedRequest.status = 'rejected';
        updatedRequest.updatedAt = new Date().toISOString();
        
        notification = {
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
    }
    // STEP 2: Requester confirms after owner acceptance
    else if (currentUser.id === request.requesterId && request.status === 'owner_accepted') {
      if (accept) {
        updatedRequest.requesterAccepted = true;
        updatedRequest.status = 'both_accepted';
        // Generate separate confirmation codes for each party
        updatedRequest.ownerConfirmationCode = this.generateConfirmationCode();
        updatedRequest.requesterConfirmationCode = this.generateConfirmationCode();
        updatedRequest.updatedAt = new Date().toISOString();
        
        // Notify both parties
        const notificationForOwner = {
          id: this.generateId(),
          title: 'Barter Confirmed - Chat Available!',
          message: `${currentUser.name} confirmed the barter for "${request.listing.title}". You can now chat privately to arrange the exchange!`,
          type: 'barter_both_accepted',
          relatedId: requestId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        
        const notificationForRequester = {
          id: this.generateId(),
          title: 'Barter Confirmed - Chat Available!',
          message: `You confirmed the barter for "${request.listing.title}". You can now chat privately to arrange the exchange!`,
          type: 'barter_both_accepted',
          relatedId: requestId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        
        LocalStorageManager.addNotification(request.ownerId, notificationForOwner);
        LocalStorageManager.addNotification(request.requesterId, notificationForRequester);
      } else {
        updatedRequest.status = 'rejected';
        updatedRequest.updatedAt = new Date().toISOString();
        
        notification = {
          id: this.generateId(),
          title: 'Barter Request Declined',
          message: `${currentUser.name} declined to confirm the barter for "${request.listing.title}"`,
          type: 'barter_rejected',
          relatedId: requestId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        LocalStorageManager.addNotification(request.ownerId, notification);
      }
    }
    else {
      throw new Error('Invalid action for current user or request status');
    }

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
    const requestIndex = requests.findIndex((r: BarterRequest) => r.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    const request = requests[requestIndex];
    
    // Check if the confirmation code matches the user's specific code
    const isOwner = request.ownerId === currentUser.id;
    const isRequester = request.requesterId === currentUser.id;
    
    if (!isOwner && !isRequester) {
      throw new Error('You are not part of this barter');
    }

    const expectedCode = isOwner ? request.ownerConfirmationCode : request.requesterConfirmationCode;
    
    if (expectedCode !== confirmationCode) {
      throw new Error('Invalid confirmation code');
    }

    // Mark this user as having completed their part
    if (isOwner) {
      request.ownerCompleted = true;
    } else {
      request.requesterCompleted = true;
    }

    // If both parties have completed, mark the entire barter as completed
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

      // Update trust scores for both users
      await this.updateTrustScoresAfterCompletion(request.ownerId, request.requesterId);
    }

    requests[requestIndex] = request;
    LocalStorageManager.setBarterRequests(requests);

    return requests[requestIndex];
  }

  private async updateTrustScoresAfterCompletion(ownerId: string, requesterId: string): Promise<void> {
    // This will be called after successful barter completion
    // For now, we'll just increment completed exchanges count
    const ownerStats = LocalStorageManager.getItem(`user_stats_${ownerId}`, {
      completedExchanges: 0,
      totalRating: 0,
      ratingCount: 0,
      disputes: 0,
      endorsements: 0,
      verifications: { email: false, phone: false, id: false, address: false },
      behaviorScore: 0.8
    });
    
    const requesterStats = LocalStorageManager.getItem(`user_stats_${requesterId}`, {
      completedExchanges: 0,
      totalRating: 0,
      ratingCount: 0,
      disputes: 0,
      endorsements: 0,
      verifications: { email: false, phone: false, id: false, address: false },
      behaviorScore: 0.8
    });

    ownerStats.completedExchanges++;
    requesterStats.completedExchanges++;

    LocalStorageManager.setItem(`user_stats_${ownerId}`, ownerStats);
    LocalStorageManager.setItem(`user_stats_${requesterId}`, requesterStats);
  }

  async sendBarterChatMessage(requestId: string, content: string): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const currentUser = LocalStorageManager.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    const requests = LocalStorageManager.getBarterRequests();
    const requestIndex = requests.findIndex((r: BarterRequest) => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');
    
    const request = requests[requestIndex];
    
    // Only allow chat if both parties have accepted
    if (request.status !== 'both_accepted' && request.status !== 'completed') {
      throw new Error('Chat is only available after both parties accept the barter');
    }
    
    // Only allow the owner and requester to chat
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
    
    requests[requestIndex].chatMessages = requests[requestIndex].chatMessages || [];
    requests[requestIndex].chatMessages.push(message);
    LocalStorageManager.setBarterRequests(requests);
    
    return requests[requestIndex];
  }
}

export const barterService = new BarterService();