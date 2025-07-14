import React from 'react';
import { Loader2 } from 'lucide-react';

interface DreamProgressProps {
  status: 'analyzing' | 'generating' | 'finalizing';
  progress: number;
}

export function DreamProgress({ status, progress }: DreamProgressProps) {
  const statusMessages = {
    analyzing: 'Analyzing dream patterns...',
    generating: 'Generating dream sequence...',
    finalizing: 'Finalizing your dream movie...',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        <span className="text-white">{statusMessages[status]}</span>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-400">
        {progress}% complete
      </p>
    </div>
  );
}