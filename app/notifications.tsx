import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Settings,
  Check,
  X
} from 'lucide-react-native';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accepted' | 'dream_featured';
  title: string;
  message: string;
  data: {
    user_id?: string;
    user_name?: string;
    user_avatar?: string;
    dream_id?: string;
    dream_title?: string;
    friendship_id?: string;
  };
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          title: 'New Like',
          message: 'Alice liked your dream "Flying Through Clouds"',
          data: {
            user_id: 'user1',
            user_name: 'Alice Johnson',
            user_avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            dream_id: 'dream1',
            dream_title: 'Flying Through Clouds',
          },
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: '2',
          type: 'comment',
          title: 'New Comment',
          message: 'Bob commented on your dream "Ocean Depths"',
          data: {
            user_id: 'user2',
            user_name: 'Bob Smith',
            dream_id: 'dream2',
            dream_title: 'Ocean Depths',
          },
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'friend_request',
          title: 'Friend Request',
          message: 'Carol sent you a friend request',
          data: {
            user_id: 'user3',
            user_name: 'Carol Davis',
            user_avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
            friendship_id: 'friendship1',
          },
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        },
        {
          id: '4',
          type: 'friend_accepted',
          title: 'Friend Request Accepted',
          message: 'David accepted your friend request',
          data: {
            user_id: 'user4',
            user_name: 'David Wilson',
          },
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: '5',
          type: 'dream_featured',
          title: 'Dream Featured',
          message: 'Your dream "Cosmic Journey" was featured in trending!',
          data: {
            dream_id: 'dream3',
            dream_title: 'Cosmic Journey',
          },
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Update in database
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleFriendRequest = async (friendshipId: string, action: 'accept' | 'decline') => {
    try {
      const status = action === 'accept' ? 'accepted' : 'declined';
      
      await supabase
        .from('friendships')
        .update({ status })
        .eq('id', friendshipId);

      // Remove notification from list
      setNotifications(prev =>
        prev.filter(notif => notif.data.friendship_id !== friendshipId)
      );

      Alert.alert(
        'Success',
        `Friend request ${action === 'accept' ? 'accepted' : 'declined'}`
      );
    } catch (error) {
      console.error('Error handling friend request:', error);
      Alert.alert('Error', 'Failed to update friend request');
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);

    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'dream_featured':
        if (notification.data.dream_id) {
          router.push(`/dream/${notification.data.dream_id}`);
        }
        break;
      case 'friend_request':
      case 'friend_accepted':
        if (notification.data.user_id) {
          router.push(`/profile/${notification.data.user_id}`);
        }
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={20} color="#ef4444" fill="#ef4444" />;
      case 'comment':
        return <MessageCircle size={20} color="#3b82f6" />;
      case 'friend_request':
      case 'friend_accepted':
        return <UserPlus size={20} color="#10b981" />;
      case 'dream_featured':
        return <Heart size={20} color="#f59e0b" fill="#f59e0b" />;
      default:
        return <Heart size={20} color="#666" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          {item.data.user_avatar ? (
            <Image source={{ uri: item.data.user_avatar }} style={styles.userAvatar} />
          ) : item.data.user_name ? (
            <View style={styles.userAvatarPlaceholder}>
              <Text style={styles.userAvatarText}>
                {item.data.user_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : null}
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{formatTimeAgo(item.created_at)}</Text>
          </View>
        </View>

        {item.type === 'friend_request' && !item.read && (
          <View style={styles.friendRequestActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleFriendRequest(item.data.friendship_id!, 'accept')}
            >
              <Check size={16} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleFriendRequest(item.data.friendship_id!, 'decline')}
            >
              <X size={16} color="#666" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                You'll see likes, comments, and friend requests here
              </Text>
            </View>
          }
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  settingsButton: {
    padding: 8,
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
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  unreadNotification: {
    backgroundColor: '#0a0a0a',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  notificationMessage: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  friendRequestActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  declineButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  declineButtonText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a855f7',
    marginLeft: 8,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});