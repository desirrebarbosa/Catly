import React, { useEffect, useState } from 'react';
import { View as RNView, Text as RNText, FlatList, Image as RNImage, TouchableOpacity as RNTouchableOpacity, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useCats } from '../context/CatContext';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const TextInput = RNTextInput as any;

export const CatListScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { cats, fetchCats, isLoading } = useCats();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchCats();
  }, []);

  const filteredCats = cats.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showArchived ? true : !cat.isArchived;
    return matchesSearch && matchesStatus;
  });

  const renderCatItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className={`rounded-3xl p-4 mb-4 flex-row items-center shadow-sm border ${item.isArchived ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-100'}`}
      onPress={() => navigation.navigate('CatDetails', { catId: item.id })}
    >
      <Image source={{ uri: item.photoUrl || 'https://placekitten.com/200/200' }} className={`w-16 h-16 rounded-full ${item.isArchived ? 'opacity-50' : ''}`} />
      <View className="ml-4 flex-1">
        <Text className={`text-xl font-bold ${item.isArchived ? 'text-gray-500' : 'text-secondary'}`}>{item.name}</Text>
        <Text className="text-gray-500 text-sm">{item.gender} • {item.breed || 'Unknown'}</Text>
        <View className="flex-row mt-1">
           {item.isArchived && <Text className="text-xs bg-gray-300 text-white px-2 py-0.5 rounded mr-2">Archived</Text>}
           <Text className="text-xs text-gray-400">{item.isSpayed ? '✨ Spayed' : '⚠️ Intact'}</Text>
        </View>
      </View>
      <Text className="text-gray-300 text-2xl">›</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <View>
             <Text className="text-gray-400 text-base">Hello, {user?.name || 'Friend'}!</Text>
             <Text className="text-secondary font-bold text-xl">My Cats</Text>
          </View>
          <TouchableOpacity 
            className="bg-primary px-4 py-2 rounded-full"
            onPress={() => navigation.navigate('AddCat')}
          >
            <Text className="text-white font-bold text-sm">+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row gap-2">
            <TextInput 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-secondary"
                placeholder="Search cats..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
                onPress={() => setShowArchived(!showArchived)}
                className={`px-4 justify-center rounded-xl border ${showArchived ? 'bg-secondary border-secondary' : 'bg-white border-gray-200'}`}
            >
                <Text className={showArchived ? 'text-white' : 'text-gray-500'}>Archive</Text>
            </TouchableOpacity>
        </View>
      </View>

      {isLoading && cats.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F5A9C8" />
        </View>
      ) : (
        <FlatList
          data={filteredCats}
          keyExtractor={(item) => item.id}
          renderItem={renderCatItem}
          contentContainerStyle={{ padding: 24 }}
          refreshing={isLoading}
          onRefresh={fetchCats}
          ListEmptyComponent={
            <View className="items-center mt-20 px-10">
              <Text className="text-secondary text-xl font-bold mb-2">No cats found.</Text>
              <Text className="text-gray-400 text-center">
                  {searchQuery ? "Try a different search term." : "Tap '+ Add' to start tracking your pets."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};