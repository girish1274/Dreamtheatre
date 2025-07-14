import React from 'react';

interface DreamTextAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export function DreamTextArea({ value, onChange }: DreamTextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Describe your dream..."
      className="w-full h-32 bg-white/10 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-400 focus:outline-none"
    />
  );
}