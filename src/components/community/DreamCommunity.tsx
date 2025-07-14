import React from 'react';
import { MessageCircle, Heart, Eye } from 'lucide-react';

export function DreamCommunity() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white mb-6">Dream Community</h2>
      
      <div className="grid gap-6">
        {/* Community dream posts would be mapped here */}
        <div className="bg-white/5 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-white">Flying Through Clouds</h3>
              <p className="text-sm text-gray-400">Shared anonymously</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                245
              </span>
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                56
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                12
              </span>
            </div>
          </div>
          
          <div className="aspect-video bg-purple-900/50 rounded-lg mb-4" />
          
          <p className="text-gray-300 mb-4">
            In this dream, I found myself soaring through cotton-candy clouds...
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300">
              flying
            </span>
            <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300">
              freedom
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}