export interface Listing {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'service';
  estimatedValue: number;
  availability: string;
  images: string[];
  userId: string;
  userName: string;
  communityId: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  category: 'product' | 'service';
  estimatedValue: number;
  availability: string;
  images: string[];
  communityId: string;
}