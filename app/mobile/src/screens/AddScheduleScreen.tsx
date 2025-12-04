import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const useNavigation = (ReactNavigation as any).useNavigation;

export const AddScheduleScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [taskName, setTaskName] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState('Daily');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
      if(!taskName || !time) return Alert.alert("Error", "Task and Time are required");
      setLoading(true);
      const res = await api.post('/schedules', { taskName, time, recurrence });
      setLoading(false);
      if(res.success) navigation.goBack();
      else Alert.alert("Error", "Failed to save");
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary shadow-sm z-10">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">New Schedule</Text>
            <View className="w-10" />
          </View>
      </View>
      <View className="p-6 gap-6">
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Task</Text>
              <TextInput 
                className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base" 
                placeholder="e.g. Morning Feeding" 
                value={taskName} 
                onChangeText={setTaskName} 
              />
          </View>
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Time (e.g. 08:00 AM)</Text>
              <TextInput 
                className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base" 
                placeholder="08:00 AM" 
                value={time} 
                onChangeText={setTime} 
              />
          </View>
           <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Recurrence</Text>
              <View className="flex-row gap-2">
                  {['Daily', 'Weekly', 'Monthly'].map(opt => (
                      <TouchableOpacity 
                        key={opt}
                        onPress={() => setRecurrence(opt)}
                        className={`px-4 py-2 rounded-xl border ${recurrence === opt ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                      >
                          <Text className={`font-bold ${recurrence === opt ? 'text-white' : 'text-gray-500'}`}>{opt}</Text>
                      </TouchableOpacity>
                  ))}
              </View>
          </View>
          <Button title="Save Schedule" onPress={handleSave} loading={loading} className="mt-4" />
      </View>
    </View>
  );
};
