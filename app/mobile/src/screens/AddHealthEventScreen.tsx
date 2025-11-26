import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, ScrollView, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button } from '../components/ui/Button';
import api from '../services/api';

// Cast components to allow 'className' prop for NativeWind
const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;

export const AddHealthEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { catName, catId } = route.params || { catName: 'Cat' };

  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Missing Info', 'Please enter symptoms/notes.');
      return;
    }

    setLoading(true);
    try {
      // Create a title from the first few words of symptoms if specific title not provided
      const title = symptoms.split(' ').slice(0, 3).join(' ') + '...';
      
      await api.post(`/cats/${catId}/health`, {
        title: title,
        eventType: 'Illness', // Default for this screen
        notes: symptoms,
        diagnosis: 'Observation',
        date: new Date().toISOString()
      });
      
      Alert.alert('Saved', 'Health event recorded.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-primary">
      <View className="h-28 justify-end px-6 pb-4">
        <Text className="text-white text-2xl font-bold opacity-80" onPress={() => navigation.goBack()}>← Back</Text>
      </View>
      
      <View className="flex-1 bg-white rounded-t-[30px] overflow-hidden">
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text className="text-2xl font-bold text-secondary mb-2">Health Log</Text>
          <Text className="text-gray-500 mb-6">Recording event for {catName}</Text>

          <Text className="text-secondary font-bold mb-2 ml-1">Symptoms / Notes</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-base text-secondary h-32 mb-8"
            placeholder="Describe what's happening..."
            multiline
            textAlignVertical="top"
            value={symptoms}
            onChangeText={setSymptoms}
          />

          <Button 
            title="Save Record" 
            onPress={handleSave} 
            loading={loading} 
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};