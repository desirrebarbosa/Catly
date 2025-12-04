import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

export const AddLitterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { catId } = (route.params as any);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [count, setCount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
      if(!count) return Alert.alert("Error", "Kitten count is required");
      setLoading(true);
      const res = await api.post(`/litters/${catId}`, { 
          dateOfBirth: date.toISOString(), 
          kittenCount: count,
          notes 
      });
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
            <Text className="text-white text-xl font-bold">Record Litter</Text>
            <View className="w-10" />
          </View>
      </View>
      <View className="p-6 gap-6">
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowPicker(true)} className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 justify-center">
                  <Text className="text-base text-secondary">{date.toDateString()}</Text>
              </TouchableOpacity>
              {showPicker && (
                  <DateTimePicker value={date} mode="date" onChange={(e, d) => { setShowPicker(false); if(d) setDate(d); }} />
              )}
          </View>
          
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Number of Kittens</Text>
              <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base" value={count} onChangeText={setCount} keyboardType="numeric" placeholder="e.g. 5" />
          </View>

          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Notes</Text>
              <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-base h-24" value={notes} onChangeText={setNotes} multiline placeholder="Details about the litter..." textAlignVertical="top" />
          </View>

          <Button title="Save Litter" onPress={handleSave} loading={loading} className="mt-4" />
      </View>
    </View>
  );
};
