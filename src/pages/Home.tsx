import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, Users, Film, ChevronRight } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="relative inline-block">
          <Brain className="w-24 h-24 text-purple-400 animate-pulse" />
          <Sparkles className="w-8 h-8 text-yellow-400 absolute -right-2 -top-2 animate-bounce" />
        </div>
        <h1 className="text-6xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Transform Your Dreams
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Turn your subconscious adventures into mesmerizing animated films using the power of AI
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/new"
            className="px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium flex items-center group transition-all"
          >
            Start Your Journey
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/community"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
          >
            Explore Dreams
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 transform hover:scale-105 transition-transform">
          <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Dream Analysis</h3>
          <p className="text-gray-400">
            Advanced AI analyzes your dreams, identifying key themes, emotions, and symbols
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 transform hover:scale-105 transition-transform">
          <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <Film className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Visual Generation</h3>
          <p className="text-gray-400">
            Transform your dreams into stunning animated sequences with multiple artistic styles
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 transform hover:scale-105 transition-transform">
          <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Dream Community</h3>
          <p className="text-gray-400">
            Share your dream movies and connect with others in our growing dream community
          </p>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="text-center space-y-8">
        <h2 className="text-3xl font-bold">Featured Dream Movies</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Flying Through Clouds",
              image: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c",
              style: "Watercolor"
            },
            {
              title: "Cosmic Journey",
              image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986",
              style: "Cyberpunk"
            },
            {
              title: "Forest of Dreams",
              image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
              style: "Hand-drawn"
            }
          ].map((dream, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg aspect-video">
              <img
                src={dream.image}
                alt={dream.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-lg font-medium">{dream.title}</h3>
                  <p className="text-sm text-purple-300">{dream.style} Style</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link
          to="/community"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium"
        >
          View More Dreams
          <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-white/5 backdrop-blur-lg rounded-xl p-12 space-y-6">
        <h2 className="text-3xl font-bold">Ready to Visualize Your Dreams?</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Join our community of dreamers and start transforming your nocturnal adventures into stunning animated films
        </p>
        <Link
          to="/new"
          className="inline-flex items-center px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium group transition-colors"
        >
          Create Your First Dream Movie
          <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}