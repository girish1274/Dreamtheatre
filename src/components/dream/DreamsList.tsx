import React, { useEffect, useState } from 'react';
import { Play, Calendar, Tag } from 'lucide-react';
import type { Dream } from '../../types';
import { supabase } from '../../lib/supabase';

export function DreamsList() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Please sign in to view your dreams');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('dreams')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setDreams(data || []);
      } catch (err) {
        setError('Failed to fetch dreams');
        console.error('Error fetching dreams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDreams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (dreams.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-400">No dreams recorded yet</h3>
        <p className="text-gray-500 mt-2">Your dream journey begins with the first record</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dreams.map((dream) => (
        <div key={dream.id} className="bg-white/5 backdrop-blur-lg rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
          <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-indigo-900/50 relative group">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-4 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors">
                <Play className="w-6 h-6 text-white" fill="currentColor" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-2">{dream.title}</h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {dream.emotions.map((emotion, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300"
                >
                  {emotion}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(dream.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{dream.keywords.length} keywords</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}