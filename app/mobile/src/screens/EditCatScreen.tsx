import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, TouchableOpacity as RNTouchableOpacity, Modal, Image as RNImage } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CameraIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const Image = RNImage as any;

export const EditCatScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { cat } = route.params;
  const { updateCat, cats, fetchCats } = useCats();

  const [name, setName] = useState(cat.name);
  const [breed, setBreed] = useState(cat.breed || '');
  const [weight, setWeight] = useState(cat.weight ? String(cat.weight) : '');
  const [isArchived, setIsArchived] = useState(cat.isArchived || false);
  const [photo, setPhoto] = useState<string | null>(cat.photoUrl || null);
  const [motherId, setMotherId] = useState<string | null>(cat.motherId || null);
  const [fatherId, setFatherId] = useState<string | null>(cat.fatherId || null);
  const [loading, setLoading] = useState(false);

  // Picker Modal State
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'mother' | 'father'>('mother');

  // Ensure latest cat list is loaded for parent selection
  useEffect(() => {
    fetchCats();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera roll permissions to change the photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, 
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhoto(base64Img);
    }
  };

  const handleUpdate = async () => {
    let weightValue = 0;
    if (weight.trim()) {
      weightValue = parseFloat(weight);
      if (isNaN(weightValue)) return Alert.alert('Invalid Input', "Weight must be a number.");
    }

    setLoading(true);
    try {
      await updateCat(cat.id, { 
          name, 
          breed, 
          weight: weightValue, 
          isArchived,
          motherId,
          fatherId,
          photoUrl: photo
      });
      setLoading(false);
      navigation.goBack();
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', 'Failed to update cat');
    }
  };

  const openPicker = (type: 'mother' | 'father') => {
    setPickerType(type);
    setPickerVisible(true);
  };

  const selectParent = (id: string) => {
    if (pickerType === 'mother') setMotherId(id);
    else setFatherId(id);
    setPickerVisible(false);
  };

  const getCatName = (id: string | null) => {
    if (!id) return 'Select...';
    const c = cats.find(cat => cat.id === id);
    return c ? c.name : 'Unknown';
  };

  const potentialParents = cats.filter(c => 
    c.id !== cat.id && (pickerType === 'mother' ? c.gender === 'Female' : c.gender === 'Male')
  );

  return (
    <View className="flex-1 bg-primary">
      <View 
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }} 
        className="px-5 flex-row justify-between items-center"
      >
        <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="bg-white/20 p-2 rounded-xl"
        >
            <ChevronLeftIcon size={24} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Edit Profile</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 bg-white rounded-t-[30px] px-6 pt-8">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
           <View className="items-center mb-6">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-100 justify-center items-center overflow-hidden shadow-sm">
                {photo ? (
                  <Image source={{ uri: photo }} className="w-full h-full" />
                ) : (
                  <CameraIcon size={32} color="#D1D5DB" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-secondary w-8 h-8 rounded-full justify-center items-center border-2 border-white shadow-sm">
                <PencilIcon size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <Text className="font-bold text-gray-700 mb-2">Name</Text>
          <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4" value={name} onChangeText={setName} />
          
          <Text className="font-bold text-gray-700 mb-2">Breed</Text>
          <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4" value={breed} onChangeText={setBreed} />
          
          <Text className="font-bold text-gray-700 mb-2">Weight (kg)</Text>
          <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4" value={weight} onChangeText={setWeight} keyboardType="numeric" />
          
          <Text className="font-bold text-gray-700 mb-2 mt-2">Lineage</Text>
          <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                  <Text className="text-xs text-gray-400 mb-1">Mother</Text>
                  <TouchableOpacity onPress={() => openPicker('mother')} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <Text className="text-secondary">{getCatName(motherId)}</Text>
                  </TouchableOpacity>
              </View>
              <View className="flex-1">
                  <Text className="text-xs text-gray-400 mb-1">Father</Text>
                  <TouchableOpacity onPress={() => openPicker('father')} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <Text className="text-secondary">{getCatName(fatherId)}</Text>
                  </TouchableOpacity>
              </View>
          </View>

          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-8 mt-2 border border-gray-100">
              <View>
                 <Text className="text-secondary font-bold text-base">Archive Cat</Text>
                 <Text className="text-gray-400 text-xs">Hide from main list</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsArchived(!isArchived)}
                className={`w-12 h-7 rounded-full justify-center px-1 ${isArchived ? 'bg-primary' : 'bg-gray-300'}`}
              >
                 <View className={`w-5 h-5 bg-white rounded-full ${isArchived ? 'self-end' : 'self-start'}`} />
              </TouchableOpacity>
          </View>
          
          <Button title="Save Changes" onPress={handleUpdate} loading={loading} />
        </ScrollView>
      </View>

       <Modal visible={pickerVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-[30px] p-6 h-1/2">
                  <Text className="text-xl font-bold text-secondary mb-4">Select {pickerType === 'mother' ? 'Mother' : 'Father'}</Text>
                  <ScrollView>
                      <TouchableOpacity 
                          onPress={() => {
                             if(pickerType === 'mother') setMotherId(null);
                             else setFatherId(null);
                             setPickerVisible(false);
                          }}
                          className="p-4 border-b border-gray-100"
                      >
                          <Text className="text-red-400 font-bold">Clear Selection</Text>
                      </TouchableOpacity>
                      {potentialParents.map(c => (
                           <TouchableOpacity 
                           key={c.id} 
                           onPress={() => selectParent(c.id)}
                           className="p-4 border-b border-gray-100"
                       >
                           <Text className="text-lg text-secondary">{c.name}</Text>
                       </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <Button title="Close" onPress={() => setPickerVisible(false)} variant="secondary" className="mt-4" />
              </View>
          </View>
      </Modal>
    </View>
  );
};

// Helper Icon for edit button
import { PencilIcon } from 'react-native-heroicons/solid';