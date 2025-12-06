
import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity, ScrollView as RNScrollView, Platform, Image as RNImage, Modal, KeyboardAvoidingView as RNKeyboardAvoidingView } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, ClockIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { scheduleLocalNotification } from '../services/notifications';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const Image = RNImage as any;
const ScrollView = RNScrollView as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

const TASK_TYPES = [
    'Feeding', 'Medication', 'Litter Clean', 'Grooming', 'Vet Visit', 'Playtime', 'Other'
];

export const AddScheduleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { cats, fetchCats } = useCats();
  const { schedule } = (route.params as any) || {};

  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [taskName, setTaskName] = useState('Feeding');
  const [customTask, setCustomTask] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [recurrence, setRecurrence] = useState('Once');
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
      fetchCats(); 
      if (schedule) {
          // Edit Mode
          setTaskName(TASK_TYPES.includes(schedule.taskName) ? schedule.taskName : 'Other');
          if(!TASK_TYPES.includes(schedule.taskName)) setCustomTask(schedule.taskName);
          
          setRecurrence(schedule.recurrence);
          // Simple time parse attempt
          const [timePart, modifier] = schedule.time.split(' ');
          let [hours, minutes] = timePart.split(':');
          if (hours === '12') hours = '00';
          if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
          const d = new Date();
          d.setHours(parseInt(hours), parseInt(minutes));
          setTime(d);
          
          if(schedule.cats) {
              setSelectedCatIds(schedule.cats.map((c: any) => c.id));
          }
      }
  }, []);

  const toggleCat = (id: string) => {
      if (selectedCatIds.includes(id)) {
          setSelectedCatIds(prev => prev.filter(c => c !== id));
      } else {
          setSelectedCatIds(prev => [...prev, id]);
      }
  };

  const toggleSelectAll = () => {
      if (selectedCatIds.length === cats.length) {
          setSelectedCatIds([]);
      } else {
          setSelectedCatIds(cats.map(c => c.id));
      }
  };

  const handleSave = async () => {
      if(selectedCatIds.length === 0) return Alert.alert("Required", "Please select at least one cat.");
      
      const finalTaskName = taskName === 'Other' ? customTask : taskName;
      if(!finalTaskName.trim()) return Alert.alert("Required", "Please enter a task name.");

      setLoading(true);
      const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const payload = { 
          catIds: selectedCatIds,
          taskName: finalTaskName, 
          time: timeString, 
          recurrence 
      };

      let res;
      if (schedule) {
          res = await api.put(`/schedules/${schedule.id}`, payload);
      } else {
          res = await api.post('/schedules', payload);
      }

      setLoading(false);
      if(res.success) {
          // Schedule Alarm
          try {
              const hour = time.getHours();
              const minute = time.getMinutes();
              const catNames = cats.filter((c: any) => selectedCatIds.includes(c.id)).map((c: any) => c.name).join(', ');
              
              await scheduleLocalNotification(
                  finalTaskName,
                  `Time for ${catNames}!`,
                  hour,
                  minute,
                  recurrence
              );
              Alert.alert("Success", "Schedule saved and alarm set!");
          } catch (e) {
              console.log("Notification error", e);
          }
          navigation.goBack();
      } else {
          Alert.alert("Error", res.error || "Failed to save");
      }
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary shadow-sm z-10">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-2xl backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">{schedule ? 'Edit Schedule' : 'New Schedule'}</Text>
            <View className="w-10" />
          </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            {/* Cat Selector */}
            <View className="flex-row justify-between items-end mb-3">
                <Text className="text-gray-500 font-bold text-xs uppercase ml-1">For Whom?</Text>
                <TouchableOpacity onPress={toggleSelectAll}>
                    <Text className="text-primary font-bold text-xs">
                        {selectedCatIds.length === cats.length ? 'Deselect All' : 'Select All'}
                    </Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                {cats.map((cat: any) => {
                    const isSelected = selectedCatIds.includes(cat.id);
                    return (
                        <TouchableOpacity 
                            key={cat.id} 
                            onPress={() => toggleCat(cat.id)}
                            className={`mr-4 items-center relative`}
                        >
                            <View className={`w-16 h-16 rounded-full p-0.5 ${isSelected ? 'bg-primary border-2 border-primary' : 'bg-gray-100'}`}>
                                <Image source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} className="w-full h-full rounded-full" />
                            </View>
                            {isSelected && (
                                <View className="absolute top-0 right-0 bg-white rounded-full">
                                    <CheckCircleIconSolid size={20} color="#F5A9C8" />
                                </View>
                            )}
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
                        className={`px-4 py-2.5 rounded-2xl border ${taskName === type ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`font-bold ${taskName === type ? 'text-white' : 'text-gray-500'}`}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {taskName === 'Other' && (
                <TextInput 
                    className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base mb-6 text-secondary" 
                    placeholder="What is the task?" 
                    placeholderTextColor="#D1D5DB"
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

            <Modal visible={showTimePicker} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/50 px-6">
                    <View className="bg-white rounded-3xl w-full p-4 items-center shadow-2xl">
                        <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Select Time</Text>
                        <DateTimePicker 
                            value={time} 
                            mode="time" 
                            display="spinner"
                            onChange={(e, d) => d && setTime(d)} 
                            style={{ height: 150, width: '100%' }}
                        />
                        <TouchableOpacity 
                            onPress={() => setShowTimePicker(false)}
                            className="bg-primary px-8 py-3 rounded-2xl mt-4 w-full items-center"
                        >
                            <Text className="text-white font-bold text-sm">Confirm Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Recurrence */}
            <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1">Recurrence</Text>
            <View className="flex-row gap-2 mb-8">
                    {['Once', 'Daily', 'Weekly', 'Monthly'].map(opt => (
                        <TouchableOpacity 
                            key={opt}
                            onPress={() => setRecurrence(opt)}
                            className={`flex-1 py-3 items-center rounded-2xl border ${recurrence === opt ? 'bg-secondary border-secondary' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-bold text-xs ${recurrence === opt ? 'text-white' : 'text-gray-500'}`}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            <Button title="Save Schedule" onPress={handleSave} loading={loading} className="shadow-lg shadow-primary/20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
