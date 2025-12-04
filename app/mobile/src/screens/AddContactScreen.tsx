import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const useNavigation = (ReactNavigation as any).useNavigation;

export const AddContactScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Vet');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
      if(!name) return Alert.alert("Error", "Name is required");
      setLoading(true);
      const res = await api.post('/contacts', { name, role, phone, email });
      setLoading(false);
      if(res.success) navigation.goBack();
      else Alert.alert("Error", "Failed to save");
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary shadow-sm z-10">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">New Contact</Text>
            <View className="w-10" />
          </View>
      </View>
      <View className="p-6 gap-6">
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Name</Text>
              <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base" value={name} onChangeText={setName} />
          </View>
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Role</Text>
              <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base" value={role} onChangeText={setRole} placeholder="e.g. Vet, Breeder" />
          </View>
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Phone</Text>
              <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
           <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Email</Text>
              <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base" value={email} onChangeText={setEmail} keyboardType="email-address" />
          </View>
          <Button title="Save Contact" onPress={handleSave} loading={loading} className="mt-4" />
      </View>
    </View>
  );
};
