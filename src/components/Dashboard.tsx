import React, { useState, useEffect } from 'react';
import { Users, Package, MessageCircle, Plus, TrendingUp, Search, Filter, Heart, Calendar, Tag, Send, Clock, Check, XCircle } from 'lucide-react';
import { useCommunity } from '../contexts/CommunityContext';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { communityService } from '../services/communityService';
import { barterService } from '../services/barterService';
import { CreateListing } from './CreateListing';
import { BarterRequestModal } from './BarterRequestModal';
import { BarterRequest } from '../types/barter';
import { BarterConfirmationModal } from './BarterConfirmationModal';
import { TrustScoreDisplay } from './TrustScoreDisplay';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'service';
  estimatedValue: number;
  availability: string;
  images: string[];
  userId: string;
  userName: string;
  createdAt: string;
  isActive: boolean;
}

interface CommunityMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  isAdmin: boolean;
  isOnline: boolean;
}

interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'message' | 'announcement';
}

export function Dashboard() {
  const { selectedCommunity } = useCommunity();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'listings' | 'chat' | 'barters'>('overview');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [barterRequests, setBarterRequests] = useState<BarterRequest[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'product' | 'service'>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBarterModal, setShowBarterModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BarterRequest | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCommunity) {
      loadData();
      loadMessages();
      loadBarterRequests();
    }
  }, [selectedCommunity]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingsData, membersData] = await Promise.all([
        listingService.getCommunityListings(selectedCommunity!.id),
        communityService.getCommunityMembers(selectedCommunity!.id)
      ]);
      setListings(listingsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await communityService.getCommunityMessages(selectedCommunity!.id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadBarterRequests = async () => {
    try {
      const [received, sent] = await Promise.all([
        barterService.getRequestsForMyListings(),
        barterService.getMyRequests()
      ]);
      setBarterRequests([...received, ...sent]);
    } catch (error) {
      console.error('Error loading barter requests:', error);
    }
  };

  const handleCreateListingSuccess = () => {
    loadData();
    setShowCreateListing(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedCommunity) {
      try {
        await communityService.sendCommunityMessage(selectedCommunity.id, newMessage.trim());
        setNewMessage('');
        loadMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleBarterRequest = (listing: Listing) => {
    setSelectedListing(listing);
    setShowBarterModal(true);
  };

  const handleBarterResponse = async (requestId: string, accept: boolean) => {
    try {
      await barterService.respondToRequest(requestId, accept);
      loadBarterRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  const handleConfirmBarter = (request: BarterRequest) => {
    setSelectedRequest(request);
    setShowConfirmationModal(true);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory && listing.isActive;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'owner_accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'both_accepted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedCommunity) return null;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-3xl font-bold text-gray-900">{members.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Listings</p>
              <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
              <MessageCircle className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Barters</p>
              <p className="text-3xl font-bold text-gray-900">{barterRequests.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCreateListing(true)}
            className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Plus className="text-emerald-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-emerald-800">Add Listing</p>
              <p className="text-sm text-emerald-600">Create new listing</p>
            </div>
          </button>
          <button
            onClick={() => setActiveView('listings')}
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Package className="text-blue-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-blue-800">Browse</p>
              <p className="text-sm text-blue-600">Find items to trade</p>
            </div>
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <MessageCircle className="text-purple-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-purple-800">Chat</p>
              <p className="text-sm text-purple-600">Community chat</p>
            </div>
          </button>
          <button
            onClick={() => setActiveView('barters')}
            className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <TrendingUp className="text-orange-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-orange-800">Barters</p>
              <p className="text-sm text-orange-600">Manage requests</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Info</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Community Code:</span>
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
              {selectedCommunity?.code}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Location:</span>
            <span className="text-gray-900">{selectedCommunity?.location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Created:</span>
            <span className="text-gray-900">
              {new Date(selectedCommunity?.createdAt || '').toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Users size={24} />
            <span>Community Members</span>
          </h2>
          <span className="text-sm text-gray-500">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {member.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    {member.isAdmin && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                    <Calendar size={12} />
                    <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Package size={24} />
            <span>Community Listings</span>
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'product' | 'service')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="product">Products</option>
              <option value="service">Services</option>
            </select>
            
            <button
              onClick={() => setShowCreateListing(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Listing</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.category === 'product' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {listing.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={18} />
                </button>
                {/* Delete button for owner */}
                {user && listing.userId === user.id && (
                  <button
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Listing"
                    onClick={async () => {
                      await listingService.deleteListing(listing.id);
                      loadData();
                    }}
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{listing.description}</p>
              
              <div className="space-y-2 mb-4">
                {listing.estimatedValue > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Tag size={14} />
                    <span>Est. Value: ${listing.estimatedValue}</span>
                  </div>
                )}
                {listing.availability && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{listing.availability}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <div className="space-y-1">
                    <div>By {listing.userName}</div>
                    <TrustScoreDisplay userId={listing.userId} size="small" />
                  </div>
                </div>
                {listing.userId !== user?.id && (
                  <button
                    onClick={() => handleBarterRequest(listing)}
                    className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>Request Trade</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Be the first to add a listing to your community!'}
          </p>
          <button
            onClick={() => setShowCreateListing(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Create First Listing
          </button>
        </div>
      )}
    </div>
  );

  const renderChat = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <MessageCircle size={24} />
          <span>General Chat</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="mx-auto mb-2" size={32} />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.userId === user?.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.userId !== user?.id && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {message.userName}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.userId === user?.id ? 'text-emerald-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );

  const renderBarters = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
          <TrendingUp size={24} />
          <span>Barter Requests</span>
        </h2>

        <div className="space-y-4">
          {barterRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No barter requests</h3>
              <p className="text-gray-600">Start browsing listings to send your first barter request!</p>
            </div>
          ) : (
            barterRequests.map((request) => (
              <div key={request.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Package className="text-gray-600" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">{request.listing.title}</h3>
                      <p className="text-sm text-gray-600">
                        {request.requesterId === user?.id 
                          ? `To ${request.ownerName}` 
                          : `From ${request.requesterName}`}
                      </p>
                      <div className="mt-1">
                        <TrustScoreDisplay 
                          userId={request.requesterId === user?.id ? request.ownerId : request.requesterId} 
                          size="small" 
                        />
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Offer:</strong> {request.offerDescription}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Est. Value: ${request.listing.estimatedValue}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {request.ownerId === user?.id && request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleBarterResponse(request.id, true)}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleBarterResponse(request.id, false)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={14} />
                          <span>Decline</span>
                        </button>
                      </>
                    )}
                    
                    {request.requesterId === user?.id && request.status === 'owner_accepted' && (
                      <>
                        <button
                          onClick={() => handleBarterResponse(request.id, true)}
                          className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Check size={14} />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => handleBarterResponse(request.id, false)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={14} />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {request.status === 'both_accepted' && request.confirmationCode && (
                      <button
                        onClick={() => handleConfirmBarter(request)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Complete Barter
                      </button>
                    )}

                    {request.status === 'owner_accepted' && request.requesterId !== user?.id && (
                      <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs">
                        Waiting for requester confirmation...
                      </span>
                    )}

                    {request.status === 'pending' && request.ownerId !== user?.id && (
                      <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">
                        Waiting for owner response...
                      </span>
                    )}
                  </div>
                </div>

                {request.confirmationCode && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-800">
                      <strong>Confirmation Code:</strong> 
                      <span className="font-mono ml-2">{request.confirmationCode}</span>
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Use this code when meeting to complete the barter
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return renderUsers();
      case 'listings':
        return renderListings();
      case 'chat':
        return renderChat();
      case 'barters':
        return renderBarters();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {selectedCommunity.name}
        </h1>
        <p className="text-gray-600">{selectedCommunity.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveView('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'overview'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TrendingUp size={20} />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveView('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'users'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users size={20} />
                <span>Members</span>
              </button>
              <button
                onClick={() => setActiveView('listings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'listings'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package size={20} />
                <span>Listings</span>
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'chat'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageCircle size={20} />
                <span>General Chat</span>
              </button>
              <button
                onClick={() => setActiveView('barters')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'barters'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TrendingUp size={20} />
                <span>Barter Requests</span>
              </button>
              <button
                onClick={() => setShowCreateListing(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <Plus size={20} />
                <span>Add Listing</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {showCreateListing && (
        <CreateListing
          onClose={() => setShowCreateListing(false)}
          onSuccess={handleCreateListingSuccess}
        />
      )}

      {showBarterModal && selectedListing && (
        <BarterRequestModal
          listing={selectedListing}
          onClose={() => setShowBarterModal(false)}
          onSuccess={() => {
            setShowBarterModal(false);
            loadBarterRequests();
          }}
        />
      )}

      {showConfirmationModal && selectedRequest && (
        <BarterConfirmationModal
          request={selectedRequest}
          onClose={() => setShowConfirmationModal(false)}
          onSuccess={() => {
            setShowConfirmationModal(false);
            loadBarterRequests();
          }}
        />
      )}
    </div>
  );
}