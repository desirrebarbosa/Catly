
import React, { useState, useEffect, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert, Image as RNImage } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon, TrashIcon, ClockIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;
const FlatList = RNFlatList as any;
const Image = RNImage as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

export const ScheduleListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    const res = await api.get('/schedules');
    if(res.success) setSchedules(res.data.schedules);
  };

  useFocusEffect(useCallback(() => { fetchSchedules(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete Schedule', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await api.delete(`/schedules/${id}`);
          fetchSchedules();
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
        onLongPress={() => navigation.navigate('AddSchedule', { schedule: item })}
        activeOpacity={0.8}
        className="bg-white p-4 rounded-[24px] mb-3 border border-gray-100 shadow-sm"
    >
       <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 mr-4">
              <Text className="text-secondary font-bold text-lg">{item.taskName}</Text>
              <View className="flex-row items-center mt-1">
                  <ClockIcon size={14} color="#F5A9C8" />
                  <Text className="text-primary font-bold text-sm ml-1">
                    {item.time} • {item.recurrence}
                  </Text>
              </View>
          </View>
          
          <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2.5 bg-red-50 rounded-2xl">
               <TrashIcon size={18} color="#EF4444" />
           </TouchableOpacity>
       </View>

       {/* Associated Cats - Bottom Row Style */}
       <View className="flex-row items-center mt-2 border-t border-gray-50 pt-3">
            <Text className="text-gray-400 text-xs mr-2 font-medium">For:</Text>
            {item.cats && item.cats.map((cat: any) => (
                <Image 
                    key={cat.id}
                    source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} 
                    className="w-8 h-8 rounded-xl mr-2 bg-gray-100 border border-gray-100" 
                />
            ))}
            {item.cats && item.cats.length === 0 && (
                <Text className="text-gray-300 text-xs italic">No cats selected</Text>
            )}
       </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="px-6 pb-6 bg-primary z-10 shadow-sm rounded-b-[32px]">
          <View className="h-14 flex-row items-center justify-between">
             <Text className="text-white text-2xl font-extrabold tracking-tight">Schedules</Text>
             <TouchableOpacity 
                onPress={() => navigation.navigate('AddSchedule')} 
                className="w-12 h-12 bg-white items-center justify-center rounded-2xl shadow-sm active:bg-gray-50"
             >
                <PlusIcon color="#F5A9C8" size={26} strokeWidth={2.5} />
             </TouchableOpacity>
          </View>
          <Text className="text-white/60 text-xs font-medium mt-2 text-center">Long press a card to edit</Text>
      </View>
      
      <View className="flex-1 bg-gray-50 pt-6 px-6">
        <FlatList 
            data={schedules} 
            keyExtractor={(item: any) => item.id} 
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
                <View className="items-center mt-20 opacity-50">
                    <ClockIcon size={50} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-2 font-medium">No active schedules.</Text>
                </View>
            }
        />
      </View>
    </View>
  );
};
