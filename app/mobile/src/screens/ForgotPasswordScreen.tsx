import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await api.post('/auth/password-reset', { email });
    setLoading(false);
    Alert.alert('Check Email', 'Reset instructions sent.', [{ text: 'Back to Login', onPress: () => navigation.goBack() }]);
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="h-[30%] justify-center items-center">
        <Text className="text-6xl">🔒</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-12 left-5 bg-white/20 px-3 py-2 rounded-lg">
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 bg-white rounded-t-[30px] p-8 items-center">
        <Text className="text-xl font-bold text-secondary mb-2">Forgot Password?</Text>
        <Text className="text-gray-500 text-center mb-8 px-4">Don't worry! Enter your email associated with your account.</Text>
        
        <View className="w-full mb-6">
          <Text className="font-bold text-gray-700 mb-2">Email Address</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
            placeholder="Enter your email" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
          />
        </View>
        
        <View className="w-full">
          <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />
        </View>
      </View>
    </View>
  );
};