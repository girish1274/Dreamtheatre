import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { SignUpForm } from '../components/auth/SignUpForm';

export function SignUp() {
  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Brain className="w-16 h-16 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Join Dream Cinema</h1>
        <p className="text-gray-400">Create an account to start your journey</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8">
        <SignUpForm />
        
        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/signin" className="text-purple-400 hover:text-purple-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}