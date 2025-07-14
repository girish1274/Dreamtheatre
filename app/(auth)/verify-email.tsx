import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Brain, Mail, RefreshCw, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check if user is already verified
    if (user?.email_confirmed_at) {
      setIsVerified(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    }
  }, [user]);

  useEffect(() => {
    // Cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      Alert.alert(
        'Email Sent',
        'A new verification email has been sent to your inbox.'
      );
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOpenEmailApp = () => {
    // This would open the default email app on mobile
    Alert.alert(
      'Open Email App',
      'Please check your email app for the verification link.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  if (isVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#10b981" />
          <Text style={styles.successTitle}>Email Verified!</Text>
          <Text style={styles.successText}>
            Your account has been successfully verified. Redirecting to your dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Brain size={64} color="#a855f7" />
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to
        </Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.instructionCard}>
          <Mail size={48} color="#a855f7" />
          <Text style={styles.instructionTitle}>Verify Your Email</Text>
          <Text style={styles.instructionText}>
            Click the verification link in your email to activate your account and start creating dream movies.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleOpenEmailApp}
          >
            <Mail size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Open Email App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (isResending || resendCooldown > 0) && styles.buttonDisabled
            ]}
            onPress={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
          >
            <RefreshCw size={20} color="#a855f7" />
            <Text style={styles.secondaryButtonText}>
              {isResending 
                ? 'Sending...' 
                : resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Email'
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Didn't receive the email?</Text>
          <Text style={styles.helpText}>
            • Check your spam or junk folder{'\n'}
            • Make sure you entered the correct email address{'\n'}
            • Wait a few minutes for the email to arrive{'\n'}
            • Try resending the verification email
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
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
  },
  email: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#a855f7',
    marginTop: 4,
  },
  content: {
    flex: 1,
    gap: 24,
  },
  instructionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a855f7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a855f7',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#a855f7',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helpSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#10b981',
    textAlign: 'center',
    lineHeight: 24,
  },
});