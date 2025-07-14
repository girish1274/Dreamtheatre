import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  ArrowLeft, 
  Settings, 
  UserPlus, 
  MessageCircle,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Play,
  Heart,
  Eye
} from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Dream } from '../../src/types';

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  is_private: boolean;
  created_at: string;
  dream_count: number;
  friends_count: number;
  is_friend: boolean;
  is_own_profile: boolean;
}

interface ProfileDream extends Dream {
  likes_count: number;
  views_count: number;
}

export default function Profile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dreams, setDreams] = useState<ProfileDream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dreams' | 'liked'>('dreams');

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchUserDreams();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get dream count
      const { count: dreamCount } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('is_public', true);

      // Get friends count (mock for now)
      const friendsCount = 42;

      const userProfile: UserProfile = {
        ...data,
        dream_count: dreamCount || 0,
        friends_count: friendsCount,
        is_friend: false, // TODO: Check friendship status
        is_own_profile: user?.id === id,
      };

      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDreams = async () => {
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select(`
          *,
          dream_likes(count)
        `)
        .eq('user_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profileDreams = data?.map(dream => ({
        ...dream,
        likes_count: dream.dream_likes?.length || 0,
        views_count: Math.floor(Math.random() * 1000) + 100, // Mock views
      })) || [];

      setDreams(profileDreams);
    } catch (error) {
      console.error('Error fetching user dreams:', error);
    }
  };

  const handleFollowUser = async () => {
    if (!profile || !user) return;

    try {
      if (profile.is_friend) {
        // Unfollow logic
        console.log('Unfollow user');
      } else {
        // Follow logic
        await supabase
          .from('friendships')
          .insert({
            requester_id: user.id,
            addressee_id: profile.id,
            status: 'pending',
          });
        
        Alert.alert('Success', 'Friend request sent!');
      }
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const renderDreamCard = ({ item }: { item: ProfileDream }) => (
    <TouchableOpacity 
      style={styles.dreamCard}
      onPress={() => router.push(`/dream/${item.id}`)}
    >
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg' }}
        style={styles.dreamImage}
      />
      <View style={styles.dreamOverlay}>
        <Play size={24} color="#fff" fill="#fff" />
      </View>
      <View style={styles.dreamInfo}>
        <Text style={styles.dreamTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.dreamStats}>
          <View style={styles.statItem}>
            <Heart size={12} color="#666" />
            <Text style={styles.statText}>{item.likes_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Eye size={12} color="#666" />
            <Text style={styles.statText}>{item.views_count}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        {profile.is_own_profile && (
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
            <Settings size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.profileAvatar} />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarText}>
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.profileName}>{profile.name}</Text>

          {profile.bio && (
            <Text style={styles.profileBio}>{profile.bio}</Text>
          )}

          <View style={styles.profileMeta}>
            <View style={styles.metaItem}>
              <Calendar size={16} color="#666" />
              <Text style={styles.metaText}>
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
            {profile.website && (
              <View style={styles.metaItem}>
                <LinkIcon size={16} color="#666" />
                <Text style={styles.metaLink}>{profile.website}</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.dream_count}</Text>
              <Text style={styles.statLabel}>Dreams</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.friends_count}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12.5k</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!profile.is_own_profile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleFollowUser}
              >
                <UserPlus size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  {profile.is_friend ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                <MessageCircle size={20} color="#a855f7" />
                <Text style={styles.secondaryButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dreams' && styles.activeTab]}
            onPress={() => setActiveTab('dreams')}
          >
            <Text style={[styles.tabText, activeTab === 'dreams' && styles.activeTabText]}>
              Dreams ({profile.dream_count})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
            onPress={() => setActiveTab('liked')}
          >
            <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>
              Liked
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dreams Grid */}
        <View style={styles.dreamsGrid}>
          <FlatList
            data={dreams}
            keyExtractor={(item) => item.id}
            renderItem={renderDreamCard}
            numColumns={2}
            columnWrapperStyle={styles.dreamRow}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {activeTab === 'dreams' 
                    ? 'No dreams shared yet' 
                    : 'No liked dreams yet'}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'Inter-Bold',
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  profileBio: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  profileMeta: {
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  metaLink: {
    color: '#a855f7',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 32,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#a855f7',
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButtonText: {
    color: '#a855f7',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#a855f7',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: '#a855f7',
  },
  dreamsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dreamRow: {
    justifyContent: 'space-between',
  },
  dreamCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  dreamImage: {
    width: '100%',
    height: 120,
  },
  dreamOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  dreamInfo: {
    padding: 12,
  },
  dreamTitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  dreamStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});