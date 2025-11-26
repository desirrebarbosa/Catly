import React from 'react';
import { View as RNView, Text as RNText, FlatList, Image as RNImage, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

// Cast components to allow 'className' prop for NativeWind
const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;

// Mock Data
const MOCK_CATS = [
  { id: '1', name: 'Luna', breed: 'Siamese', gender: 'Female', photo: 'https://placekitten.com/200/200' },
  { id: '2', name: 'Simba', breed: 'Orange Tabby', gender: 'Male', photo: 'https://placekitten.com/201/201' },
];

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const renderItem = ({ item }: { item: typeof MOCK_CATS[0] }) => (
    <TouchableOpacity 
      className="bg-white rounded-3xl p-4 mb-4 flex-row items-center shadow-sm border border-gray-100"
      onPress={() => navigation.navigate('AddHealthEvent', { catId: item.id, catName: item.name })}
    >
      <Image source={{ uri: item.photo }} className="w-16 h-16 rounded-full bg-gray-200" />
      <View className="ml-4 flex-1">
        <Text className="text-xl font-bold text-secondary">{item.name}</Text>
        <Text className="text-gray-500">{item.gender} • {item.breed}</Text>
      </View>
      <Text className="text-gray-300 text-2xl">›</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-16 pb-6 px-6 bg-white rounded-b-3xl shadow-sm z-10">
        <Text className="text-gray-400 text-lg">Welcome back,</Text>
        <Text className="text-3xl font-extrabold text-secondary">{user?.name || 'Cat Parent'} 🐾</Text>
      </View>

      <FlatList
        data={MOCK_CATS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 24 }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-gray-400 text-lg">No cats yet.</Text>
          </View>
        }
      />

      <View className="absolute bottom-10 right-6 left-6">
        <Button 
          title="+ Add New Cat" 
          onPress={() => console.log('Add Cat')} 
        />
      </View>
    </View>
  );
};