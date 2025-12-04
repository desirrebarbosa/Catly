import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, Modal, Image as RNImage } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CameraIcon, CalendarDaysIcon, ScaleIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';

// NativeWind Casting
const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const Image = RNImage as any;
const useNavigation = (ReactNavigation as any).useNavigation;

export const AddCatScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addCat, cats, fetchCats, isLoading } = useCats();
  
  // Form State
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [isSpayed, setIsSpayed] = useState(false);
  const [features, setFeatures] = useState('');
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [motherId, setMotherId] = useState<string | null>(null);
  const [fatherId, setFatherId] = useState<string | null>(null);
  
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'mother' | 'father'>('mother');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchCats(); }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Missing Info', "Name is required.");
    
    let weightValue = 0;
    if (weight.trim()) {
        const parsed = parseFloat(weight);
        if (isNaN(parsed)) return Alert.alert('Invalid Input', "Weight must be a valid number.");
        weightValue = parsed;
    }

    setIsSubmitting(true);
    try {
      await addCat({ 
          name, nickname, breed, gender, 
          weight: weightValue, 
          birthDate: birthDate.toISOString(),
          color, eyeColor, features,
          isSpayed, motherId, fatherId, photoUrl: photo 
      });
      setIsSubmitting(false);
      Alert.alert('Success', 'Profile created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      setIsSubmitting(false);
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
    <View className="flex-1 bg-white">
      {/* Pink Background Header Layer */}
      <View className="absolute top-0 left-0 right-0 h-[40%] bg-primary rounded-b-[40px]" />

      {/* Navigation Header */}
      <View style={{ paddingTop: insets.top }} className="px-6 pb-4 z-20">
        <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md"
            >
            <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white tracking-wide">Add Profile</Text>
            <View className="w-10" />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 40 }}
        >
            <View className="h-24" /> 

            {/* Main Content Card */}
            <View className="bg-white rounded-t-[40px] px-6 pt-0 shadow-sm min-h-screen">
                
                {/* Floating Avatar */}
                <View className="items-center -mt-16 mb-8">
                    <TouchableOpacity onPress={pickImage} className="active:opacity-80 relative shadow-xl shadow-black/10">
                        <View className="w-32 h-32 rounded-full bg-gray-50 border-[6px] border-white justify-center items-center overflow-hidden">
                            {photo ? (
                                <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <CameraIcon size={40} color="#E5E7EB" />
                            )}
                        </View>
                        <View className="absolute bottom-1 right-1 bg-primary w-9 h-9 rounded-full border-[3px] border-white items-center justify-center shadow-md">
                            <Text className="text-white font-bold text-lg leading-none mb-0.5">+</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View className="gap-6">
                    <View className="gap-4">
                        <SectionTitle title="Identity" />
                        <InputGroup label="Name" value={name} onChangeText={setName} placeholder="e.g. Luna" />
                        <InputGroup label="Nickname" value={nickname} onChangeText={setNickname} placeholder="e.g. Lulu" />
                    </View>

                    <View className="gap-4">
                        <SectionTitle title="Physical Attributes" />
                        
                        <View className="flex-row gap-4">
                            <View className="flex-[1.5]">
                                <InputGroup label="Breed" value={breed} onChangeText={setBreed} placeholder="Siamese" />
                            </View>
                            <View className="flex-1">
                                <Label text="Weight (kg)" />
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 w-full">
                                    <ScaleIcon size={18} color="#9CA3AF" />
                                    <TextInput
                                        className="flex-1 ml-2 text-base text-secondary h-full font-medium"
                                        value={weight}
                                        onChangeText={setWeight}
                                        placeholder="0.0"
                                        keyboardType="numeric"
                                        placeholderTextColor="#D1D5DB"
                                    />
                                </View>
                            </View>
                        </View>

                        <View className="w-full">
                            <Label text="Gender" />
                            <View className="flex-row bg-gray-50 p-1 rounded-2xl border border-gray-100 h-14 w-full">
                                {['Male', 'Female'].map(g => (
                                    <TouchableOpacity 
                                        key={g} 
                                        onPress={() => setGender(g)}
                                        className={`flex-1 justify-center items-center rounded-xl transition-all ${gender === g ? 'bg-white shadow-sm border border-gray-100' : ''}`}
                                    >
                                        <Text className={`font-bold ${gender === g ? 'text-primary' : 'text-gray-400'}`}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="w-full">
                            <Label text="Date of Birth" />
                            <TouchableOpacity 
                                onPress={() => setShowDatePicker(true)}
                                className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 active:bg-gray-100 w-full"
                            >
                                <CalendarDaysIcon size={20} color="#F5A9C8" />
                                <Text className="ml-3 text-secondary text-base font-semibold">
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
                            <View className="flex-1"><InputGroup label="Color" value={color} onChangeText={setColor} placeholder="Calico" /></View>
                            <View className="flex-1"><InputGroup label="Eye Color" value={eyeColor} onChangeText={setEyeColor} placeholder="Green" /></View>
                        </View>

                        <View className="w-full">
                            <Label text="Spayed / Neutered?" />
                            <View className="flex-row bg-gray-50 p-1.5 rounded-2xl border border-gray-100 h-14 w-full">
                                <TouchableOpacity onPress={() => setIsSpayed(true)} className={`flex-1 justify-center items-center rounded-xl ${isSpayed ? 'bg-white shadow-sm border border-gray-100' : ''}`}>
                                    <Text className={`font-bold ${isSpayed ? 'text-primary' : 'text-gray-400'}`}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsSpayed(false)} className={`flex-1 justify-center items-center rounded-xl ${!isSpayed ? 'bg-white shadow-sm border border-gray-100' : ''}`}>
                                    <Text className={`font-bold ${!isSpayed ? 'text-primary' : 'text-gray-400'}`}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <InputGroup label="Identifying Features" value={features} onChangeText={setFeatures} placeholder="White tip on tail..." multiline />
                    </View>

                    <View className="gap-4">
                        <SectionTitle title="Lineage" />
                        <View className="flex-col gap-4 w-full">
                            <ParentSelector 
                                label="Mother" 
                                value={motherId ? cats.find(c => c.id === motherId)?.name : null} 
                                onPress={() => openPicker('mother')} 
                            />
                            <ParentSelector 
                                label="Father" 
                                value={fatherId ? cats.find(c => c.id === fatherId)?.name : null} 
                                onPress={() => openPicker('father')} 
                            />
                        </View>
                    </View>

                    <View className="mt-4 mb-6">
                        <Button title="Create Profile" onPress={handleSubmit} loading={isSubmitting} className="shadow-lg shadow-primary/30" />
                    </View>
                </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={pickerVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-[35px] h-3/4 overflow-hidden">
                  <View className="p-6 border-b border-gray-100 items-center bg-gray-50">
                      <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
                      <Text className="text-xl font-bold text-secondary">Select {pickerType === 'mother' ? 'Mother' : 'Father'}</Text>
                  </View>
                  <ScrollView contentContainerStyle={{ padding: 20 }}>
                      <TouchableOpacity onPress={() => selectParent('')} className="bg-white p-4 rounded-2xl mb-3 flex-row justify-center border-2 border-dashed border-gray-300">
                          <Text className="text-gray-500 font-bold">No Parent / Unknown</Text>
                      </TouchableOpacity>
                      {potentialParents.map(c => (
                           <TouchableOpacity key={c.id} onPress={() => selectParent(c.id)} className="bg-white p-3 rounded-2xl mb-3 flex-row items-center border border-gray-100 shadow-sm">
                               <Image source={{ uri: c.photoUrl || 'https://placekitten.com/50/50' }} className="w-12 h-12 rounded-full mr-4 bg-gray-100" />
                               <View>
                                   <Text className="text-base font-bold text-secondary">{c.name}</Text>
                                   <Text className="text-gray-400 text-xs">{c.breed}</Text>
                                </View>
                           </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <View className="p-6 border-t border-gray-100">
                      <Button title="Cancel" onPress={() => setPickerVisible(false)} variant="secondary" />
                  </View>
              </View>
          </View>
      </Modal>
    </View>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1 ml-1">{title}</Text>
);

const Label = ({ text }: { text: string }) => (
    <Text className="text-xs font-bold text-gray-500 mb-2 ml-1 uppercase">{text}</Text>
);

const InputGroup = ({ label, value, onChangeText, placeholder, keyboardType, multiline }: any) => (
    <View className="w-full">
        <Label text={label} />
        <TextInput 
            className={`bg-gray-50 border border-gray-100 rounded-2xl px-4 text-base text-secondary font-medium w-full ${multiline ? 'h-28 py-4 leading-5' : 'h-14'}`}
            value={value} 
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#D1D5DB"
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
        />
    </View>
);

const ParentSelector = ({ label, value, onPress }: any) => (
    <View className="w-full">
         <Label text={label} />
         <TouchableOpacity 
            onPress={onPress} 
            className="bg-gray-50 border border-gray-100 rounded-2xl h-14 justify-center px-4 active:bg-gray-100 w-full"
         >
            <Text className={`text-base font-semibold ${value ? 'text-primary' : 'text-gray-300'}`} numberOfLines={1}>
                 {value || 'Select'}
            </Text>
         </TouchableOpacity>
    </View>
);
