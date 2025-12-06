
import React, { useState, useEffect, useCallback } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity, ScrollView as RNScrollView, Image as RNImage, Modal } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CheckCircleIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';
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
const useRoute = (ReactNavigation as any).useRoute;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

export const AddLitterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { catId } = (route.params as any);
  const { cats, fetchCats } = useCats();

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [count, setCount] = useState('1');
  const [notes, setNotes] = useState('');
  
  const [fatherId, setFatherId] = useState<string | null>(null);
  const [selectedKittenIds, setSelectedKittenIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showSireModal, setShowSireModal] = useState(false);

  // Refresh cats whenever screen comes into focus (to see new kittens)
  useFocusEffect(
    useCallback(() => {
        fetchCats();
    }, [])
  );

  const maleCats = cats.filter(c => c.gender === 'Male' && c.id !== catId);
  const potentialKittens = cats.filter(c => c.id !== catId && c.id !== fatherId);

  const handleSave = async () => {
      if(!count) return Alert.alert("Error", "Kitten count is required");
      setLoading(true);
      const res = await api.post(`/litters/${catId}`, { 
          dateOfBirth: date.toISOString(), 
          kittenCount: count,
          fatherId,
          kittenIds: selectedKittenIds,
          notes 
      });
      setLoading(false);
      if(res.success) navigation.goBack();
      else Alert.alert("Error", "Failed to save");
  };

  const toggleKitten = (id: string) => {
      if (selectedKittenIds.includes(id)) {
          setSelectedKittenIds(prev => prev.filter(k => k !== id));
      } else {
          setSelectedKittenIds(prev => [...prev, id]);
      }
  };

  const navigateToAddKitten = () => {
      navigation.navigate('AddCat', { 
          prefillMotherId: catId, 
          prefillFatherId: fatherId, 
          prefillDOB: date.toISOString(),
          returnToLitter: true
      });
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary shadow-sm z-10">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-2xl backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Record Litter</Text>
            <View className="w-10" />
          </View>
      </View>
      
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          <View className="gap-6">
              {/* Date of Birth */}
              <View>
                  <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Date of Birth</Text>
                  <TouchableOpacity onPress={() => setShowPicker(true)} className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 justify-center active:bg-gray-100">
                      <Text className="text-base text-secondary font-bold">{date.toDateString()}</Text>
                  </TouchableOpacity>
                  {showPicker && (
                      <Modal transparent animationType="fade">
                          <View className="flex-1 justify-center bg-black/50 px-6">
                              <View className="bg-white rounded-3xl p-4">
                                  <DateTimePicker 
                                    value={date} 
                                    mode="date" 
                                    display="spinner"
                                    onChange={(e, d) => { if(d) setDate(d); }} 
                                  />
                                  <TouchableOpacity 
                                      onPress={() => setShowPicker(false)}
                                      className="bg-primary py-3 rounded-2xl items-center mt-2"
                                  >
                                      <Text className="text-white font-bold text-sm">Done</Text>
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </Modal>
                  )}
              </View>
              
              {/* Sire Selector */}
              <View>
                  <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Sire (Father)</Text>
                  <TouchableOpacity 
                    onPress={() => setShowSireModal(true)}
                    className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 flex-row items-center justify-between active:bg-gray-100"
                  >
                      <Text className={`text-base font-bold ${fatherId ? 'text-secondary' : 'text-gray-400'}`}>
                          {fatherId ? cats.find(c => c.id === fatherId)?.name : 'Select Father'}
                      </Text>
                      <Text className="text-primary font-bold text-xl">▼</Text>
                  </TouchableOpacity>
              </View>

              {/* Kitten Count */}
              <View>
                  <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Total Count</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base font-bold text-secondary" 
                    value={count} 
                    onChangeText={setCount} 
                    keyboardType="numeric" 
                    placeholder="e.g. 5" 
                  />
              </View>

              {/* Identify Kittens */}
              <View>
                  <View className="flex-row justify-between items-end mb-3">
                      <Text className="text-gray-500 font-bold text-xs uppercase ml-1">Identify Kittens</Text>
                      <TouchableOpacity onPress={navigateToAddKitten}>
                          <Text className="text-primary font-bold text-xs">+ Add New Kitten</Text>
                      </TouchableOpacity>
                  </View>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                      {potentialKittens.map((cat: any) => {
                          const isSelected = selectedKittenIds.includes(cat.id);
                          return (
                              <TouchableOpacity 
                                  key={cat.id} 
                                  onPress={() => toggleKitten(cat.id)}
                                  className={`mr-4 items-center`}
                              >
                                  <View className={`w-16 h-16 rounded-full p-0.5 ${isSelected ? 'bg-primary border-2 border-primary' : 'bg-gray-100'}`}>
                                      <Image source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} className="w-full h-full rounded-full" />
                                  </View>
                                  {isSelected && (
                                      <View className="absolute -top-1 -right-1 bg-white rounded-full">
                                          <CheckCircleIconSolid size={20} color="#F5A9C8" />
                                      </View>
                                  )}
                                  <Text className={`mt-1 text-[10px] font-bold ${isSelected ? 'text-primary' : 'text-gray-400'}`}>{cat.name}</Text>
                              </TouchableOpacity>
                          );
                      })}
                  </ScrollView>
                  <Text className="text-gray-400 text-[10px] mt-1 ml-1">
                      Selected: {selectedKittenIds.length} / {count}
                  </Text>
              </View>

              <View>
                  <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Notes</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-base h-24 text-secondary" 
                    value={notes} 
                    onChangeText={setNotes} 
                    multiline 
                    placeholder="Details about the litter..." 
                    textAlignVertical="top" 
                  />
              </View>

              <View>
                <Button title="Save Litter" onPress={handleSave} loading={loading} className="mt-4 shadow-lg shadow-primary/20" />
              </View>
          </View>
      </ScrollView>

      {/* Sire Modal */}
      <Modal visible={showSireModal} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-[35px] h-2/3">
                  <View className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-[35px]">
                      <Text className="text-xl font-bold text-center text-secondary">Select Sire</Text>
                  </View>
                  <ScrollView contentContainerStyle={{ padding: 20 }}>
                      <TouchableOpacity onPress={() => { setFatherId(null); setShowSireModal(false); }} className="p-4 border-b border-gray-100">
                          <Text className="text-gray-500 font-bold text-center">Unknown / None</Text>
                      </TouchableOpacity>
                      {maleCats.map(c => (
                          <TouchableOpacity 
                            key={c.id} 
                            onPress={() => { setFatherId(c.id); setShowSireModal(false); }}
                            className="flex-row items-center p-3 border-b border-gray-100"
                          >
                              <Image source={{ uri: c.photoUrl }} className="w-12 h-12 rounded-xl bg-gray-200 mr-4" />
                              <Text className="text-lg font-bold text-secondary">{c.name}</Text>
                          </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <Button title="Close" onPress={() => setShowSireModal(false)} variant="secondary" className="m-6" />
              </View>
          </View>
      </Modal>
    </View>
  );
};
