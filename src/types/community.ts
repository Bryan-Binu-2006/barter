export interface Community {
  id: string;
  name: string;
  location: string;
  description: string;
  code: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
}

export interface CreateCommunityData {
  name: string;
  location: string;
  description: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  isAdmin: boolean;
}