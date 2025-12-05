
import React, { useState, useEffect, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert, Image as RNImage } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon, TrashIcon, ClockIcon, PencilIcon } from 'react-native-heroicons/outline';
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
    <View className="bg-white p-4 rounded-[24px] mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between">
       <View className="flex-row items-center flex-1">
          {/* Multi-Cat Avatars */}
          <View className="mr-4 relative flex-row w-16">
              {item.cats && item.cats.slice(0, 3).map((cat: any, index: number) => (
                  <Image 
                    key={cat.id}
                    source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} 
                    className={`w-10 h-10 rounded-xl bg-gray-100 border-2 border-white absolute`} 
                    style={{ left: index * 20, zIndex: 3 - index }}
                  />
              ))}
              {item.cats && item.cats.length > 3 && (
                  <View className="w-10 h-10 rounded-xl bg-gray-200 border-2 border-white absolute left-[60px] items-center justify-center z-0">
                      <Text className="text-[10px] font-bold text-gray-500">+{item.cats.length - 3}</Text>
                  </View>
              )}
          </View>
          
          <View className="flex-1 ml-4">
              <Text className="text-secondary font-bold text-lg">{item.taskName}</Text>
              <Text className="text-gray-400 text-sm font-medium mb-0.5" numberOfLines={1}>
                {item.cats ? item.cats.map((c: any) => c.name).join(', ') : 'No Cats'}
              </Text>
              <View className="flex-row items-center mt-1">
                  <ClockIcon size={12} color="#F5A9C8" />
                  <Text className="text-primary font-bold text-xs ml-1">
                    {item.time} • {item.recurrence}
                  </Text>
              </View>
          </View>
       </View>
       
       <View className="flex-row">
           <TouchableOpacity onPress={() => navigation.navigate('AddSchedule', { schedule: item })} className="p-3 bg-blue-50 rounded-2xl mr-2">
               <PencilIcon size={16} color="#3B82F6" />
           </TouchableOpacity>
           <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-3 bg-red-50 rounded-2xl">
               <TrashIcon size={16} color="#EF4444" />
           </TouchableOpacity>
       </View>
    </View>
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
