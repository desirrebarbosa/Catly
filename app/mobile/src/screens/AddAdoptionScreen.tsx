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
const useRoute = (ReactNavigation as any).useRoute;

export const AddAdoptionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { catId } = (route.params as any);

  const [date, setDate] = useState(new Date());
  const [type, setType] = useState('Adoption');
  const [adopterName, setAdopterName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
      setLoading(true);
      const res = await api.post(`/adoptions/${catId}`, { 
          date: date.toISOString(), 
          type, 
          adopterName, 
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
            <Text className="text-white text-xl font-bold">New Record</Text>
            <View className="w-10" />
          </View>
      </View>
      <View className="p-6 gap-6">
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Event Type</Text>
              <View className="flex-row gap-2">
                  {['Adoption', 'Transfer', 'Foster'].map(opt => (
                      <TouchableOpacity 
                        key={opt}
                        onPress={() => setType(opt)}
                        className={`px-4 py-2 rounded-xl border ${type === opt ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                      >
                          <Text className={`font-bold ${type === opt ? 'text-white' : 'text-gray-500'}`}>{opt}</Text>
                      </TouchableOpacity>
                  ))}
              </View>
          </View>
          
          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">New Owner / Organization</Text>
              <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base" value={adopterName} onChangeText={setAdopterName} placeholder="e.g. John Doe" />
          </View>

          <View>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Notes</Text>
              <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-base h-32" value={notes} onChangeText={setNotes} multiline placeholder="Contract details..." textAlignVertical="top" />
          </View>

          <Button title="Save Record" onPress={handleSave} loading={loading} className="mt-4" />
      </View>
    </View>
  );
};
