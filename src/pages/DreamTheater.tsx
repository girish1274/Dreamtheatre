import React from 'react';
import { DreamsList } from '../components/dream/DreamsList';
import { Library } from 'lucide-react';

export function DreamTheater() {
  return (
    <section className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <Library className="w-8 h-8 text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold">Your Dream Theater</h1>
          <p className="text-gray-400">Your personal collection of dream movies</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8">
        <DreamsList />
      </div>
    </section>
  );
}