import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Brain, ChevronRight, Play, Sparkles, PlusCircle, Users } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface RecentDream {
  id: string;
  title: string;
  created_at: string;
  keywords: string[];
}

export default function Home() {
  const { user } = useAuth();
  const [recentDreams, setRecentDreams] = useState<RecentDream[]>([]);
  const [dreamCount, setDreamCount] = useState(0);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data: dreams, error } = await supabase
        .from('dreams')
        .select('id, title, created_at, keywords')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      setRecentDreams(dreams || []);
      setDreamCount(dreams?.length || 0);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const featuredDreams = [
    {
      title: "Flying Through Clouds",
      image: "https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg",
      style: "Watercolor"
    },
    {
      title: "Cosmic Journey",
      image: "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg",
      style: "Cyberpunk"
    },
    {
      title: "Forest of Dreams",
      image: "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg",
      style: "Hand-drawn"
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.iconContainer}>
          <Brain size={64} color="#a855f7" />
          <Sparkles size={24} color="#fbbf24" style={styles.sparkles} />
        </View>
        <Text style={styles.welcomeText}>Welcome back, {user?.user_metadata?.name || 'Dreamer'}!</Text>
        <Text style={styles.title}>Transform Your Dreams</Text>
        <Text style={styles.subtitle}>
          Turn your subconscious adventures into mesmerizing animated films
        </Text>
        <Link href="/new-dream" asChild>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Create New Dream</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dreamCount}</Text>
          <Text style={styles.statLabel}>Dreams Created</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {recentDreams.length > 0 ? new Date(recentDreams[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
          </Text>
          <Text style={styles.statLabel}>Last Dream</Text>
        </View>
      </View>

      {/* Recent Dreams */}
      {recentDreams.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Dreams</Text>
            <Link href="/dream-theater" asChild>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {recentDreams.map((dream) => (
              <View key={dream.id} style={styles.recentDreamCard}>
                <View style={styles.dreamPreview}>
                  <Image
                    source={{ uri: "https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg" }}
                    style={styles.dreamImage}
                  />
                  <View style={styles.playOverlay}>
                    <Play size={24} color="#fff" fill="#fff" />
                  </View>
                </View>
                <Text style={styles.dreamTitle} numberOfLines={1}>{dream.title}</Text>
                <Text style={styles.dreamDate}>
                  {new Date(dream.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Dreams */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Dream Movies</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {featuredDreams.map((dream, index) => (
            <View key={index} style={styles.featuredDreamCard}>
              <Image
                source={{ uri: dream.image }}
                style={styles.featuredDreamImage}
              />
              <View style={styles.dreamOverlay}>
                <Text style={styles.featuredDreamTitle}>{dream.title}</Text>
                <Text style={styles.featuredDreamStyle}>{dream.style} Style</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Link href="/new-dream" asChild>
            <TouchableOpacity style={styles.quickActionCard}>
              <PlusCircle size={32} color="#a855f7" />
              <Text style={styles.quickActionTitle}>New Dream</Text>
              <Text style={styles.quickActionSubtitle}>Record a new dream</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/community" asChild>
            <TouchableOpacity style={styles.quickActionCard}>
              <Users size={32} color="#a855f7" />
              <Text style={styles.quickActionTitle}>Explore</Text>
              <Text style={styles.quickActionSubtitle}>Browse community</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  hero: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  sparkles: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#a855f7',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a855f7',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#a855f7',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#a855f7',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  recentDreamCard: {
    width: 160,
    marginRight: 16,
  },
  dreamPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dreamImage: {
    width: '100%',
    height: 120,
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(168, 85, 247, 0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dreamTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  dreamDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  featuredDreamCard: {
    width: width * 0.7,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredDreamImage: {
    width: '100%',
    height: 200,
  },
  dreamOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  featuredDreamTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  featuredDreamStyle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#a855f7',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
});