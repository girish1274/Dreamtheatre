import React from 'react';
import { Tag, X } from 'lucide-react';

interface KeywordInputProps {
  keywords: string[];
  onAdd: (keyword: string) => void;
  onRemove: (index: number) => void;
}

export function KeywordInput({ keywords, onAdd, onRemove }: KeywordInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="w-5 h-5 text-purple-400" />
        <input
          type="text"
          placeholder="Add keywords (press Enter)"
          className="bg-transparent border-b border-purple-400 text-white placeholder-gray-400 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              onAdd(e.currentTarget.value.trim());
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-purple-500/30 rounded-full text-sm text-white flex items-center gap-2"
          >
            {keyword}
            <button
              onClick={() => onRemove(index)}
              className="hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}