export interface BarterRequest {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  offerDescription: string;
  status: 'pending' | 'owner_accepted' | 'both_accepted' | 'rejected' | 'completed' | 'negotiating';
  ownerConfirmationCode?: string;
  requesterConfirmationCode?: string;
  ownerCompleted?: boolean;
  requesterCompleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  listing: {
    id: string;
    title: string;
    description: string;
    category: string;
    estimatedValue: number;
  };
  ownerAccepted?: boolean;
  requesterAccepted?: boolean;
  chatMessages?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
  }>;
}

export interface CreateBarterRequestData {
  listingId: string;
  offerDescription: string;
}