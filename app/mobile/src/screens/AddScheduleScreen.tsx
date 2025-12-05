
import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity, ScrollView as RNScrollView, Platform, Image as RNImage } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, ClockIcon } from 'react-native-heroicons/outline';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const Image = RNImage as any;
const ScrollView = RNScrollView as any;
const useNavigation = (ReactNavigation as any).useNavigation;

const TASK_TYPES = [
    'Feeding', 'Medication', 'Litter Clean', 'Grooming', 'Vet Visit', 'Playtime', 'Other'
];

export const AddScheduleScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { cats, fetchCats } = useCats();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('Feeding');
  const [customTask, setCustomTask] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [recurrence, setRecurrence] = useState('Daily');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCats(); }, []);

  const handleSave = async () => {
      if(!selectedCatId) return Alert.alert("Required", "Please select a cat for this schedule.");
      
      const finalTaskName = taskName === 'Other' ? customTask : taskName;
      if(!finalTaskName.trim()) return Alert.alert("Required", "Please enter a task name.");

      setLoading(true);
      // Format time nicely e.g. "08:30 AM"
      const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const res = await api.post('/schedules', { 
          catId: selectedCatId,
          taskName: finalTaskName, 
          time: timeString, 
          recurrence 
      });
      setLoading(false);
      if(res.success) navigation.goBack();
      else Alert.alert("Error", "Failed to save");
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) setTime(selectedDate);
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
      
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
          {/* Cat Selector */}
          <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1">Select Cat</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              {cats.map((cat: any) => {
                  const isSelected = selectedCatId === cat.id;
                  return (
                      <TouchableOpacity 
                        key={cat.id} 
                        onPress={() => setSelectedCatId(cat.id)}
                        className={`mr-4 items-center ${isSelected ? 'opacity-100' : 'opacity-50'}`}
                      >
                          <View className={`w-16 h-16 rounded-full p-0.5 ${isSelected ? 'bg-primary border-2 border-primary' : 'bg-gray-100'}`}>
                              <Image source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} className="w-full h-full rounded-full" />
                          </View>
                          <Text className={`mt-2 text-xs font-bold ${isSelected ? 'text-primary' : 'text-gray-400'}`}>{cat.name}</Text>
                      </TouchableOpacity>
                  );
              })}
          </ScrollView>

          {/* Task Type */}
          <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1">Task Type</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
              {TASK_TYPES.map(type => (
                  <TouchableOpacity 
                    key={type}
                    onPress={() => setTaskName(type)}
                    className={`px-4 py-2.5 rounded-xl border ${taskName === type ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                  >
                      <Text className={`font-bold ${taskName === type ? 'text-white' : 'text-gray-500'}`}>{type}</Text>
                  </TouchableOpacity>
              ))}
          </View>
          
          {taskName === 'Other' && (
              <TextInput 
                className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base mb-6" 
                placeholder="What is the task?" 
                value={customTask} 
                onChangeText={setCustomTask} 
              />
          )}

          {/* Time Picker */}
          <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1 mt-2">Time</Text>
          <TouchableOpacity 
            onPress={() => setShowTimePicker(true)}
            className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 mb-6 active:bg-gray-100"
          >
             <ClockIcon size={20} color="#F5A9C8" />
             <Text className="ml-3 text-secondary text-lg font-bold">
                 {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker 
                value={time} 
                mode="time" 
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange} 
            />
          )}

           {/* Recurrence */}
           <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1">Recurrence</Text>
           <View className="flex-row gap-2 mb-8">
                  {['Daily', 'Weekly', 'Monthly'].map(opt => (
                      <TouchableOpacity 
                        key={opt}
                        onPress={() => setRecurrence(opt)}
                        className={`flex-1 py-3 items-center rounded-xl border ${recurrence === opt ? 'bg-secondary border-secondary' : 'bg-white border-gray-200'}`}
                      >
                          <Text className={`font-bold ${recurrence === opt ? 'text-white' : 'text-gray-500'}`}>{opt}</Text>
                      </TouchableOpacity>
                  ))}
            </View>

          <Button title="Save Schedule" onPress={handleSave} loading={loading} className="shadow-lg shadow-primary/20" />
      </ScrollView>
    </View>
  );
};
