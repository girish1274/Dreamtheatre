import React from 'react';
import { Heart } from 'lucide-react';

const emotions = [
  { id: 'joy', label: 'Joy', color: 'bg-yellow-500' },
  { id: 'fear', label: 'Fear', color: 'bg-red-500' },
  { id: 'peace', label: 'Peace', color: 'bg-blue-500' },
  { id: 'mystery', label: 'Mystery', color: 'bg-purple-500' },
  { id: 'anxiety', label: 'Anxiety', color: 'bg-orange-500' },
  { id: 'love', label: 'Love', color: 'bg-pink-500' },
];

interface EmotionPickerProps {
  selectedEmotions: string[];
  onSelect: (emotion: string) => void;
}

export function EmotionPicker({ selectedEmotions, onSelect }: EmotionPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Heart className="w-5 h-5 text-purple-400" />
        <span className="text-white">How did this dream make you feel?</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {emotions.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`p-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
              selectedEmotions.includes(id)
                ? `${color} text-white`
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}