import React from 'react';
import { Play, Share2, Edit3 } from 'lucide-react';
import type { Dream } from '../../types';

export function DreamGallery({ dreams }: { dreams: Dream[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dreams.map((dream) => (
        <div key={dream.id} className="bg-white/5 rounded-lg overflow-hidden">
          <div className="aspect-video bg-purple-900/50 relative group">
            <Play className="absolute inset-0 m-auto w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-2">{dream.title}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {dream.emotions.map((emotion, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300"
                >
                  {emotion}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {dream.createdAt.toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Edit3 className="w-4 h-4 text-purple-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Share2 className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}