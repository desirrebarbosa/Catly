
import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

const ROLES = ['Veterinarian', 'Breeder', 'Sitter', 'Owner', 'Other'];

export const AddContactScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const { contact } = (route.params as any) || {};

  const [name, setName] = useState('');
  const [role, setRole] = useState('Veterinarian');
  const [customRole, setCustomRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone || '');
      setEmail(contact.email || '');
      
      if (ROLES.includes(contact.role)) {
          setRole(contact.role);
      } else {
          setRole('Other');
          setCustomRole(contact.role);
      }
    }
  }, [contact]);

  const handleSave = async () => {
      if(!name) return Alert.alert("Error", "Name is required");
      
      const finalRole = role === 'Other' ? (customRole || 'Other') : role;

      setLoading(true);
      
      let res;
      const payload = { name, role: finalRole, phone, email };

      if (contact) {
          res = await api.put(`/contacts/${contact.id}`, payload);
      } else {
          res = await api.post('/contacts', payload);
      }

      setLoading(false);
      if(res.success) navigation.goBack();
      else Alert.alert("Error", "Failed to save");
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary shadow-sm z-10">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">{contact ? 'Edit Contact' : 'New Contact'}</Text>
            <View className="w-10" />
          </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View className="gap-6">
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Name</Text>
                    <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary" value={name} onChangeText={setName} />
                </View>
                
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Role</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {ROLES.map(r => (
                            <TouchableOpacity 
                                key={r} 
                                onPress={() => setRole(r)}
                                className={`px-4 py-2 rounded-xl border ${role === r ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-bold ${role === r ? 'text-white' : 'text-gray-500'}`}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {role === 'Other' && (
                        <TextInput 
                            className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary mt-3" 
                            placeholder="Specify Role..."
                            value={customRole} 
                            onChangeText={setCustomRole} 
                        />
                    )}
                </View>

                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Phone</Text>
                    <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2 ml-1">Email</Text>
                    <TextInput className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
                <Button title={contact ? "Update Contact" : "Save Contact"} onPress={handleSave} loading={loading} className="mt-4" />
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
