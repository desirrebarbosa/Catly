import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, TouchableOpacity as RNTouchableOpacity, Modal, Image as RNImage } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CameraIcon, CalendarDaysIcon, ScaleIcon } from 'react-native-heroicons/outline';
import { PencilIcon } from 'react-native-heroicons/solid';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  // Basic Info
  const [name, setName] = useState(cat.name);
  const [nickname, setNickname] = useState(cat.nickname || '');
  const [breed, setBreed] = useState(cat.breed || '');
  const [weight, setWeight] = useState(cat.weight ? String(cat.weight) : '');
  
  // Extended Info
  const [birthDate, setBirthDate] = useState(cat.birthDate ? new Date(cat.birthDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [color, setColor] = useState(cat.color || '');
  const [eyeColor, setEyeColor] = useState(cat.eyeColor || '');
  const [features, setFeatures] = useState(cat.features || '');
  
  const [isArchived, setIsArchived] = useState(cat.isArchived || false);
  const [photo, setPhoto] = useState<string | null>(cat.photoUrl || null);
  const [motherId, setMotherId] = useState<string | null>(cat.motherId || null);
  const [fatherId, setFatherId] = useState<string | null>(cat.fatherId || null);
  const [loading, setLoading] = useState(false);

  // Picker Modal State
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
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhoto(base64Img);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
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
          name, nickname, breed, 
          weight: weightValue, 
          birthDate: birthDate.toISOString(),
          color, eyeColor, features,
          isArchived,
          motherId, fatherId, photoUrl: photo
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

  const potentialParents = cats.filter(c => 
    c.id !== cat.id && (pickerType === 'mother' ? c.gender === 'Female' : c.gender === 'Male')
  );

  return (
    <View className="flex-1 bg-primary">
      <View 
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }} 
        className="px-5 flex-row justify-between items-center z-10"
      >
        <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="bg-white/20 p-2 rounded-xl backdrop-blur-md"
        >
            <ChevronLeftIcon size={24} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Edit Profile</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 bg-gray-50 rounded-t-[35px] px-6 pt-8 overflow-hidden shadow-2xl">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            
            <View className="items-center mb-6">
                <TouchableOpacity onPress={pickImage} className="relative active:scale-95 transition-transform">
                <View className="w-32 h-32 rounded-full bg-white border-4 border-white justify-center items-center overflow-hidden shadow-sm">
                    {photo ? (
                    <Image source={{ uri: photo }} className="w-full h-full" />
                    ) : (
                    <CameraIcon size={32} color="#D1D5DB" />
                    )}
                </View>
                <View className="absolute bottom-0 right-0 bg-secondary w-9 h-9 rounded-full justify-center items-center border-2 border-white shadow-sm">
                    <PencilIcon size={16} color="white" />
                </View>
                </TouchableOpacity>
            </View>
            
            <View className="gap-6">
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 gap-4">
                    <InputGroup label="Name" value={name} onChangeText={setName} />
                    <InputGroup label="Nickname" value={nickname} onChangeText={setNickname} />
                </View>
                
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 gap-4">
                    <View className="flex-row gap-4">
                        <View className="flex-1"><InputGroup label="Breed" value={breed} onChangeText={setBreed} /></View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 font-bold ml-1 mb-1.5 uppercase">Weight (kg)</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl h-14 flex-row items-center px-4">
                                <ScaleIcon size={18} color="#9CA3AF" />
                                <TextInput 
                                    className="flex-1 ml-2 text-base text-secondary font-medium h-full"
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Date Picker */}
                    <View>
                        <Text className="text-xs text-gray-500 font-bold ml-1 mb-1.5 uppercase">Date of Birth</Text>
                        <TouchableOpacity 
                            onPress={() => setShowDatePicker(true)}
                            className="bg-gray-50 border border-gray-200 rounded-2xl h-14 flex-row items-center px-4 active:bg-gray-100"
                        >
                            <CalendarDaysIcon size={20} color="#9CA3AF" />
                            <Text className="ml-3 text-secondary text-base font-medium">
                                {birthDate.toDateString()}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={birthDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>
                    
                    <View className="flex-row gap-4">
                        <View className="flex-1"><InputGroup label="Color" value={color} onChangeText={setColor} /></View>
                        <View className="flex-1"><InputGroup label="Eye Color" value={eyeColor} onChangeText={setEyeColor} /></View>
                    </View>
                    
                    <InputGroup label="Identifying Features" value={features} onChangeText={setFeatures} multiline />
                </View>

                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <Text className="text-lg font-extrabold text-secondary mb-4 opacity-80 ml-1">Lineage</Text>
                    <View className="flex-row gap-4 mb-4">
                        <ParentSelector label="Mother" value={motherId ? cats.find(c => c.id === motherId)?.name : null} onPress={() => openPicker('mother')} />
                        <ParentSelector label="Father" value={fatherId ? cats.find(c => c.id === fatherId)?.name : null} onPress={() => openPicker('father')} />
                    </View>
                </View>

                <View className="flex-row items-center justify-between bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm">
                    <View>
                        <Text className="text-secondary font-bold text-base">Archive Profile</Text>
                        <Text className="text-gray-400 text-xs mt-0.5">Hide from main dashboard</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => setIsArchived(!isArchived)}
                        className={`w-14 h-8 rounded-full justify-center px-1 transition-colors ${isArchived ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                        <View className={`w-6 h-6 bg-white rounded-full shadow-sm ${isArchived ? 'self-end' : 'self-start'}`} />
                    </TouchableOpacity>
                </View>
                
                <Button title="Save Changes" onPress={handleUpdate} loading={loading} className="mb-4 shadow-lg shadow-primary/30" />
            </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </View>

       <Modal visible={pickerVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/60 justify-end">
              <View className="bg-gray-50 rounded-t-[35px] h-3/4 overflow-hidden">
                   <View className="bg-white p-6 border-b border-gray-100 items-center rounded-t-[35px]">
                      <View className="w-12 h-1.5 bg-gray-200 rounded-full mb-4" />
                      <Text className="text-xl font-bold text-secondary">Select {pickerType === 'mother' ? 'Mother' : 'Father'}</Text>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                      <TouchableOpacity 
                          onPress={() => {
                             if(pickerType === 'mother') setMotherId(null);
                             else setFatherId(null);
                             setPickerVisible(false);
                          }}
                          className="bg-white p-4 rounded-2xl mb-3 border border-red-100 flex-row items-center justify-center"
                      >
                          <Text className="text-red-400 font-bold">Clear Selection</Text>
                      </TouchableOpacity>
                      {potentialParents.map(c => (
                           <TouchableOpacity 
                           key={c.id} 
                           onPress={() => selectParent(c.id)}
                           className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 flex-row items-center shadow-sm"
                       >
                            <Image source={{ uri: c.photoUrl || 'https://placekitten.com/50/50' }} className="w-14 h-14 rounded-full bg-gray-100 mr-4" />
                           <Text className="text-lg font-bold text-secondary">{c.name}</Text>
                       </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <View className="p-6 bg-white border-t border-gray-100">
                      <Button title="Close" onPress={() => setPickerVisible(false)} variant="secondary" />
                  </View>
              </View>
          </View>
      </Modal>
    </View>
  );
};

// Reusable Inputs (Same as AddCatScreen for consistency)
const InputGroup = ({ label, value, onChangeText, placeholder, keyboardType, multiline }: any) => (
    <View>
        <Text className="text-xs text-gray-500 font-bold ml-1 mb-1.5 uppercase">{label}</Text>
        <TextInput 
            className={`bg-gray-50 border border-gray-200 rounded-2xl px-5 text-base text-secondary font-medium ${multiline ? 'h-24 py-3' : 'h-14'}`}
            value={value} 
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
        />
    </View>
);

const ParentSelector = ({ label, value, onPress }: any) => (
    <View className="flex-1">
         <Text className="text-xs text-gray-500 mb-1.5 font-bold uppercase ml-1">{label}</Text>
         <TouchableOpacity onPress={onPress} className="bg-gray-50 border border-gray-200 rounded-2xl h-14 justify-center px-4 active:bg-gray-100">
            <Text className={`text-base font-semibold ${value ? 'text-primary' : 'text-gray-300'}`} numberOfLines={1}>
                 {value || 'Select'}
            </Text>
         </TouchableOpacity>
    </View>
);
