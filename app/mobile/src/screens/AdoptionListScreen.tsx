
import React, { useState, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, PlusIcon, TrashIcon, HomeModernIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;
const FlatList = RNFlatList as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

export const AdoptionListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { catId, catName } = (route.params as any);
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    const res = await api.get(`/adoptions/${catId}`);
    if(res.success) setRecords(res.data.adoptions);
  };

  useFocusEffect(useCallback(() => { fetchRecords(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await api.delete(`/adoptions/${id}`);
          fetchRecords();
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-[24px] mb-3 border border-gray-100 shadow-sm">
       <View className="flex-row justify-between items-start">
          <View>
              <Text className="text-primary font-bold text-xs uppercase mb-1">{item.type}</Text>
              <Text className="text-secondary font-bold text-lg">{new Date(item.date).toDateString()}</Text>
              <Text className="text-gray-500 text-sm mt-1">To: {item.adopterName || 'Unknown'}</Text>
              {item.notes && <Text className="text-gray-400 text-xs mt-2 italic">"{item.notes}"</Text>}
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-3 bg-gray-50 rounded-2xl">
             <TrashIcon size={20} color="#9CA3AF" />
          </TouchableOpacity>
       </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="px-6 pb-6 bg-primary z-10 shadow-sm rounded-b-[32px]">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-12 h-12 bg-white/20 items-center justify-center rounded-2xl backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="items-center">
                <Text className="text-white text-xl font-bold">Adoption History</Text>
                <Text className="text-white/80 text-xs">{catName}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AddAdoption', { catId })} className="w-12 h-12 bg-white items-center justify-center rounded-2xl shadow-sm">
                <PlusIcon color="#F5A9C8" size={26} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
      </View>
      <View className="flex-1 bg-gray-50 pt-6 px-6">
        <FlatList 
            data={records} 
            keyExtractor={(item: any) => item.id} 
            renderItem={renderItem}
            ListEmptyComponent={
                <View className="items-center mt-20 opacity-50">
                    <HomeModernIcon size={50} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-2 font-medium">No adoption records.</Text>
                </View>
            }
        />
      </View>
    </View>
  );
};
