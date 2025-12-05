
import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity, ScrollView as RNScrollView, Image as RNImage, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, SparklesIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const Image = RNImage as any;
const ScrollView = RNScrollView as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

const CATEGORIES = ['Food', 'Medication', 'Toy', 'Litter', 'Grooming', 'Other'];

export const AddInventoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { cats, fetchCats } = useCats();
  const { item } = (route.params as any) || {};

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [threshold, setThreshold] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
      fetchCats(); 
      if(item) {
          setName(item.name);
          setCategory(item.category);
          setQuantity(String(item.quantity));
          setUnit(item.unit);
          setThreshold(item.threshold ? String(item.threshold) : '');
          if(item.cats) setSelectedCatIds(item.cats.map((c: any) => c.id));
      }
  }, []);

  const toggleCat = (id: string) => {
      if (selectedCatIds.includes(id)) {
          setSelectedCatIds(prev => prev.filter(c => c !== id));
      } else {
          setSelectedCatIds(prev => [...prev, id]);
      }
  };

  const toggleSelectAll = () => {
      if (selectedCatIds.length === cats.length) {
          setSelectedCatIds([]);
      } else {
          setSelectedCatIds(cats.map(c => c.id));
      }
  };

  const calculateSmartThreshold = () => {
      if (category !== 'Food' || selectedCatIds.length === 0) {
          Alert.alert("Smart Calc", "Select 'Food' and at least one cat to calculate.");
          return;
      }

      // Logic: 3% of body weight per day * 7 days buffer
      let totalWeight = 0;
      let unknownWeights = 0;

      selectedCatIds.forEach(id => {
          const cat = cats.find(c => c.id === id);
          if (cat && cat.weight) {
              totalWeight += cat.weight;
          } else {
              unknownWeights++;
          }
      });

      if (unknownWeights > 0 && totalWeight === 0) {
          Alert.alert("Data Missing", "Please add weights to your cat profiles first.");
          return;
      }

      const dailyIntakeKg = totalWeight * 0.03; // 3%
      const weeklyBuffer = dailyIntakeKg * 7;
      
      setThreshold(weeklyBuffer.toFixed(1));
      setUnit('kg');
      Alert.alert("Calculated", `Based on ${totalWeight.toFixed(1)}kg total cat weight, a safe buffer is ~${weeklyBuffer.toFixed(1)}kg (1 week supply).`);
  };

  const handleSave = async () => {
      if(!name) return Alert.alert("Error", "Item Name is required.");
      if(!quantity) return Alert.alert("Error", "Quantity is required.");

      setLoading(true);
      const payload = {
          name,
          category,
          quantity,
          unit,
          threshold,
          catIds: selectedCatIds
      };

      let res;
      if (item) {
          res = await api.put(`/inventory/${item.id}`, payload);
      } else {
          res = await api.post('/inventory', payload);
      }

      setLoading(false);
      if(res.success) navigation.goBack();
      else Alert.alert("Error", "Failed to save item.");
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary shadow-sm z-10">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">{item ? 'Edit Item' : 'Add Item'}</Text>
            <View className="w-10" />
          </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            
            {/* Input Group */}
            <View className="gap-5">
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Item Name</Text>
                    <TextInput 
                        className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary"
                        value={name} onChangeText={setName} placeholder="e.g. Dry Food" 
                    />
                </View>

                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Category</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity 
                                key={cat}
                                onPress={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-xl border ${category === cat ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-bold ${category === cat ? 'text-white' : 'text-gray-500'}`}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Quantity</Text>
                        <TextInput 
                            className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary"
                            value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" 
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Unit</Text>
                        <TextInput 
                            className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary"
                            value={unit} onChangeText={setUnit} placeholder="kg, pcs..." 
                        />
                    </View>
                </View>

                {/* Cat Selector */}
                <View>
                    <View className="flex-row justify-between items-end mb-3 mt-2">
                        <Text className="text-gray-500 font-bold text-xs uppercase ml-1">Associated Cats</Text>
                        <TouchableOpacity onPress={toggleSelectAll}>
                            <Text className="text-primary font-bold text-xs">
                                {selectedCatIds.length === cats.length ? 'Deselect All' : 'Select All'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                        {cats.map((cat: any) => {
                            const isSelected = selectedCatIds.includes(cat.id);
                            return (
                                <TouchableOpacity 
                                    key={cat.id} 
                                    onPress={() => toggleCat(cat.id)}
                                    className={`mr-4 items-center relative`}
                                >
                                    <View className={`w-16 h-16 rounded-full p-0.5 ${isSelected ? 'bg-primary border-2 border-primary' : 'bg-gray-100'}`}>
                                        <Image source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} className="w-full h-full rounded-full" />
                                    </View>
                                    {isSelected && (
                                        <View className="absolute top-0 right-0 bg-white rounded-full">
                                            <CheckCircleIconSolid size={20} color="#F5A9C8" />
                                        </View>
                                    )}
                                    <Text className={`mt-2 text-xs font-bold ${isSelected ? 'text-primary' : 'text-gray-400'}`}>{cat.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <View>
                    <View className="flex-row justify-between items-center mb-2 ml-1">
                        <Text className="text-gray-500 font-bold text-xs uppercase">Low Stock Alert Level</Text>
                        {category === 'Food' && (
                            <TouchableOpacity onPress={calculateSmartThreshold} className="flex-row items-center">
                                <SparklesIcon size={14} color="#F5A9C8" />
                                <Text className="text-primary text-[10px] font-bold ml-1">Auto-Calculate</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput 
                        className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary"
                        value={threshold} onChangeText={setThreshold} keyboardType="numeric" placeholder="Alert when below..." 
                    />
                </View>

                <Button title="Save Item" onPress={handleSave} loading={loading} className="mt-4 shadow-lg shadow-primary/20" />
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
