import React from 'react';
import { DreamCommunity } from '../components/community/DreamCommunity';
import { Users } from 'lucide-react';

export function Community() {
  return (
    <section className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <Users className="w-8 h-8 text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold">Dream Community</h1>
          <p className="text-gray-400">Explore and share dreams with others</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8">
        <DreamCommunity />
      </div>
    </section>
  );
}