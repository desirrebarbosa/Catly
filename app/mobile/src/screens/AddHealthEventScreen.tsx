
import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, TouchableOpacity as RNTouchableOpacity, Modal, Image as RNImage } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CalendarDaysIcon, CameraIcon } from 'react-native-heroicons/outline';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/ui/Button';
import api from '../services/api';

// Cast components
const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const TouchableOpacity = RNTouchableOpacity as any;
const Image = RNImage as any;

const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

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
  const route = useRoute();
  const { catName, catId } = (route.params as any) || { catName: 'Cat' };

  // Form State
  const [eventType, setEventType] = useState('Checkup');
  const [title, setTitle] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Data = result.assets[0].base64;
        const photoUri = `data:image/jpeg;base64,${base64Data}`;
        setPhoto(photoUri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

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
        date: date.toISOString(),
        attachmentUrl: photo
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
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Pink Header Background */}
      <View className="absolute top-0 left-0 right-0 h-[30%] bg-primary rounded-b-[40px]" />

      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-6 pb-4 z-20">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md"
            >
              <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white tracking-wide">New Event</Text>
            <View className="w-10" />
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          <View className="px-6 mt-4">
            <View className="bg-white rounded-[30px] p-6 shadow-sm shadow-black/5 min-h-[500px]">
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
                    <Modal visible={showDatePicker} transparent animationType="fade">
                        <View className="flex-1 justify-center bg-black/50 px-6">
                            <View className="bg-white rounded-3xl p-4">
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="spinner"
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowDatePicker(false)}
                                    className="bg-primary py-3 rounded-2xl items-center mt-2"
                                >
                                    <Text className="text-white font-bold text-sm">Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
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

                {/* Attachments */}
                <InputLabel text="Attachment (X-Ray, Lab Result)" />
                <TouchableOpacity onPress={pickImage} className="mb-5">
                    {photo ? (
                        <View className="h-40 w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                            <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                            <View className="absolute bottom-2 right-2 bg-black/50 px-3 py-1 rounded-full">
                                <Text className="text-white text-xs font-bold">Change</Text>
                            </View>
                        </View>
                    ) : (
                        <View className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl h-24 items-center justify-center flex-row">
                            <CameraIcon size={24} color="#9CA3AF" />
                            <Text className="text-gray-400 font-bold ml-2">Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

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
