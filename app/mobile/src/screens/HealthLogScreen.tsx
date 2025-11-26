import React, { useEffect, useState } from 'react';
import { View as RNView, Text as RNText, FlatList, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;

export const HealthLogScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { catId, catName } = route.params;
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/cats/${catId}/health`);
      if (res.success) setEvents(res.data.events);
    };
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [catId, navigation]);

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center">
      <View className="flex-1">
        <Text className="text-xs text-gray-400 font-bold mb-1">{new Date(item.date).toDateString()}</Text>
        <Text className="text-base font-bold text-secondary mb-1">{item.title}</Text>
        <Text className="text-gray-500 text-sm" numberOfLines={1}>{item.diagnosis === 'Symptomatic' ? '⚠️ Symptomatic' : 'Routine'}</Text>
      </View>
      <View className="bg-pink-50 px-3 py-1 rounded-lg">
        <Text className="text-primary text-xs font-bold uppercase">{item.eventType}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-14 pb-4 px-5 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white/20 p-2 rounded-lg">
           <Text className="text-white font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">{catName}'s Health</Text>
        <TouchableOpacity 
           className="bg-white w-9 h-9 rounded-full justify-center items-center"
           onPress={() => navigation.navigate('AddHealthEvent', { catId, catName })}
        >
           <Text className="text-primary text-xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-gray-50 rounded-t-[30px] p-6">
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No records found.</Text>}
        />
      </View>
    </View>
  );
};