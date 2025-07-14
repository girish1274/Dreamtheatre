import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Play, Calendar } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import type { Dream } from '../../src/types';

export default function DreamTheater() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDreams(data || []);
    } catch (error) {
      console.error('Error fetching dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your dreams...</Text>
      </View>
    );
  }

  if (dreams.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No dreams recorded yet</Text>
        <Text style={styles.emptySubtext}>Your dream journey begins with the first record</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={dreams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.dreamCard}>
            <View style={styles.dreamPreview}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c' }}
                style={styles.dreamImage}
              />
              <TouchableOpacity style={styles.playButton}>
                <Play size={24} color="#fff" fill="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.dreamInfo}>
              <Text style={styles.dreamTitle}>{item.title}</Text>
              <View style={styles.dreamMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.keywordList}>
                {item.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keyword}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    padding: 20,
  },
  dreamCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  dreamPreview: {
    position: 'relative',
    height: 200,
  },
  dreamImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dreamInfo: {
    padding: 16,
  },
  dreamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  dreamMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keyword: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keywordText: {
    color: '#a855f7',
    fontSize: 14,
  },
});