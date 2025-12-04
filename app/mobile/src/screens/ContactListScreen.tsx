import React, { useState, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert, Linking } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon, PhoneIcon, TrashIcon, UserGroupIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;
const FlatList = RNFlatList as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

export const ContactListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);

  const fetchContacts = async () => {
    const res = await api.get('/contacts');
    if(res.success) setContacts(res.data.contacts);
  };

  useFocusEffect(useCallback(() => { fetchContacts(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete Contact', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await api.delete(`/contacts/${id}`);
          fetchContacts();
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between">
       <View className="flex-1">
          <Text className="text-secondary font-bold text-lg">{item.name}</Text>
          <Text className="text-primary font-bold text-xs uppercase mb-1">{item.role}</Text>
          <Text className="text-gray-400 text-sm">{item.phone}</Text>
       </View>
       <View className="flex-row gap-2">
           <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} className="bg-green-100 p-2.5 rounded-full">
               <PhoneIcon size={20} color="#16A34A" />
           </TouchableOpacity>
           <TouchableOpacity onPress={() => handleDelete(item.id)} className="bg-gray-100 p-2.5 rounded-full">
               <TrashIcon size={20} color="#9CA3AF" />
           </TouchableOpacity>
       </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="px-6 pb-4 bg-primary z-10 shadow-sm">
          <View className="h-14 flex-row items-center justify-between">
             <Text className="text-white text-xl font-bold tracking-wide">Contacts</Text>
             <TouchableOpacity 
                onPress={() => navigation.navigate('AddContact')} 
                className="w-10 h-10 bg-white items-center justify-center rounded-full shadow-sm active:bg-gray-50"
             >
                <PlusIcon color="#F5A9C8" size={24} strokeWidth={2.5} />
             </TouchableOpacity>
          </View>
      </View>
      <View className="flex-1 bg-gray-50 pt-6 px-6">
        <FlatList 
            data={contacts} 
            keyExtractor={(item: any) => item.id} 
            renderItem={renderItem}
            ListEmptyComponent={
                <View className="items-center mt-20 opacity-50">
                    <UserGroupIcon size={50} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-2 font-medium">No contacts saved.</Text>
                </View>
            }
        />
      </View>
    </View>
  );
};
