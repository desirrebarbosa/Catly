import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, Modal, Image as RNImage } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CameraIcon, CalendarDaysIcon, ScaleIcon } from 'react-native-heroicons/outline';
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

export const AddCatScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addCat, cats, fetchCats, isLoading } = useCats();
  
  // Fields
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
      weightValue = parseFloat(weight);
      if (isNaN(weightValue)) return Alert.alert('Invalid Input', "Weight must be a number.");
    }

    try {
      await addCat({ 
          name, nickname, breed, gender, 
          weight: weightValue, 
          birthDate: birthDate.toISOString(),
          color, eyeColor, features,
          isSpayed, motherId, fatherId, photoUrl: photo 
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
      pickerType === 'mother' ? setMotherId(catId) : setFatherId(catId);
      setPickerVisible(false);
  };

  const potentialParents = cats.filter(c => 
      pickerType === 'mother' ? c.gender === 'Female' : c.gender === 'Male'
  );

  return (
    <View className="flex-1 bg-primary">
      {/* Header */}
      <View 
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }} 
        className="px-5 flex-row items-center justify-between z-10"
      >
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="bg-white/20 p-2 rounded-xl backdrop-blur-md"
        >
          <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-white tracking-wide">Add Profile</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 bg-gray-50 rounded-t-[35px] mt-2 overflow-hidden shadow-2xl">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            
            {/* Photo Uploader */}
            <View className="items-center -mt-12 mb-8 z-20">
              <TouchableOpacity onPress={pickImage} className="relative shadow-lg active:scale-95 transition-transform">
                <View className="w-32 h-32 rounded-full bg-white border-4 border-gray-50 justify-center items-center overflow-hidden">
                  {photo ? (
                    <Image source={{ uri: photo }} className="w-full h-full" />
                  ) : (
                    <CameraIcon size={36} color="#E5E7EB" />
                  )}
                </View>
                <View className="absolute bottom-1 right-1 bg-primary w-9 h-9 rounded-full justify-center items-center border-2 border-white shadow-sm">
                  <Text className="text-white font-bold text-xl leading-none pb-0.5">+</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="gap-6">
                <SectionHeader title="Identity" />
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 gap-4">
                    <InputGroup label="Name" value={name} onChangeText={setName} placeholder="e.g. Luna" />
                    <InputGroup label="Nickname" value={nickname} onChangeText={setNickname} placeholder="e.g. Lulu" />
                </View>

                <SectionHeader title="Physical Attributes" />
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 gap-4">
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <InputGroup label="Breed" value={breed} onChangeText={setBreed} placeholder="Siamese" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 font-bold ml-1 mb-1.5 uppercase">Weight (kg)</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl h-14 flex-row items-center px-4">
                                <ScaleIcon size={18} color="#9CA3AF" />
                                <TextInput 
                                    className="flex-1 ml-2 text-base text-secondary font-medium h-full"
                                    value={weight}
                                    onChangeText={setWeight}
                                    placeholder="0.0"
                                    placeholderTextColor="#D1D5DB"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Gender Selection */}
                    <View>
                        <Text className="text-xs text-gray-500 font-bold ml-1 mb-2 uppercase">Gender</Text>
                        <View className="flex-row bg-gray-50 p-1 rounded-2xl border border-gray-200">
                            {['Male', 'Female'].map(g => (
                                <TouchableOpacity 
                                    key={g} 
                                    onPress={() => setGender(g)}
                                    className={`flex-1 py-3 rounded-xl ${gender === g ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                                >
                                    <Text className={`text-center font-bold text-sm ${gender === g ? 'text-primary' : 'text-gray-400'}`}>{g}</Text>
                                </TouchableOpacity>
                            ))}
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
                        <View className="flex-1">
                             <InputGroup label="Color" value={color} onChangeText={setColor} placeholder="Calico" />
                        </View>
                        <View className="flex-1">
                             <InputGroup label="Eye Color" value={eyeColor} onChangeText={setEyeColor} placeholder="Green" />
                        </View>
                    </View>

                    <View>
                        <Text className="text-xs text-gray-500 font-bold ml-1 mb-2 uppercase">Spayed / Neutered?</Text>
                        <View className="flex-row bg-gray-50 p-1 rounded-2xl border border-gray-200">
                            <TouchableOpacity onPress={() => setIsSpayed(true)} className={`flex-1 py-3 rounded-xl ${isSpayed ? 'bg-white shadow-sm' : ''}`}>
                                <Text className={`text-center font-bold text-sm ${isSpayed ? 'text-green-500' : 'text-gray-400'}`}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsSpayed(false)} className={`flex-1 py-3 rounded-xl ${!isSpayed ? 'bg-white shadow-sm' : ''}`}>
                                <Text className={`text-center font-bold text-sm ${!isSpayed ? 'text-red-400' : 'text-gray-400'}`}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <InputGroup 
                        label="Identifying Features" 
                        value={features} 
                        onChangeText={setFeatures} 
                        placeholder="e.g. White tip on tail"
                        multiline={true}
                    />
                </View>

                <SectionHeader title="Lineage" />
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 gap-4">
                     <View className="flex-row gap-4">
                        <ParentSelector label="Mother" value={motherId ? cats.find(c => c.id === motherId)?.name : null} onPress={() => openPicker('mother')} />
                        <ParentSelector label="Father" value={fatherId ? cats.find(c => c.id === fatherId)?.name : null} onPress={() => openPicker('father')} />
                     </View>
                </View>

                <Button title="Save Profile" onPress={handleSubmit} loading={isLoading} className="mt-4 mb-10 shadow-lg shadow-primary/30" />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Parent Picker Modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/60 justify-end">
              <View className="bg-gray-50 rounded-t-[35px] h-3/4 overflow-hidden">
                  <View className="bg-white p-6 border-b border-gray-100 items-center rounded-t-[35px]">
                      <View className="w-12 h-1.5 bg-gray-200 rounded-full mb-4" />
                      <Text className="text-xl font-bold text-secondary">Select {pickerType === 'mother' ? 'Mother' : 'Father'}</Text>
                  </View>
                  
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                      <TouchableOpacity onPress={() => { selectParent(''); }} className="bg-white p-4 rounded-2xl mb-3 border border-red-100 flex-row items-center justify-center">
                          <Text className="text-red-400 font-bold">No Parent / Clear</Text>
                      </TouchableOpacity>
                      
                      {potentialParents.map(cat => (
                           <TouchableOpacity key={cat.id} onPress={() => selectParent(cat.id)} className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 flex-row items-center shadow-sm">
                               <Image source={{ uri: cat.photoUrl || 'https://placekitten.com/50/50' }} className="w-14 h-14 rounded-full bg-gray-100 mr-4" />
                               <View>
                                   <Text className="text-lg font-bold text-secondary">{cat.name}</Text>
                                   <Text className="text-sm text-gray-400">{cat.breed} • {cat.gender}</Text>
                               </View>
                           </TouchableOpacity>
                      ))}
                      {potentialParents.length === 0 && (
                          <Text className="text-center text-gray-400 mt-10">No eligible {pickerType}s found.</Text>
                      )}
                  </ScrollView>
                  <View className="p-6 bg-white border-t border-gray-100">
                      <Button title="Cancel" onPress={() => setPickerVisible(false)} variant="secondary" />
                  </View>
              </View>
          </View>
      </Modal>
    </View>
  );
};

// --- Reusable Components for Consistency ---

const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-lg font-extrabold text-secondary ml-2 tracking-tight opacity-80">{title}</Text>
);

const InputGroup = ({ label, value, onChangeText, placeholder, keyboardType, multiline }: any) => (
    <View>
        <Text className="text-xs text-gray-500 font-bold ml-1 mb-1.5 uppercase">{label}</Text>
        <TextInput 
            className={`bg-gray-50 border border-gray-200 rounded-2xl px-5 text-base text-secondary font-medium ${multiline ? 'h-28 py-4' : 'h-14'}`}
            placeholder={placeholder} 
            placeholderTextColor="#D1D5DB"
            value={value} 
            onChangeText={onChangeText}
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
