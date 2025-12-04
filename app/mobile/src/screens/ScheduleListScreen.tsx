import React, { useState, useEffect, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon, TrashIcon, ClockIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;
const FlatList = RNFlatList as any;
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
    <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between">
       <View className="flex-row items-center flex-1">
          <View className="bg-orange-100 p-3 rounded-xl mr-4">
              <ClockIcon size={24} color="#F97316" />
          </View>
          <View>
              <Text className="text-secondary font-bold text-lg">{item.taskName}</Text>
              <Text className="text-gray-400 text-sm font-medium">{item.time} • {item.recurrence}</Text>
          </View>
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
             <Text className="text-white text-xl font-bold tracking-wide">Schedules</Text>
             <TouchableOpacity 
                onPress={() => navigation.navigate('AddSchedule')} 
                className="w-10 h-10 bg-white items-center justify-center rounded-full shadow-sm active:bg-gray-50"
             >
                <PlusIcon color="#F5A9C8" size={24} strokeWidth={2.5} />
             </TouchableOpacity>
          </View>
      </View>
      
      <View className="flex-1 bg-gray-50 pt-6 px-6">
        <FlatList 
            data={schedules} 
            keyExtractor={(item: any) => item.id} 
            renderItem={renderItem}
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
