import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Brain, User, Camera, Globe, FileText, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CompleteProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    bio: '',
    website: '',
    avatar_url: '',
    is_private: false,
  });

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          name: formData.name.trim(),
          bio: formData.bio.trim() || null,
          website: formData.website.trim() || null,
          avatar_url: formData.avatar_url.trim() || null,
          is_private: formData.is_private,
        });

      if (error) throw error;

      Alert.alert(
        'Profile Created!',
        'Welcome to Dream Cinema. Start creating your first dream movie!',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can always complete your profile later in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Brain size={64} color="#a855f7" />
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Let the community know who you are and what inspires your dreams
        </Text>
      </View>

      <View style={styles.form}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {formData.avatar_url ? (
              <Image source={{ uri: formData.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#666" />
              </View>
            )}
            <TouchableOpacity style={styles.avatarButton}>
              <Camera size={20} color="#a855f7" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarLabel}>Profile Photo</Text>
        </View>

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Name *</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your display name"
              placeholderTextColor="#666"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              maxLength={50}
            />
          </View>
          <Text style={styles.characterCount}>{formData.name.length}/50</Text>
        </View>

        {/* Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <View style={styles.textAreaContainer}>
            <FileText size={20} color="#666" style={styles.textAreaIcon} />
            <TextInput
              style={styles.textArea}
              placeholder="Tell us about yourself and your dreams..."
              placeholderTextColor="#666"
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={160}
            />
          </View>
          <Text style={styles.characterCount}>{formData.bio.length}/160</Text>
        </View>

        {/* Website */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website</Text>
          <View style={styles.inputContainer}>
            <Globe size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="https://yourwebsite.com"
              placeholderTextColor="#666"
              value={formData.website}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>

        {/* Privacy Setting */}
        <View style={styles.privacySection}>
          <View style={styles.privacyHeader}>
            <Text style={styles.privacyTitle}>Privacy Settings</Text>
            <Text style={styles.privacySubtitle}>
              Control who can see your profile and dreams
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.privacyOption}
            onPress={() => setFormData({ ...formData, is_private: !formData.is_private })}
          >
            <View style={styles.privacyOptionContent}>
              <Text style={styles.privacyOptionTitle}>Private Account</Text>
              <Text style={styles.privacyOptionDescription}>
                Only approved followers can see your dreams
              </Text>
            </View>
            <View style={[
              styles.toggle,
              formData.is_private && styles.toggleActive
            ]}>
              <View style={[
                styles.toggleThumb,
                formData.is_private && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    minHeight: 100,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'right',
  },
  privacySection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  privacyHeader: {
    marginBottom: 16,
  },
  privacyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  privacySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyOptionContent: {
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  privacyOptionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#a855f7',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  actions: {
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a855f7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});