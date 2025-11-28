import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CalendarDaysIcon } from 'react-native-heroicons/solid';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../components/ui/Button';
import api from '../services/api';

// Cast components
const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const TouchableOpacity = RNTouchableOpacity as any;

const EVENT_TYPES = [
  { label: 'Checkup', color: 'bg-blue-400', border: 'border-blue-400' },
  { label: 'Vaccination', color: 'bg-green-400', border: 'border-green-400' },
  { label: 'Illness', color: 'bg-red-400', border: 'border-red-400' },
  { label: 'Medication', color: 'bg-purple-400', border: 'border-purple-400' },
  { label: 'Surgery', color: 'bg-pink-500', border: 'border-pink-500' },
  { label: 'Procedure', color: 'bg-yellow-400', border: 'border-yellow-400' },
];

export const AddHealthEventScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { catName, catId } = route.params || { catName: 'Cat' };

  // Form State
  const [eventType, setEventType] = useState('Checkup');
  const [title, setTitle] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Info', 'Please enter a title (e.g., Annual Exam).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/cats/${catId}/health`, {
        title,
        eventType,
        notes,
        diagnosis,
        date: date.toISOString()
      });
      
      if(res.success) {
          Alert.alert('Saved', 'Health event recorded successfully.');
          navigation.goBack();
      } else {
          Alert.alert('Error', 'Failed to save record.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Pink Header Background */}
      <View className="absolute top-0 left-0 right-0 h-[30%] bg-primary rounded-b-[40px]" />

      {/* Header */}
      <View 
        style={{ paddingTop: insets.top, height: insets.top + 60 }} 
        className="px-6 flex-row items-center justify-between z-20"
      >
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md"
        >
          <ChevronLeftIcon color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white tracking-wide">New Health Event</Text>
        <View className="w-10" />
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          <View className="px-6 mt-4">
            <View className="bg-white rounded-3xl p-6 shadow-sm shadow-black/5">
                {/* Header Info */}
                <View className="mb-6 border-b border-gray-100 pb-4">
                    <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-1">Patient</Text>
                    <Text className="text-2xl font-extrabold text-secondary">{catName}</Text>
                </View>

                {/* Event Type Selector */}
                <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-3">Event Type</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {EVENT_TYPES.map((type) => {
                        const isActive = eventType === type.label;
                        return (
                        <TouchableOpacity
                            key={type.label}
                            onPress={() => setEventType(type.label)}
                            className={`px-3 py-2 rounded-xl border ${isActive ? `${type.color} ${type.border}` : 'bg-gray-50 border-gray-100'}`}
                        >
                            <Text className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>
                            {type.label}
                            </Text>
                        </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Date Picker */}
                <InputLabel text="Date" />
                <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 mb-5 active:bg-gray-100"
                >
                    <CalendarDaysIcon size={20} color="#F5A9C8" />
                    <Text className="ml-3 text-secondary text-base font-semibold">
                        {date.toDateString()}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}

                {/* Title Input */}
                <InputLabel text="Title" />
                <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-base text-secondary font-medium mb-5"
                    placeholder="e.g. Annual Vaccination"
                    placeholderTextColor="#D1D5DB"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Diagnosis Input */}
                <InputLabel text="Diagnosis / Result (Optional)" />
                <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-base text-secondary font-medium mb-5"
                    placeholder="e.g. Healthy, Mild Fever..."
                    placeholderTextColor="#D1D5DB"
                    value={diagnosis}
                    onChangeText={setDiagnosis}
                />

                {/* Notes Input */}
                <InputLabel text="Notes / Symptoms" />
                <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-base text-secondary mb-6 h-32 leading-5"
                    placeholder="Add detailed notes here..."
                    placeholderTextColor="#D1D5DB"
                    multiline
                    textAlignVertical="top"
                    value={notes}
                    onChangeText={setNotes}
                />

                <Button 
                    title="Save Record" 
                    onPress={handleSave} 
                    loading={loading} 
                    className="shadow-lg shadow-primary/30"
                />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const InputLabel = ({ text }: { text: string }) => (
    <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-2 ml-1">{text}</Text>
);