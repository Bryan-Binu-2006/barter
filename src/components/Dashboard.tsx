import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import { CreateListing } from './CreateListing';
import { BarterRequestModal } from './BarterRequestModal';
import { BarterRequestsModal } from './BarterRequestsModal';
import { BarterChatModal } from './BarterChatModal';
import { TrustScoreDisplay } from './TrustScoreDisplay';
import { NotificationCenter } from './NotificationCenter';
import { listingService } from '../services/listingService';
import { barterService } from '../services/barterService';
import { communityService } from '../services/communityService';
import { Listing } from '../types/listing';
import { BarterRequest } from '../types/barter';
import { CommunityMember } from '../types/community';
import { Plus, Users, MessageSquare, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { selectedCommunity } = useCommunity();
  const [activeTab, setActiveTab] = useState<'listings' | 'members' | 'chat'>('listings');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showBarterRequest, setShowBarterRequest] = useState(false);
  const [showBarterRequests, setShowBarterRequests] = useState(false);
  const [showBarterChat, setShowBarterChat] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedBarterRequest, setSelectedBarterRequest] = useState<BarterRequest | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [barterRequests, setBarterRequests] = useState<BarterRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCommunity) {
      loadData();
    }
  }, [selectedCommunity]);

  const loadData = async () => {
    if (!selectedCommunity || !user) return;
    
    setLoading(true);
    try {
      const [listingsData, membersData, myRequests, requestsForMyListings] = await Promise.all([
        listingService.getCommunityListings(selectedCommunity.id),
        communityService.getCommunityMembers(selectedCommunity.id),
        barterService.getMyRequests(user.id),
        barterService.getRequestsForMyListings(user.id)
      ]);
      
      setListings(listingsData);
      setMembers(membersData);
      setBarterRequests([...myRequests, ...requestsForMyListings]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    setShowCreateListing(false);
    loadData();
  };

  const handleBarterRequest = (listing: Listing) => {
    setSelectedListing(listing);
    setShowBarterRequest(true);
  };

  const handleSendBarterRequest = async () => {
    setShowBarterRequest(false);
    setSelectedListing(null);
    loadData();
  };

  const handleOpenChat = (request: BarterRequest) => {
    setSelectedBarterRequest(request);
    setShowBarterChat(true);
  };

  const handleCloseChat = () => {
    setShowBarterChat(false);
    setSelectedBarterRequest(null);
    loadData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'owner_accepted':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'both_accepted':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'owner_accepted':
        return 'Owner Accepted';
      case 'both_accepted':
        return 'Both Accepted';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Declined';
      default:
        return 'Unknown';
    }
  };

  if (!selectedCommunity) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a community to continue.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {selectedCommunity.name} Dashboard
        </h1>
        <p className="text-gray-600">{selectedCommunity.description}</p>
      </div>

      <NotificationCenter />

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'listings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Listings
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Members
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1" />
            General Chat
          </button>
        </nav>
      </div>

      {activeTab === 'listings' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Available Listings</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBarterRequests(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                My Requests
              </button>
              <button
                onClick={() => setShowCreateListing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      listing.category === 'product' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {listing.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{listing.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">by {listing.userName}</span>
                    <TrustScoreDisplay userId={listing.userId} size="small" />
                  </div>
                  {listing.estimatedValue && (
                    <p className="text-sm text-gray-500 mb-3">
                      Estimated Value: ${listing.estimatedValue}
                    </p>
                  )}
                  {listing.userId !== user?.id && (
                    <button
                      onClick={() => handleBarterRequest(listing)}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Send Barter Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No listings available yet.</p>
              <button
                onClick={() => setShowCreateListing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Listing
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <div className="mt-1">
                      <TrustScoreDisplay userId={member.id} size="small" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">General Chat</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-center">
              General chat functionality will be implemented here.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Barter Activity</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {barterRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.listing.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.requesterId === user?.id
                        ? `To ${request.ownerName}`
                        : `From ${request.requesterName}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {getStatusText(request.status)}
                  </span>
                  {request.status === 'both_accepted' && (
                    <button
                      onClick={() => handleOpenChat(request)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Chat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {barterRequests.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No barter requests yet.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateListing && (
        <CreateListing
          onClose={() => setShowCreateListing(false)}
          onSuccess={handleCreateListing}
          communityId={selectedCommunity.id}
        />
      )}

      {showBarterRequest && selectedListing && (
        <BarterRequestModal
          listing={selectedListing}
          onClose={() => {
            setShowBarterRequest(false);
            setSelectedListing(null);
          }}
          onSuccess={handleSendBarterRequest}
        />
      )}

      {showBarterRequests && (
        <BarterRequestsModal
          onClose={() => setShowBarterRequests(false)}
          onOpenChat={handleOpenChat}
        />
      )}

      {showBarterChat && selectedBarterRequest && (
        <BarterChatModal
          request={selectedBarterRequest}
          onClose={handleCloseChat}
          onComplete={handleCloseChat}
        />
      )}
    </div>
  );
}