import React, { useState } from 'react';
import { SignInForm } from '../components/auth/SignInForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { Brain, UserPlus, LogIn } from 'lucide-react';

export function Account() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Brain className="w-16 h-16 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Dream Cinema</h1>
        <p className="text-gray-400">Join our community of dreamers</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              mode === 'signin'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              mode === 'signup'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            Sign Up
          </button>
        </div>

        {mode === 'signin' ? <SignInForm /> : <SignUpForm />}
      </div>
    </div>
  );
}