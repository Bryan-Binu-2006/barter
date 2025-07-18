import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Check, XCircle, MessageCircle } from 'lucide-react';
import { barterService } from '../services/barterService';
import { BarterRequest } from '../types/barter';
import { useAuth } from '../contexts/AuthContext';

interface BarterRequestsModalProps {
  onClose: () => void;
  onOpenChat: (request: BarterRequest) => void;
}

export function BarterRequestsModal({ onClose, onOpenChat }: BarterRequestsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<BarterRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<BarterRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    if (!user) return;
    
    try {
      const [received, sent] = await Promise.all([
        barterService.getRequestsForMyListings(user.id),
        barterService.getMyRequests(user.id)
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    try {
      await barterService.respondToRequest(requestId, accept);
      await loadRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'owner_accepted':
        return 'bg-blue-100 text-blue-800';
      case 'both_accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRequest = (request: BarterRequest) => {
    const isOwner = user && request.ownerId === user.id;
    
    return (
      <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Package className="text-gray-600" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">{request.listing.title}</h3>
              <p className="text-sm text-gray-600">
                {isOwner ? `From ${request.requesterName}` : `To ${request.ownerName}`}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {request.status.replace('_', ' ')}
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
            {isOwner && request.status === 'pending' && (
              <>
                <button
                  onClick={() => handleRespond(request.id, true)}
                  className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  <Check size={14} />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => handleRespond(request.id, false)}
                  className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  <XCircle size={14} />
                  <span>Decline</span>
                </button>
              </>
            )}
            
            {!isOwner && request.status === 'owner_accepted' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRespond(request.id, true)}
                  className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  <Check size={14} />
                  <span>Confirm</span>
                </button>
                <button
                  onClick={() => handleRespond(request.id, false)}
                  className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  <XCircle size={14} />
                  <span>Decline</span>
                </button>
              </div>
            )}

            {request.status === 'both_accepted' && (
              <button
                onClick={() => onOpenChat(request)}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <MessageCircle size={14} />
                <span>Chat</span>
              </button>
            )}

            {request.status === 'both_accepted' && request.ownerConfirmationCode && (
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Code: {isOwner ? request.ownerConfirmationCode : request.requesterConfirmationCode}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Barter Requests</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'received'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sent ({sentRequests.length})
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading requests...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'received' ? (
                receivedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests received</h3>
                    <p className="text-gray-600">When someone wants to barter for your items, they'll appear here.</p>
                  </div>
                ) : (
                  receivedRequests.map(renderRequest)
                )
              ) : (
                sentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests sent</h3>
                    <p className="text-gray-600">Start browsing listings to send your first barter request!</p>
                  </div>
                ) : (
                  sentRequests.map(renderRequest)
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}