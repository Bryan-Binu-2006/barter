import React, { useState } from 'react';
import { X, Check, AlertCircle, Package } from 'lucide-react';
import { barterService } from '../services/barterService';
import { BarterRequest } from '../types/barter';

interface BarterConfirmationModalProps {
  request: BarterRequest;
  onClose: () => void;
  onSuccess: () => void;
}

export function BarterConfirmationModal({ request, onClose, onSuccess }: BarterConfirmationModalProps) {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      await barterService.completeBarter(request.id, confirmationCode.trim().toUpperCase());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid confirmation code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Check size={24} />
              <span>Complete Barter</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Barter Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Package size={20} className="text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">{request.listing.title}</h3>
                <p className="text-sm text-gray-600">
                  Between {request.requesterName} and {request.ownerName}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Offer:</strong> {request.offerDescription}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Est. Value: ${request.listing.estimatedValue}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Accepted
              </span>
            </div>
          </div>

          {/* Confirmation Code Display */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-emerald-900 mb-2">Your Confirmation Code:</h4>
            <div className="text-center">
              <span className="text-2xl font-mono font-bold text-emerald-800 bg-white px-4 py-2 rounded border">
                {request.confirmationCode}
              </span>
            </div>
            <p className="text-sm text-emerald-700 mt-2 text-center">
              Share this code with the other party during the exchange
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter the confirmation code to complete the barter
              </label>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center font-mono text-lg"
                placeholder="Enter confirmation code"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Both parties must enter the same code to complete the barter
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How to complete the barter:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Meet with the other party in person</li>
                <li>2. Exchange your items/services</li>
                <li>3. Both parties enter the confirmation code</li>
                <li>4. Barter is marked as completed!</li>
              </ol>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !confirmationCode.trim()}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Check size={18} />
                <span>{loading ? 'Completing...' : 'Complete Barter'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}