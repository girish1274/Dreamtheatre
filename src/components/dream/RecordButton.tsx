import React from 'react';
import { Mic } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export function RecordButton({ isRecording, onClick }: RecordButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full ${
        isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-500'
      } text-white transition-colors hover:opacity-90`}
    >
      <Mic className="w-6 h-6" />
    </button>
  );
}