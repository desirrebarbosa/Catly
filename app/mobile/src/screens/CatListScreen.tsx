import React, { useEffect, useState } from 'react';
import { View as RNView, Text as RNText, FlatList, Image as RNImage, TouchableOpacity as RNTouchableOpacity, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, PlusIcon } from 'react-native-heroicons/outline';
import { useAuth } from '../context/AuthContext';
import { useCats } from '../context/CatContext';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const TextInput = RNTextInput as any;

export const CatListScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets(); // Hook for safe area
  const { user } = useAuth();
  const { cats, fetchCats, isLoading } = useCats();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchCats();
  }, []);

  const filteredCats = cats.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showArchived ? cat.isArchived : !cat.isArchived;
    return matchesSearch && matchesStatus;
  });

  const calculateAge = (createdAt: string) => {
      // Placeholder logic until DOB is implemented fully
      return "2 years old"; 
  };

  const renderCatItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className={`rounded-3xl p-4 mb-4 flex-row items-center shadow-sm bg-white border border-gray-100 ${item.isArchived ? 'opacity-60' : ''}`}
      onPress={() => navigation.navigate('CatDetails', { catId: item.id })}
      style={{ elevation: 2 }}
    >
      <View className="w-20 h-20 rounded-full border-2 border-primary/20 p-0.5">
          <Image 
            source={{ uri: item.photoUrl || 'https://placekitten.com/200/200' }} 
            className="w-full h-full rounded-full" 
            resizeMode="cover"
          />
      </View>
      
      <View className="ml-5 flex-1 justify-center">
        <View className="flex-row justify-between items-center mb-1">
             <Text className="text-xl font-bold text-secondary">{item.name}</Text>
             <View className={`px-2 py-1 rounded-lg ${item.isSpayed ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Text className={`text-[10px] font-bold ${item.isSpayed ? 'text-green-600' : 'text-gray-500'}`}>
                    {item.isSpayed ? 'NEUTERED' : 'INTACT'}
                </Text>
             </View>
        </View>
        
        <Text className="text-secondaryLight text-sm font-medium mb-0.5">Age: {calculateAge(item.createdAt)}</Text>
        <Text className="text-secondaryLight text-sm font-medium">
            {item.gender} • {item.breed || 'Unknown'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-primary">
      {/* Header Section with Safe Area */}
      <View 
        style={{ paddingTop: insets.top + 10, paddingBottom: 24 }} 
        className="px-6 bg-primary"
      >
        <View className="flex-row justify-between items-start mb-6">
            <View>
                <Text className="text-white font-extrabold text-3xl tracking-tight">
                    Hello, {user?.name?.split(' ')[0] || 'Friend'}!
                </Text>
                <Text className="text-white/90 text-sm font-medium mt-1">
                    Every day is a purr-fect day to care!
                </Text>
            </View>
             
             {/* Add Button */}
             <TouchableOpacity 
                className="bg-white p-3 rounded-2xl shadow-sm active:opacity-90"
                onPress={() => navigation.navigate('AddCat')}
            >
                <PlusIcon size={24} color="#F5A9C8" strokeWidth={3} />
            </TouchableOpacity>
        </View>

        {/* Search & Filter Row */}
        <View className="flex-row gap-3 h-14">
            {/* Search Input */}
            <View className="flex-1 bg-white rounded-2xl flex-row items-center px-4 shadow-sm">
                <MagnifyingGlassIcon size={20} color="#9CA3AF" />
                <TextInput 
                    className="flex-1 text-secondary text-base h-full font-medium ml-2"
                    placeholder="Search Cats"
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Toggle Switch (Pill Shape) */}
            <View className="bg-white/30 rounded-2xl p-1 flex-row items-center border border-white/40">
                <TouchableOpacity 
                    onPress={() => setShowArchived(false)}
                    className={`px-3 h-full justify-center rounded-xl ${!showArchived ? 'bg-white shadow-sm' : ''}`}
                >
                    <Text className={`text-xs font-bold ${!showArchived ? 'text-primary' : 'text-white'}`}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setShowArchived(true)}
                    className={`px-3 h-full justify-center rounded-xl ${showArchived ? 'bg-white shadow-sm' : ''}`}
                >
                    <Text className={`text-xs font-bold ${showArchived ? 'text-primary' : 'text-white'}`}>Archived</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>

      {/* List Container */}
      <View className="flex-1 bg-background rounded-t-[30px] px-6 pt-8 overflow-hidden shadow-2xl">
        {isLoading && cats.length === 0 ? (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#F5A9C8" />
            </View>
        ) : (
            <FlatList
            data={filteredCats}
            keyExtractor={(item) => item.id}
            renderItem={renderCatItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshing={isLoading}
            onRefresh={fetchCats}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View className="items-center mt-20 px-10 opacity-60">
                    <Text className="text-6xl mb-4"></Text>
                    <Text className="text-secondary text-xl font-bold mb-2">No cats here.</Text>
                    <Text className="text-secondaryLight text-center leading-5">
                        {searchQuery 
                            ? "No matches found for your search." 
                            : showArchived 
                                ? "No archived profiles." 
                                : "Tap '+' to create a profile for your furry friend."}
                    </Text>
                </View>
            }
            />
        )}
      </View>
    </View>
  );
};