
import React, { useState, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert, Image as RNImage, TextInput as RNTextInput, ScrollView } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon, TrashIcon, CubeIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;
const FlatList = RNFlatList as any;
const Image = RNImage as any;
const TextInput = RNTextInput as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

const CATEGORIES = ['All', 'Food', 'Medication', 'Toy', 'Litter', 'Grooming', 'Other'];

export const InventoryListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchInventory = async () => {
    const res = await api.get('/inventory');
    if(res.success) setItems(res.data.items);
  };

  useFocusEffect(useCallback(() => { fetchInventory(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await api.delete(`/inventory/${id}`);
          fetchInventory();
      }}
    ]);
  };

  const filteredItems = items.filter((item: any) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }: { item: any }) => {
      const isLowStock = item.threshold && item.quantity <= item.threshold;

      return (
        <TouchableOpacity 
            onLongPress={() => navigation.navigate('AddInventory', { item })}
            activeOpacity={0.8}
            className="bg-white p-4 rounded-[24px] mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between"
        >
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                    <Text className="text-secondary font-bold text-lg mr-2">{item.name}</Text>
                    {isLowStock && (
                        <View className="bg-red-100 px-2 py-1 rounded-xl flex-row items-center">
                            <ExclamationTriangleIcon size={12} color="#EF4444" />
                            <Text className="text-red-600 text-[10px] font-bold ml-1">LOW STOCK</Text>
                        </View>
                    )}
                </View>
                <Text className="text-primary font-bold text-xs uppercase mb-2">{item.category}</Text>
                
                <View className="flex-row items-center">
                    <Text className="text-gray-500 text-sm font-medium mr-1">Qty:</Text>
                    <Text className={`text-base font-bold ${isLowStock ? 'text-red-500' : 'text-secondary'}`}>
                        {item.quantity} {item.unit}
                    </Text>
                </View>

                {/* Associated Cats */}
                <View className="flex-row mt-2 items-center">
                    <Text className="text-gray-400 text-xs mr-2">For:</Text>
                    {item.cats && item.cats.map((c: any) => (
                        <Image 
                            key={c.id} 
                            source={{ uri: c.photoUrl || 'https://placekitten.com/50/50' }} 
                            className="w-6 h-6 rounded-xl mr-1 bg-gray-100 border border-gray-200" 
                        />
                    ))}
                    {item.cats && item.cats.length === 0 && <Text className="text-gray-300 text-xs">All / General</Text>}
                </View>
            </View>
            
            <View className="flex-col gap-2">
                <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-3 bg-red-50 rounded-2xl">
                    <TrashIcon size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      );
  };

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="px-6 pb-6 bg-primary z-10 shadow-sm rounded-b-[32px]">
          <View className="h-14 flex-row items-center justify-between mb-2">
             <Text className="text-white text-2xl font-extrabold tracking-tight">Inventory</Text>
             <TouchableOpacity 
                onPress={() => navigation.navigate('AddInventory')} 
                className="w-12 h-12 bg-white items-center justify-center rounded-2xl shadow-sm active:bg-gray-50"
             >
                <PlusIcon color="#F5A9C8" size={26} strokeWidth={2.5} />
             </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-white rounded-2xl flex-row items-center px-4 h-12 shadow-sm mb-4">
              <MagnifyingGlassIcon size={20} color="#9CA3AF" />
              <TextInput 
                  className="flex-1 text-secondary text-base h-full font-medium ml-2"
                  placeholder="Search supplies..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
              />
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat;
                  return (
                      <TouchableOpacity 
                          key={cat} 
                          onPress={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-2xl mr-2 ${isActive ? 'bg-white' : 'bg-white/20'}`}
                      >
                          <Text className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-white'}`}>{cat}</Text>
                      </TouchableOpacity>
                  )
              })}
          </ScrollView>
          <Text className="text-white/60 text-xs font-medium mt-2 text-center">Long press an item to edit</Text>
      </View>
      
      <View className="flex-1 bg-gray-50 pt-6 px-6">
        <FlatList 
            data={filteredItems} 
            keyExtractor={(item: any) => item.id} 
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View className="items-center mt-20 opacity-50">
                    <CubeIcon size={60} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-4 font-bold text-lg">No items found.</Text>
                    <Text className="text-gray-400 text-sm">Add food, meds, or toys.</Text>
                </View>
            }
        />
      </View>
    </View>
  );
};
