import React from 'react';
import { Palette } from 'lucide-react';
import type { AnimationStyle } from '../../types';

interface StyleCardProps {
  id: AnimationStyle;
  name: string;
  description: string;
  onSelect: (style: AnimationStyle) => void;
}

export function StyleCard({ id, name, description, onSelect }: StyleCardProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className="bg-white/5 hover:bg-white/10 p-4 rounded-lg transition-colors group"
    >
      <div className="flex items-center space-x-2 mb-2">
        <Palette className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
        <h3 className="text-lg font-medium text-white">{name}</h3>
      </div>
      <p className="text-sm text-gray-400 group-hover:text-gray-300">{description}</p>
    </button>
  );
}