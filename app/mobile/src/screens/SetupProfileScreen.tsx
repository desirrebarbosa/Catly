import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;

export const SetupProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await updateProfile({ name, phone, about });
    setLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  };

  return (
    <View className="flex-1 bg-primary">
       <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="bg-white rounded-3xl p-6 shadow-md items-center">
          <Text className="text-xl font-bold text-secondary italic mb-6">Set Up Your Account</Text>

          <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-6">
            <Text className="text-4xl">👤</Text>
            <View className="absolute bottom-0 right-0 bg-primary w-6 h-6 rounded-full justify-center items-center border-2 border-white">
               <Text className="text-white text-xs font-bold">+</Text>
            </View>
          </View>

          <View className="w-full">
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-base text-secondary mb-4"
              placeholder="Name"
              placeholderTextColor="#9FA5C0"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-base text-secondary mb-4"
              placeholder="Phone Number"
              placeholderTextColor="#9FA5C0"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-base text-secondary h-20 mb-4"
              placeholder="About Yourself"
              placeholderTextColor="#9FA5C0"
              value={about}
              onChangeText={setAbout}
              multiline
              textAlignVertical="top"
            />
            <Button title="Save Details" onPress={handleSave} loading={loading} className="bg-gray-800" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};