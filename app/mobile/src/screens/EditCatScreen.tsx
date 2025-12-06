
import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, TouchableOpacity as RNTouchableOpacity, Modal, Image as RNImage } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, CameraIcon, CalendarDaysIcon, ScaleIcon } from 'react-native-heroicons/outline';
import { PencilIcon } from 'react-native-heroicons/solid';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';

// Casting for NativeWind
const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const Image = RNImage as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

export const EditCatScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { cat } = (route.params as any);
  const { updateCat, cats, fetchCats } = useCats();

  // State
  const [name, setName] = useState(cat.name);
  const [nickname, setNickname] = useState(cat.nickname || '');
  const [breed, setBreed] = useState(cat.breed || '');
  const [weight, setWeight] = useState(cat.weight ? String(cat.weight) : '');
  const [gender, setGender] = useState(cat.gender || 'Male');
  const [birthDate, setBirthDate] = useState(cat.birthDate ? new Date(cat.birthDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [color, setColor] = useState(cat.color || '');
  const [eyeColor, setEyeColor] = useState(cat.eyeColor || '');
  const [isSpayed, setIsSpayed] = useState(cat.isSpayed || false);
  const [features, setFeatures] = useState(cat.features || '');
  const [isArchived, setIsArchived] = useState(cat.isArchived || false);
  const [photo, setPhoto] = useState<string | null>(cat.photoUrl || null);
  
  const [motherId, setMotherId] = useState<string | null>(cat.motherId || null);
  const [fatherId, setFatherId] = useState<string | null>(cat.fatherId || null);
  const [loading, setLoading] = useState(false);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'mother' | 'father'>('mother');

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
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
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
          name, nickname, breed, gender,
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
    <View className="flex-1 bg-white">
      {/* Pink Background Header */}
      <View className="absolute top-0 left-0 right-0 h-[40%] bg-primary" />

      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-6 pb-4 z-20">
        <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="w-10 h-10 bg-white/20 items-center justify-center rounded-2xl backdrop-blur-md"
            >
                <ChevronLeftIcon size={24} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold tracking-wide">Edit Profile</Text>
            <View className="w-10" />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 40 }}
        >
            <View className="h-24" />

            {/* Main Card */}
            <View className="bg-white rounded-t-[40px] px-6 pt-0 shadow-sm min-h-screen">
                
                {/* Floating Avatar (Negative Margin Flow) */}
                <View className="items-center -mt-16 mb-8">
                    <TouchableOpacity onPress={pickImage} className="active:opacity-90 relative shadow-xl shadow-black/10">
                        <View className="w-32 h-32 rounded-full bg-gray-50 border-[6px] border-white justify-center items-center overflow-hidden">
                            {photo ? (
                                <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <CameraIcon size={40} color="#D1D5DB" />
                            )}
                        </View>
                        <View className="absolute bottom-1 right-1 bg-secondary w-9 h-9 rounded-2xl border-[3px] border-white items-center justify-center shadow-md">
                            <PencilIcon size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
        
                <View className="gap-6">
                    {/* Identity */}
                    <View className="gap-4">
                        <SectionTitle title="Identity" />
                        <InputGroup label="Name" value={name} onChangeText={setName} />
                        <InputGroup label="Nickname" value={nickname} onChangeText={setNickname} />
                    </View>
                    
                    {/* Appearance */}
                    <View className="">
                        <SectionTitle title="Appearance" />
                        
                        <View className="flex-row gap-2">
                            <View className="flex-[1.5]">
                                <InputGroup label="Breed" value={breed} onChangeText={setBreed} />
                            </View>
                            <View className="flex-1">
                                <Label text="Weight (kg)" />
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 w-full">
                                    <ScaleIcon size={18} color="#9CA3AF" />
                                    <TextInput 
                                        className="flex-1 ml-2 text-base text-secondary h-full font-medium"
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Gender */}
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

                        {/* DOB */}
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
                                <Modal visible={showDatePicker} transparent animationType="fade">
                                    <View className="flex-1 justify-center bg-black/50 px-6">
                                        <View className="bg-white rounded-3xl p-4">
                                            <DateTimePicker
                                                value={birthDate}
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
                        </View>
                        
                        <View className="flex-row gap-4">
                            <View className="flex-1"><InputGroup label="Color" value={color} onChangeText={setColor} /></View>
                            <View className="flex-1"><InputGroup label="Eye Color" value={eyeColor} onChangeText={setEyeColor} /></View>
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
                        
                        <InputGroup label="Bio & Features (Notes)" value={features} onChangeText={setFeatures} multiline placeholder="Behavior, habits, identifying marks..." />
                    </View>

                    {/* Family - Vertical Stack */}
                    <View className="">
                        <SectionTitle title="Lineage" />
                        <View className="">
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

                    {/* Archive Switch */}
                    <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-3xl border border-gray-100 mt-2">
                        <View>
                            <Text className="text-secondary font-bold text-base">Archive Profile</Text>
                            <Text className="text-gray-400 text-xs mt-0.5">Hide from active dashboard</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => setIsArchived(!isArchived)}
                            className={`w-14 h-8 rounded-full justify-center px-1 transition-colors ${isArchived ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                            <View className={`w-6 h-6 bg-white rounded-full shadow-sm ${isArchived ? 'self-end' : 'self-start'}`} />
                        </TouchableOpacity>
                    </View>
                    
                    <View className="mt-4 mb-6">
                        <Button title="Save Changes" onPress={handleUpdate} loading={loading} className="shadow-lg shadow-primary/30" />
                    </View>
                </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>

       {/* Parent Picker Modal */}
       <Modal visible={pickerVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-[35px] h-3/4 overflow-hidden">
                   <View className="p-6 border-b border-gray-100 items-center bg-gray-50">
                      <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
                      <Text className="text-xl font-bold text-secondary">Select {pickerType === 'mother' ? 'Mother' : 'Father'}</Text>
                  </View>
                  <ScrollView contentContainerStyle={{ padding: 20 }}>
                      <TouchableOpacity onPress={() => selectParent('')} className="bg-white p-4 rounded-2xl mb-3 border-2 border-dashed border-gray-300 items-center">
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
                      <Button title="Close" onPress={() => setPickerVisible(false)} variant="secondary" />
                  </View>
              </View>
          </View>
      </Modal>
    </View>
  );
};

// Reusable Components
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
         <TouchableOpacity onPress={onPress} className="bg-gray-50 border border-gray-100 rounded-2xl h-14 justify-center px-4 active:bg-gray-100 w-full">
            <Text className={`text-base font-semibold ${value ? 'text-primary' : 'text-gray-300'}`} numberOfLines={1}>
                 {value || 'Select'}
            </Text>
         </TouchableOpacity>
    </View>
);
