import React from 'react';
import { DreamForm } from '../components/dream/DreamForm';

export function NewDream() {
  return (
    <section className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
          Transform Your Dreams
        </h1>
        <p className="text-xl text-gray-300">
          Turn your subconscious adventures into mesmerizing animated films
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Create Your Dream Movie</h2>
        <DreamForm />
      </div>
    </section>
  );
}