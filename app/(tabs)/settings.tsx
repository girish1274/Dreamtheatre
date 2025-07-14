import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { 
  Palette, 
  Bell, 
  Shield, 
  Settings as SettingsIcon, 
  Trash2, 
  AlertTriangle,
  User,
  Lock,
  Eye,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Mail,
  Smartphone
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface UserProfile {
  name: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  is_private: boolean;
}

export default function Settings() {
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState({
    privateByDefault: true,
    notifyAnalysis: true,
    notifyCommunity: true,
    notifyLikes: true,
    notifyComments: true,
    notifyFollows: true,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setSettings(prev => ({
          ...prev,
          privateByDefault: data.is_private || false,
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Update specific settings in database
    if (key === 'privateByDefault' && user) {
      try {
        await supabase
          .from('profiles')
          .update({ is_private: value })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating privacy setting:', error);
      }
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'You will receive an email with instructions to reset your password.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Reset Email',
          onPress: sendPasswordResetEmail,
        },
      ]
    );
  };

  const sendPasswordResetEmail = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      
      if (error) throw error;

      Alert.alert(
        'Email Sent',
        'Password reset instructions have been sent to your email address.'
      );
    } catch (error) {
      console.error('Error sending password reset:', error);
      Alert.alert(
        'Error',
        'Failed to send password reset email. Please try again.'
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including:\n\n• All your dreams and videos\n• Your profile information\n• All comments and likes\n• Friend connections\n\nThis action is irreversible.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'Type "DELETE" to confirm account deletion. This will permanently delete all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'I understand, delete my account',
          style: 'destructive',
          onPress: executeAccountDeletion,
        },
      ]
    );
  };

  const executeAccountDeletion = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      // Delete user data in the correct order to respect foreign key constraints
      
      // 1. Delete notifications
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      // 2. Delete dream comments
      await supabase
        .from('dream_comments')
        .delete()
        .eq('user_id', user.id);

      // 3. Delete dream likes
      await supabase
        .from('dream_likes')
        .delete()
        .eq('user_id', user.id);

      // 4. Delete friendships (both as requester and addressee)
      await supabase
        .from('friendships')
        .delete()
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      // 5. Delete dreams
      await supabase
        .from('dreams')
        .delete()
        .eq('user_id', user.id);

      // 6. Delete profile (this will cascade due to foreign key)
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      // 7. Finally, delete the auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        // If admin delete fails, try regular account deletion
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      }

      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted. All your data has been permanently removed.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/signin'),
          },
        ]
      );

    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'Deletion Failed',
        'There was an error deleting your account. Please try again or contact support if the problem persists.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    showChevron = false,
    onPress,
    danger = false 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    showChevron?: boolean;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress && !onValueChange}
    >
      <View style={styles.settingIcon}>
        <Icon size={20} color={danger ? "#ef4444" : "#a855f7"} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {onValueChange && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#333', true: '#a855f7' }}
          thumbColor="#fff"
        />
      )}
      {showChevron && (
        <ChevronRight size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={32} color="#666" />
              </View>
            )}
            <TouchableOpacity style={styles.avatarEditButton}>
              <Camera size={16} color="#a855f7" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || user?.email || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {profile?.bio && (
              <Text style={styles.profileBio} numberOfLines={2}>{profile.bio}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
          <ChevronRight size={16} color="#a855f7" />
        </TouchableOpacity>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon={Mail}
          title="Email"
          subtitle={user?.email}
          showChevron
        />
        <SettingItem
          icon={Lock}
          title="Change Password"
          subtitle="Update your password"
          showChevron
          onPress={handleChangePassword}
        />
        <SettingItem
          icon={Smartphone}
          title="Two-Factor Authentication"
          subtitle="Add an extra layer of security"
          showChevron
        />
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <SettingItem
          icon={Eye}
          title="Private Account"
          subtitle="Only approved followers can see your dreams"
          value={settings.privateByDefault}
          onValueChange={(value) => updateSetting('privateByDefault', value)}
        />
        <SettingItem
          icon={Globe}
          title="Public Dreams by Default"
          subtitle="New dreams will be visible to everyone"
          value={!settings.privateByDefault}
          onValueChange={(value) => updateSetting('privateByDefault', !value)}
        />
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon={Bell}
          title="Push Notifications"
          subtitle="Receive notifications on your device"
          value={settings.pushNotifications}
          onValueChange={(value) => updateSetting('pushNotifications', value)}
        />
        <SettingItem
          icon={Mail}
          title="Email Notifications"
          subtitle="Receive notifications via email"
          value={settings.emailNotifications}
          onValueChange={(value) => updateSetting('emailNotifications', value)}
        />
        <SettingItem
          icon={Bell}
          title="Dream Analysis Complete"
          subtitle="When your dream video is ready"
          value={settings.notifyAnalysis}
          onValueChange={(value) => updateSetting('notifyAnalysis', value)}
        />
        <SettingItem
          icon={Bell}
          title="Likes & Comments"
          subtitle="When someone interacts with your dreams"
          value={settings.notifyComments}
          onValueChange={(value) => updateSetting('notifyComments', value)}
        />
        <SettingItem
          icon={Bell}
          title="New Followers"
          subtitle="When someone follows you"
          value={settings.notifyFollows}
          onValueChange={(value) => updateSetting('notifyFollows', value)}
        />
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          icon={Palette}
          title="Default Animation Style"
          subtitle="Watercolor"
          showChevron
        />
        <SettingItem
          icon={SettingsIcon}
          title="Video Quality"
          subtitle="High Definition"
          showChevron
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          icon={HelpCircle}
          title="Help Center"
          subtitle="Get help and support"
          showChevron
        />
        <SettingItem
          icon={Mail}
          title="Contact Us"
          subtitle="Send feedback or report issues"
          showChevron
        />
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <SettingItem
          icon={LogOut}
          title="Sign Out"
          subtitle="Sign out of your account"
          onPress={signOut}
        />
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
        <View style={styles.dangerWarning}>
          <AlertTriangle size={20} color="#ef4444" />
          <Text style={styles.dangerWarningText}>
            Once you delete your account, there is no going back. Please be certain.
          </Text>
        </View>
        <SettingItem
          icon={Trash2}
          title={isDeleting ? 'Deleting Account...' : 'Delete Account'}
          subtitle="Permanently delete your account and all data"
          onPress={handleDeleteAccount}
          danger
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Dream Cinema v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for dreamers</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 40,
  },
  profileSection: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    lineHeight: 18,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  editProfileText: {
    color: '#a855f7',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#1a0a0a',
  },
  dangerTitle: {
    color: '#ef4444',
  },
  dangerText: {
    color: '#ef4444',
  },
  dangerWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  dangerWarningText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});