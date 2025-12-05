
import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, ScrollView, TouchableOpacity as RNTouchableOpacity, Image as RNImage, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ChevronLeftIcon as ChevronLeftIconOutline } from 'react-native-heroicons/outline';
import { CameraIcon as CameraIconSolid, PlusIcon as PlusIconSolid } from 'react-native-heroicons/solid';
import * as ImagePicker from 'expo-image-picker';

const ChevronLeftIcon = ChevronLeftIconOutline as any;
const CameraIcon = CameraIconSolid as any;
const PlusIcon = PlusIconSolid as any;

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const Image = RNImage as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

export const SetupProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user, updateProfile, completeSetup } = useAuth();
  
  const isEditing = route.name === 'EditProfile';

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [about, setAbout] = useState(user?.about || '');
  const [photo, setPhoto] = useState<string | null>(user?.photoUrl || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Data = result.assets[0].base64;
        const photoUri = `data:image/jpeg;base64,${base64Data}`;
        setPhoto(photoUri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await updateProfile({ name, phone, about, photoUrl: photo });
    setLoading(false);
    
    if (isEditing) {
        navigation.goBack();
    } else {
        completeSetup();
    }
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ paddingTop: insets.top, paddingBottom: 16 }} className="px-6 flex-row items-center justify-between bg-primary z-10 shadow-sm">
          {isEditing && (
              <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md">
                 <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
              </TouchableOpacity>
          )}
          {!isEditing && <View className="w-10" />}
          
          <Text className="text-white text-xl font-bold tracking-wide">{isEditing ? 'Edit Profile' : 'Setup Profile'}</Text>
          <View className="w-10" />
       </View>

       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
            {/* Avatar Picker */}
            <View className="items-center mb-8">
                <TouchableOpacity onPress={pickImage} className="relative active:opacity-90">
                    <View className="w-32 h-32 rounded-full bg-gray-50 border-4 border-primary/20 justify-center items-center overflow-hidden">
                        {photo ? (
                            <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <CameraIcon size={40} color="#D1D5DB" />
                        )}
                    </View>
                    <View className="absolute bottom-0 right-0 bg-primary w-9 h-9 rounded-full border-[3px] border-white items-center justify-center shadow-md">
                        <PlusIcon size={16} color="white" />
                    </View>
                </TouchableOpacity>
                <Text className="text-gray-400 font-bold text-xs mt-3 uppercase tracking-wider">Change Photo</Text>
            </View>

            <View className="w-full gap-5">
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Full Name</Text>
                    <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-base text-secondary"
                    placeholder="Your Name"
                    placeholderTextColor="#9FA5C0"
                    value={name}
                    onChangeText={setName}
                    />
                </View>
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Phone Number</Text>
                    <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-base text-secondary"
                    placeholder="(555) 123-4567"
                    placeholderTextColor="#9FA5C0"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    />
                </View>
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">About Me</Text>
                    <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-base text-secondary h-32 leading-5"
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#9FA5C0"
                    value={about}
                    onChangeText={setAbout}
                    multiline
                    textAlignVertical="top"
                    />
                </View>
                <Button title="Save Details" onPress={handleSave} loading={loading} className="mt-4 shadow-lg shadow-primary/20" />
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
