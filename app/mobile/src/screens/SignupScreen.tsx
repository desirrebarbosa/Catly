
import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, Image as RNImage, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

// Fix: Declare require to avoid TypeScript errors when node types are missing
declare var require: any;

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const useNavigation = (ReactNavigation as any).useNavigation;

export const SignupScreen = () => {
  const navigation = useNavigation();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    return null;
  };

  const handleSignup = async () => {
    if (!email || !password || !username) return Alert.alert('Error', 'Please fill in all fields');
    
    // Password Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
        return Alert.alert('Weak Password', passwordError);
    }

    setLoading(true);
    const result = await signup(email, password, username);
    setLoading(false);
    
    if (!result.success) {
        Alert.alert('Signup Failed', result.error);
    }
    // Success handling is managed by AuthContext.isNewUser triggering App.tsx navigation
  };

  return (
    <View className="flex-1 bg-primary">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="h-[35%] justify-center items-center">
          <Image source={require('../../assets/catly-logo-white.png')} className="w-40 h-40" resizeMode="contain" />
        </View>

        <View className="flex-1 bg-white rounded-t-[30px] px-8 pt-10 items-center">
          <Text className="text-primary font-medium text-lg mb-8">Start your purr-fect journey!</Text>

          <View className="w-full mb-4">
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-base text-secondary mb-4"
              placeholder="Email"
              placeholderTextColor="#9FA5C0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-base text-secondary mb-4"
              placeholder="Username"
              placeholderTextColor="#9FA5C0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-base text-secondary"
              placeholder="Password"
              placeholderTextColor="#9FA5C0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text className="text-gray-400 text-xs mt-2 ml-1">
               Must be 8+ chars with 1 uppercase & 1 number.
            </Text>
          </View>

          <View className="w-full px-5 mt-2">
            <Button title="Sign up" onPress={handleSignup} loading={loading} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-5">
            <Text className="text-gray-400">
              Already have an account? <Text className="text-primary font-bold underline">Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
