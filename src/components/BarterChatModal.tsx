import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Package, Check } from 'lucide-react';
import { barterService } from '../services/barterService';
import { BarterRequest } from '../types/barter';
import { useAuth } from '../contexts/AuthContext';

interface BarterChatModalProps {
  request: BarterRequest;
  onClose: () => void;
  onComplete: () => void;
}

export function BarterChatModal({ request, onClose, onComplete }: BarterChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(request.chatMessages || []);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const updatedRequest = await barterService.sendChatMessage(request.id, newMessage.trim());
      setMessages(updatedRequest.chatMessages || []);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationCode.trim()) return;

    setLoading(true);
    try {
      await barterService.completeBarter(request.id, confirmationCode.trim().toUpperCase());
      onComplete();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Invalid confirmation code');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user?.id === request.ownerId;
  const userConfirmationCode = isOwner ? request.ownerConfirmationCode : request.requesterConfirmationCode;
  const otherPartyName = isOwner ? request.requesterName : request.ownerName;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle size={24} className="text-emerald-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Private Chat</h2>
                <p className="text-sm text-gray-600">
                  Negotiating: {request.listing.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package size={20} className="text-gray-600" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{request.listing.title}</h3>
              <p className="text-sm text-gray-600">
                Trading with {otherPartyName} • Est. Value: ${request.listing.estimatedValue}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Both Accepted
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border-b border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-emerald-900">Your Confirmation Code:</h4>
              <span className="text-lg font-mono font-bold text-emerald-800">
                {userConfirmationCode}
              </span>
            </div>
            <button
              onClick={() => setShowConfirmation(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              Complete Transaction
            </button>
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            Share this code with {otherPartyName} when you meet to exchange items
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageCircle className="mx-auto mb-2" size={32} />
              <p>Start chatting to arrange your barter!</p>
              <p className="text-sm mt-1">Discuss meeting location, timing, and exchange details.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === user?.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.senderId !== user?.id && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {message.senderName}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === user?.id ? 'text-emerald-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>

        {showConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Transaction</h3>
              <p className="text-gray-600 mb-4">
                Enter the confirmation code that {otherPartyName} shared with you to complete this barter.
              </p>
              
              <form onSubmit={handleCompleteTransaction} className="space-y-4">
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center font-mono text-lg"
                  placeholder="Enter confirmation code"
                  maxLength={6}
                  required
                />
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !confirmationCode.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Completing...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Complete</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}