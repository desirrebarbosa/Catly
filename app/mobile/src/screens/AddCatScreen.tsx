import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, Modal, Image as RNImage } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

export const AddCatScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addCat, cats, fetchCats, isLoading } = useCats();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');
  const [isSpayed, setIsSpayed] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const [motherId, setMotherId] = useState<string | null>(null);
  const [fatherId, setFatherId] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'mother' | 'father'>('mother');

  useEffect(() => { fetchCats(); }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Missing Info', "Name is required.");
    let weightValue = 0;
    if (weight.trim()) {
      weightValue = parseFloat(weight);
      if (isNaN(weightValue)) return Alert.alert('Invalid Input', "Weight must be a number.");
    }

    try {
      await addCat({ name, breed, gender, weight: weightValue, isSpayed, motherId, fatherId, photoUrl: photo });
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
      pickerType === 'mother' ? setMotherId(catId) : setFatherId(catId);
      setPickerVisible(false);
  };

  const potentialParents = cats.filter(c => 
      pickerType === 'mother' ? c.gender === 'Female' : c.gender === 'Male'
  );

  return (
    <View className="flex-1 bg-primary">
      {/* Header with Safe Area */}
      <View 
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }} 
        className="px-5 flex-row items-center justify-between"
      >
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="bg-white/20 p-2 rounded-xl"
        >
          <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-white tracking-wide">Add a Cat</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 bg-white rounded-t-[30px] mt-2 overflow-hidden shadow-2xl">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
            
            <View className="items-center mb-8 mt-2">
              <TouchableOpacity onPress={pickImage} className="relative shadow-md">
                <View className="w-36 h-36 rounded-full bg-gray-50 border-4 border-white justify-center items-center overflow-hidden">
                  {photo ? (
                    <Image source={{ uri: photo }} className="w-full h-full" />
                  ) : (
                    <CameraIcon size={40} color="#D1D5DB" />
                  )}
                </View>
                <View className="absolute bottom-1 right-1 bg-primary w-9 h-9 rounded-full justify-center items-center border-2 border-white shadow-sm">
                  <Text className="text-white font-bold text-xl leading-none pb-0.5">+</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="gap-5">
                <InputGroup label="Name" value={name} onChangeText={setName} placeholder="e.g. Luna" />
                <InputGroup label="Breed" value={breed} onChangeText={setBreed} placeholder="e.g. Siamese" />
                
                <View>
                    <Text className="text-secondary font-bold mb-2 ml-1 text-base">Gender</Text>
                    <View className="flex-row gap-3">
                        {['Male', 'Female'].map(g => (
                            <TouchableOpacity 
                                key={g} 
                                onPress={() => setGender(g)}
                                className={`flex-1 py-4 rounded-2xl border ${gender === g ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}
                            >
                                <Text className={`text-center font-bold text-base ${gender === g ? 'text-white' : 'text-gray-400'}`}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <InputGroup label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="0.0" keyboardType="numeric" />

                <View>
                    <Text className="text-secondary font-bold mb-2 ml-1 text-base">Spayed / Neutered?</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity onPress={() => setIsSpayed(true)} className={`flex-1 py-4 rounded-2xl border ${isSpayed ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}>
                            <Text className={`text-center font-bold text-base ${isSpayed ? 'text-white' : 'text-gray-400'}`}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsSpayed(false)} className={`flex-1 py-4 rounded-2xl border ${!isSpayed ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}>
                            <Text className={`text-center font-bold text-base ${!isSpayed ? 'text-white' : 'text-gray-400'}`}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mt-4 pt-4 border-t border-gray-100">
                     <Text className="text-xl font-bold text-secondary mb-4">Lineage / Parents</Text>
                     
                     <View className="flex-row gap-4">
                        <View className="flex-1">
                             <Text className="text-xs text-gray-400 mb-2 font-bold uppercase ml-1">Mother</Text>
                             <TouchableOpacity onPress={() => openPicker('mother')} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                <Text className={`text-base font-semibold ${motherId ? 'text-primary' : 'text-gray-400'}`}>
                                     {motherId ? cats.find(c => c.id === motherId)?.name : 'Select'}
                                </Text>
                             </TouchableOpacity>
                        </View>
                        <View className="flex-1">
                             <Text className="text-xs text-gray-400 mb-2 font-bold uppercase ml-1">Father</Text>
                             <TouchableOpacity onPress={() => openPicker('father')} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                <Text className={`text-base font-semibold ${fatherId ? 'text-primary' : 'text-gray-400'}`}>
                                     {fatherId ? cats.find(c => c.id === fatherId)?.name : 'Select'}
                                </Text>
                             </TouchableOpacity>
                        </View>
                     </View>
                </View>

                <Button title="Save Details" onPress={handleSubmit} loading={isLoading} className="mt-6 shadow-md" />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Modal visible={pickerVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/60 justify-end">
              <View className="bg-white rounded-t-[30px] p-6 h-2/3">
                  <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-6" />
                  <Text className="text-xl font-bold text-secondary mb-4 text-center">Select {pickerType === 'mother' ? 'Mother' : 'Father'}</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                      <TouchableOpacity onPress={() => { selectParent(''); }} className="p-4 border-b border-gray-100 items-center">
                          <Text className="text-gray-400 font-bold">None / Clear Selection</Text>
                      </TouchableOpacity>
                      {potentialParents.map(cat => (
                           <TouchableOpacity key={cat.id} onPress={() => selectParent(cat.id)} className="p-4 border-b border-gray-50 flex-row items-center">
                               <View className="w-12 h-12 rounded-full bg-gray-100 mr-4 overflow-hidden border border-gray-100">
                                    <Image source={{ uri: cat.photoUrl || 'https://placekitten.com/50/50' }} className="w-full h-full"/>
                               </View>
                               <View>
                                   <Text className="text-lg font-bold text-secondary">{cat.name}</Text>
                                   <Text className="text-xs text-gray-400">{cat.breed}</Text>
                               </View>
                           </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <Button title="Cancel" onPress={() => setPickerVisible(false)} variant="secondary" className="mt-4" />
              </View>
          </View>
      </Modal>
    </View>
  );
};

const InputGroup = ({ label, value, onChangeText, placeholder, keyboardType }: any) => (
    <View>
        <Text className="text-secondary font-bold mb-2 ml-1 text-base">{label}</Text>
        <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-secondary"
            placeholder={placeholder} 
            placeholderTextColor="#D1D5DB"
            value={value} 
            onChangeText={onChangeText}
            keyboardType={keyboardType}
        />
    </View>
);