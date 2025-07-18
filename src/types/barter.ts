export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface BarterRequest {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  offerDescription: string;
  status: 'pending' | 'owner_accepted' | 'both_accepted' | 'rejected' | 'completed';
  ownerConfirmationCode?: string;
  requesterConfirmationCode?: string;
  ownerCompleted?: boolean;
  requesterCompleted?: boolean;
  chatMessages?: ChatMessage[];
  listing: {
    id: string;
    title: string;
    description: string;
    category: string;
    estimatedValue: number;
  };
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface CreateBarterRequestData {
  listingId: string;
  offerDescription: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'barter_request' | 'barter_accepted' | 'barter_rejected' | 'chat_message' | 'system';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}