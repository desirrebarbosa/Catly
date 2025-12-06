
import React, { useState, useEffect, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert, Image as RNImage, RefreshControl } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon as PlusIconOutline, TrashIcon as TrashIconOutline, ClockIcon as ClockIconOutline } from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';
import api from '../services/api';

// Fix for icon type errors
const PlusIcon = PlusIconOutline as any;
const TrashIcon = TrashIconOutline as any;
const ClockIcon = ClockIconOutline as any;
const CheckCircleIcon = CheckCircleIconSolid as any;

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSchedules = async () => {
    const res = await api.get('/schedules');
    if(res.success) setSchedules(res.data.schedules);
  };

  useFocusEffect(useCallback(() => { fetchSchedules(); }, []));

  const onRefresh = async () => {
      setIsRefreshing(true);
      await fetchSchedules();
      setIsRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Schedule', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await api.delete(`/schedules/${id}`);
          fetchSchedules();
      }}
    ]);
  };

  const toggleComplete = async (item: any) => {
      // Optimistic update could go here, but for now we wait for server
      const res = await api.post(`/schedules/${item.id}/complete`, {});
      if(res.success) {
          fetchSchedules();
      }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isCompleted = item.lastCompletedDate && 
        new Date(item.lastCompletedDate).toDateString() === new Date().toDateString();

    return (
        <TouchableOpacity 
            onLongPress={() => navigation.navigate('AddSchedule', { schedule: item })}
            onPress={() => toggleComplete(item)}
            activeOpacity={0.8}
            className={`p-4 rounded-[24px] mb-3 border shadow-sm ${isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'}`}
        >
        <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1 mr-4">
                <Text className={`font-bold text-lg ${isCompleted ? 'text-gray-400 line-through' : 'text-secondary'}`}>{item.taskName}</Text>
                <View className="flex-row items-center mt-1">
                    <ClockIcon size={14} color={isCompleted ? '#9CA3AF' : '#F5A9C8'} />
                    <Text className={`font-bold text-sm ml-1 ${isCompleted ? 'text-gray-400' : 'text-primary'}`}>
                        {item.time} • {item.recurrence}
                    </Text>
                </View>
            </View>
            
            <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={() => toggleComplete(item)}>
                    {isCompleted ? (
                        <CheckCircleIcon size={32} color="#16A34A" />
                    ) : (
                        <View className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 bg-red-50 rounded-2xl ml-1">
                    <TrashIcon size={16} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>

        {/* Associated Cats - Bottom Row Style */}
        <View className="flex-row items-center mt-2 border-t border-gray-100/50 pt-3">
                <Text className="text-gray-400 text-xs mr-2 font-medium">For:</Text>
                {item.cats && item.cats.map((cat: any) => (
                    <Image 
                        key={cat.id}
                        source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} 
                        className="w-8 h-8 rounded-full mr-2 bg-gray-100 border border-gray-100" 
                    />
                ))}
                {item.cats && item.cats.length === 0 && (
                    <Text className="text-gray-300 text-xs italic">No cats selected</Text>
                )}
        </View>
        </TouchableOpacity>
    );
  };

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
          <Text className="text-white/60 text-xs font-medium mt-2 text-center">Tap to complete • Long press to edit</Text>
      </View>
      
      <View className="flex-1 bg-gray-50 pt-6 px-6">
        <FlatList 
            data={schedules} 
            keyExtractor={(item: any) => item.id} 
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#F5A9C8" />
            }
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
