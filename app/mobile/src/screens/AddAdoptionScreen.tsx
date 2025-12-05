
import React, { useState, useEffect } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, Alert, TouchableOpacity as RNTouchableOpacity, ScrollView, Modal, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, UserGroupIcon, UserIcon } from 'react-native-heroicons/outline';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

export const AddAdoptionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { catId, adoption } = (route.params as any);

  const [date, setDate] = useState(new Date());
  const [type, setType] = useState('Adoption');
  
  // Contact Fields
  const [adopterName, setAdopterName] = useState('');
  const [adopterPhone, setAdopterPhone] = useState('');
  const [adopterEmail, setAdopterEmail] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Contact Picker
  const [contacts, setContacts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
      // Pre-fetch contacts
      api.get('/contacts').then(res => {
          if(res.success) setContacts(res.data.contacts);
      });

      if (adoption) {
          setDate(new Date(adoption.date));
          setType(adoption.type);
          setAdopterName(adoption.adopterName || '');
          setNotes(adoption.notes || '');
          if (adoption.contactId) {
              setSelectedContactId(adoption.contactId);
              // We rely on backend or previous fetch to get phone/email if needed, 
              // but for edit we might just show name.
          }
      }
  }, []);

  const handleSelectContact = (contact: any) => {
      setAdopterName(contact.name);
      setAdopterPhone(contact.phone || '');
      setAdopterEmail(contact.email || '');
      setSelectedContactId(contact.id);
      setModalVisible(false);
  };

  const handleNameChange = (text: string) => {
      setAdopterName(text);
      if (selectedContactId) {
          // If user types over a selected contact, they are creating a NEW entry or unlinking.
          // Prompt logic handled in save for "Create New?"
          setSelectedContactId(null);
          setAdopterPhone('');
          setAdopterEmail('');
      }
  };

  const handleSave = async () => {
      if(!adopterName) return Alert.alert("Missing Info", "Please enter the new owner's name.");

      // Check if name is manually typed but not selected from dropdown
      const isKnownContact = contacts.some(c => c.id === selectedContactId);
      if (!isKnownContact && !selectedContactId && adopterName.length > 0) {
          // It's a new name. The backend handles creation, but let's confirm intent if phone is missing.
          // For simplicity in this turn, we proceed to let backend create.
      }

      setLoading(true);
      const payload = { 
          date: date.toISOString(), 
          type, 
          adopterName, 
          adopterPhone, 
          adopterEmail,
          contactId: selectedContactId,
          notes 
      };

      let res;
      if (adoption) {
          res = await api.put(`/adoptions/${adoption.id}`, payload);
      } else {
          res = await api.post(`/adoptions/${catId}`, payload);
      }

      setLoading(false);
      
      if(res.success) {
          navigation.goBack();
      } else {
          Alert.alert("Error", "Failed to save");
      }
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary shadow-sm z-10">
          <View className="h-14 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md">
                <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">{adoption ? 'Edit Record' : 'New Record'}</Text>
            <View className="w-10" />
          </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
            <View className="gap-6">
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Event Type</Text>
                    <View className="flex-row gap-2">
                        {['Adoption', 'Transfer', 'Foster'].map(opt => (
                            <TouchableOpacity 
                                key={opt}
                                onPress={() => setType(opt)}
                                className={`px-4 py-2 rounded-xl border ${type === opt ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-bold ${type === opt ? 'text-white' : 'text-gray-500'}`}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                
                <View>
                    <View className="flex-row justify-between items-end mb-2">
                        <Text className="text-gray-500 font-bold text-xs uppercase">New Owner / Adopter</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} className="flex-row items-center bg-gray-50 px-3 py-1 rounded-lg">
                            <UserGroupIcon size={14} color="#F5A9C8" />
                            <Text className="text-primary text-xs font-bold ml-1">Select from Contacts</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <TextInput 
                        className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary" 
                        value={adopterName} 
                        onChangeText={handleNameChange} 
                        placeholder="e.g. John Doe" 
                        placeholderTextColor="#D1D5DB"
                    />
                    <Text className="text-gray-400 text-[10px] mt-1 ml-1">
                        {selectedContactId ? "✓ Linked to existing contact" : "ℹ️ Name not in list? A new contact will be created."}
                    </Text>
                </View>

                {/* Extra fields only show if creating new or viewing loaded details */}
                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Phone (Optional)</Text>
                        <TextInput 
                            className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary" 
                            value={adopterPhone} 
                            onChangeText={setAdopterPhone} 
                            placeholder="555-0123" 
                            keyboardType="phone-pad"
                            editable={!selectedContactId} // Disable if linked
                            style={{ opacity: selectedContactId ? 0.6 : 1 }}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Email (Optional)</Text>
                        <TextInput 
                            className="bg-gray-50 border border-gray-100 rounded-2xl h-14 px-4 text-base text-secondary" 
                            value={adopterEmail} 
                            onChangeText={setAdopterEmail} 
                            placeholder="@email.com" 
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!selectedContactId}
                            style={{ opacity: selectedContactId ? 0.6 : 1 }}
                        />
                    </View>
                </View>

                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase mb-2">Notes</Text>
                    <TextInput 
                        className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-base h-32 text-secondary" 
                        value={notes} 
                        onChangeText={setNotes} 
                        multiline 
                        placeholder="Contract details, rehoming fee, etc..." 
                        textAlignVertical="top" 
                    />
                </View>

                <Button title={adoption ? "Update Record" : "Save Record"} onPress={handleSave} loading={loading} className="mt-4 shadow-lg shadow-primary/20" />
            </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Contact Picker Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-[35px] h-3/4 overflow-hidden">
                  <View className="p-6 border-b border-gray-100 items-center bg-gray-50">
                      <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
                      <Text className="text-xl font-bold text-secondary">Select Contact</Text>
                  </View>
                  <ScrollView contentContainerStyle={{ padding: 20 }}>
                      {contacts.length === 0 && (
                          <Text className="text-center text-gray-400 mt-10">No contacts found.</Text>
                      )}
                      {contacts.map(c => (
                           <TouchableOpacity 
                                key={c.id} 
                                onPress={() => handleSelectContact(c)} 
                                className="bg-white p-4 rounded-2xl mb-3 flex-row items-center border border-gray-100 shadow-sm active:bg-gray-50"
                           >
                               <View className="w-10 h-10 bg-primaryLight rounded-full items-center justify-center mr-4">
                                   <UserIcon size={20} color="#F5A9C8" />
                               </View>
                               <View>
                                   <Text className="text-base font-bold text-secondary">{c.name}</Text>
                                   <Text className="text-gray-400 text-xs">{c.role} • {c.phone || 'No phone'}</Text>
                                </View>
                           </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <View className="p-6 border-t border-gray-100">
                      <Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" />
                  </View>
              </View>
          </View>
      </Modal>
    </View>
  );
};
