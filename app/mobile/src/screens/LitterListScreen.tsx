import React, { useState, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, PlusIcon, TrashIcon, Square3Stack3DIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;
const FlatList = RNFlatList as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

export const LitterListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { catId, catName } = (route.params as any);
  const [litters, setLitters] = useState([]);

  const fetchLitters = async () => {
    const res = await api.get(`/litters/${catId}`);
    if(res.success) setLitters(res.data.litters);
  };

  useFocusEffect(useCallback(() => { fetchLitters(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete Litter', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await api.delete(`/litters/${id}`);
          fetchLitters();
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between">
       <View>
          <Text className="text-secondary font-bold text-lg">Litter of {new Date(item.dateOfBirth).toDateString()}</Text>
          <Text className="text-primary font-bold text-sm">{item.kittenCount} Kittens</Text>
          {item.father && <Text className="text-gray-400 text-xs mt-1">Sire: {item.father.name}</Text>}
       </View>
       <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 opacity-50">
           <TrashIcon size={20} color="#9CA3AF" />
       </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary z-10 shadow-sm">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="items-center">
                <Text className="text-white text-xl font-bold">Litter History</Text>
                <Text className="text-white/80 text-xs">{catName}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AddLitter', { catId })} className="w-10 h-10 bg-white items-center justify-center rounded-full shadow-sm">
                <PlusIcon color="#F5A9C8" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
      </View>
      <View className="flex-1 bg-gray-50 pt-6 px-6">
        <FlatList 
            data={litters} 
            keyExtractor={(item: any) => item.id} 
            renderItem={renderItem}
            ListEmptyComponent={
                <View className="items-center mt-20 opacity-50">
                    <Square3Stack3DIcon size={50} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-2 font-medium">No litters recorded.</Text>
                </View>
            }
        />
      </View>
    </View>
  );
};
