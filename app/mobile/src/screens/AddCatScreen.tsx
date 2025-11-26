import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, Modal, Image as RNImage } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const Image = RNImage as any;

export const AddCatScreen = () => {
  const navigation = useNavigation();
  const { addCat, cats, fetchCats, isLoading } = useCats();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');
  const [isSpayed, setIsSpayed] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  // Lineage State
  const [motherId, setMotherId] = useState<string | null>(null);
  const [fatherId, setFatherId] = useState<string | null>(null);
  
  // Picker Modal State
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'mother' | 'father'>('mother');

  // Load cats for lineage selection
  useEffect(() => {
    fetchCats();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera roll permissions to upload a photo.");
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

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Missing Info', "Name is required.");
    
    // Sanitize weight
    let weightValue = 0;
    if (weight.trim()) {
      weightValue = parseFloat(weight);
      if (isNaN(weightValue)) return Alert.alert('Invalid Input', "Weight must be a number.");
    }

    try {
      await addCat({ 
        name, 
        breed, 
        gender, 
        weight: weightValue, 
        isSpayed, 
        motherId, 
        fatherId,
        photoUrl: photo 
      });
      Alert.alert('Success', 'Cat added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add cat');
    }
  };

  const openPicker = (type: 'mother' | 'father') => {
      setPickerType(type);
      setPickerVisible(true);
  };

  const selectParent = (catId: string) => {
      if (pickerType === 'mother') setMotherId(catId);
      else setFatherId(catId);
      setPickerVisible(false);
  };

  const potentialParents = cats.filter(c => 
      pickerType === 'mother' ? c.gender === 'Female' : c.gender === 'Male'
  );

  const getCatName = (id: string | null) => {
      if (!id) return 'Select...';
      const c = cats.find(cat => cat.id === id);
      return c ? c.name : 'Unknown';
  };

  return (
    <View className="flex-1 bg-white">
      <View className="pt-14 pb-4 px-5 border-b border-gray-100 flex-row items-center justify-between bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-gray-500 text-lg">← Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-secondary">New Cat Profile</Text>
        <View className="w-16" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
          
          <View className="items-center mb-6">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-200 justify-center items-center overflow-hidden">
                {photo ? (
                  <Image source={{ uri: photo }} className="w-full h-full" />
                ) : (
                  <Text className="text-4xl text-gray-300">📷</Text>
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full justify-center items-center border-2 border-white">
                <Text className="text-white font-bold">+</Text>
              </View>
            </TouchableOpacity>
            <Text className="text-gray-400 text-sm mt-2">Tap to add photo</Text>
          </View>

          <Text className="text-sm font-bold text-gray-700 mb-2">Name *</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-base"
            placeholder="e.g. Luna" 
            value={name} 
            onChangeText={setName} 
          />

          <Text className="text-sm font-bold text-gray-700 mb-2">Breed</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-base"
            placeholder="e.g. Siamese" 
            value={breed} 
            onChangeText={setBreed} 
          />

          <Text className="text-sm font-bold text-gray-700 mb-2">Gender *</Text>
          <View className="flex-row gap-4 mb-4">
            {['Male', 'Female'].map(g => (
              <TouchableOpacity 
                key={g} 
                onPress={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl border ${gender === g ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-center font-medium ${gender === g ? 'text-white' : 'text-gray-500'}`}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-bold text-gray-700 mb-2">Weight (kg)</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-base"
            placeholder="e.g. 4.5" 
            value={weight} 
            onChangeText={setWeight} 
            keyboardType="numeric" 
          />

          <Text className="text-sm font-bold text-gray-700 mb-2">Spayed / Neutered?</Text>
          <View className="flex-row gap-4 mb-8">
             <TouchableOpacity 
                onPress={() => setIsSpayed(true)}
                className={`flex-1 py-3 rounded-xl border ${isSpayed ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-center font-medium ${isSpayed ? 'text-white' : 'text-gray-500'}`}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsSpayed(false)}
                className={`flex-1 py-3 rounded-xl border ${!isSpayed ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-center font-medium ${!isSpayed ? 'text-white' : 'text-gray-500'}`}>No</Text>
              </TouchableOpacity>
          </View>

          <Text className="text-lg font-bold text-secondary mb-4 mt-2">Lineage (Optional)</Text>
          
          <Text className="text-sm font-bold text-gray-700 mb-2">Mother (Dam)</Text>
          <TouchableOpacity 
            onPress={() => openPicker('mother')}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4"
          >
             <Text className={motherId ? 'text-secondary font-semibold' : 'text-gray-400'}>{getCatName(motherId)}</Text>
          </TouchableOpacity>

          <Text className="text-sm font-bold text-gray-700 mb-2">Father (Sire)</Text>
          <TouchableOpacity 
            onPress={() => openPicker('father')}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8"
          >
             <Text className={fatherId ? 'text-secondary font-semibold' : 'text-gray-400'}>{getCatName(fatherId)}</Text>
          </TouchableOpacity>

          <Button title="Save Profile" onPress={handleSubmit} loading={isLoading} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={pickerVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-3xl p-6 h-2/3">
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
                      {potentialParents.map(cat => (
                           <TouchableOpacity 
                           key={cat.id} 
                           onPress={() => selectParent(cat.id)}
                           className="p-4 border-b border-gray-100"
                       >
                           <Text className="text-lg text-secondary">{cat.name}</Text>
                           <Text className="text-sm text-gray-400">{cat.breed}</Text>
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